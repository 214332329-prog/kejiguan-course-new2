/**
 * 本地小模型管理器
 * 提供统一的模型调用接口、状态监控、错误处理和重试机制
 */

interface ModelConfig {
  apiUrl: string
  modelName: string
  timeout: number
  maxRetries: number
  retryDelay: number
  maxConcurrent: number
  rateLimitPerMinute: number
}

interface ModelStatus {
  isOnline: boolean
  lastCheckTime: number
  responseTime: number
  errorCount: number
  successCount: number
  totalRequests: number
  averageResponseTime: number
  cpuUsage?: number
  memoryUsage?: number
  gpuUsage?: number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ModelResponse {
  success: boolean
  data?: {
    content: string
    usage: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
  error?: string
  responseTime: number
  timestamp: number
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  error?: string
}

class ModelManager {
  private config: ModelConfig
  private status: ModelStatus
  private requestQueue: Array<() => Promise<void>> = []
  private activeRequests: number = 0
  private requestTimestamps: number[] = []
  private apiKey: string

  constructor(config: Partial<ModelConfig> = {}) {
    this.config = {
      apiUrl: process.env.MODEL_API_URL || 'http://localhost:11434/api/chat',
      modelName: process.env.MODEL_NAME || 'qwen3:8b',
      timeout: parseInt(process.env.MODEL_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.MODEL_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.MODEL_RETRY_DELAY || '1000'),
      maxConcurrent: parseInt(process.env.MODEL_MAX_CONCURRENT || '5'),
      rateLimitPerMinute: parseInt(process.env.MODEL_RATE_LIMIT || '60'),
      ...config
    }

    this.apiKey = process.env.MODEL_API_KEY || ''

    this.status = {
      isOnline: false,
      lastCheckTime: 0,
      responseTime: 0,
      errorCount: 0,
      successCount: 0,
      totalRequests: 0,
      averageResponseTime: 0
    }

    // 启动健康检查
    this.startHealthCheck()

    // 立即执行一次健康检查
    this.performInitialHealthCheck()
  }

  /**
   * 执行初始健康检查
   */
  private async performInitialHealthCheck(): Promise<void> {
    try {
      const result = await this.healthCheck()
      this.status.lastCheckTime = Date.now()
      this.status.isOnline = result.status === 'healthy'
      this.status.responseTime = result.responseTime
      console.log(`[ModelManager] Initial health check: ${result.status}, response time: ${result.responseTime}ms`)
    } catch (error) {
      console.error('[ModelManager] Initial health check failed:', error)
    }
  }

  /**
   * 健康检查
   * 使用 Ollama 的 /api/tags 端点检查服务状态
   */
  private async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      // 使用 Ollama 的 tags API 检查服务状态
      const baseUrl = this.config.apiUrl.replace('/api/chat', '')
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseTime = Date.now() - startTime

      if (response.ok) {
        return { status: 'healthy', responseTime }
      } else {
        return { status: 'degraded', responseTime, error: `HTTP ${response.status}` }
      }
    } catch (error: any) {
      return { status: 'unhealthy', responseTime: Date.now() - startTime, error: error.message }
    }
  }

  /**
   * 启动定期健康检查
   */
  private startHealthCheck(): void {
    const checkInterval = 30000 // 30秒检查一次

    setInterval(async () => {
      const result = await this.healthCheck()
      this.status.lastCheckTime = Date.now()
      this.status.isOnline = result.status === 'healthy'
      this.status.responseTime = result.responseTime

      // 获取系统资源使用情况（如果API支持）
      await this.updateResourceUsage()
    }, checkInterval)
  }

  /**
   * 更新资源使用情况
   */
  private async updateResourceUsage(): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/metrics`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (response.ok) {
        const metrics = await response.json()
        this.status.cpuUsage = metrics.cpu_usage
        this.status.memoryUsage = metrics.memory_usage
        this.status.gpuUsage = metrics.gpu_usage
      }
    } catch (error) {
      // 静默处理，不是所有API都支持metrics端点
    }
  }

  /**
   * 获取认证头
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    return headers
  }

  /**
   * 检查速率限制
   */
  private checkRateLimit(): boolean {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // 清理过期的请求记录
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo)

    // 检查是否超过速率限制
    if (this.requestTimestamps.length >= this.config.rateLimitPerMinute) {
      return false
    }

    // 记录当前请求
    this.requestTimestamps.push(now)
    return true
  }

  /**
   * 等待并发槽位
   */
  private async acquireSlot(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeRequests < this.config.maxConcurrent) {
        this.activeRequests++
        resolve()
      } else {
        this.requestQueue.push(() => {
          this.activeRequests++
          resolve()
        })
      }
    })
  }

  /**
   * 释放并发槽位
   */
  private releaseSlot(): void {
    this.activeRequests--
    if (this.requestQueue.length > 0) {
      const nextRequest = this.requestQueue.shift()
      nextRequest?.()
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 执行模型调用（带重试机制）
   */
  private async executeWithRetry(
    messages: ChatMessage[],
    options?: {
      temperature?: number
      max_tokens?: number
    }
  ): Promise<ModelResponse> {
    const startTime = Date.now()
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const requestBody = {
          model: this.config.modelName,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 2048,
          stream: false
        }

        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }

        const data = await response.json()
        const responseTime = Date.now() - startTime

        // 更新统计信息
        this.status.successCount++
        this.status.totalRequests++
        this.updateAverageResponseTime(responseTime)

        return {
          success: true,
          data: {
            content: data.choices?.[0]?.message?.content || data.response || '无响应内容',
            usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          },
          responseTime,
          timestamp: Date.now()
        }

      } catch (error: any) {
        lastError = error

        // 如果是超时错误或网络错误，进行重试
        if (error.name === 'AbortError' || error.message.includes('fetch')) {
          if (attempt < this.config.maxRetries - 1) {
            await this.delay(this.config.retryDelay * Math.pow(2, attempt)) // 指数退避
            continue
          }
        }

        // 其他错误直接抛出
        break
      }
    }

    // 所有重试都失败了
    const responseTime = Date.now() - startTime
    this.status.errorCount++
    this.status.totalRequests++

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      responseTime,
      timestamp: Date.now()
    }
  }

  /**
   * 更新平均响应时间
   */
  private updateAverageResponseTime(newTime: number): void {
    const total = this.status.averageResponseTime * (this.status.totalRequests - 1) + newTime
    this.status.averageResponseTime = total / this.status.totalRequests
  }

  /**
   * 公共API：发送聊天请求
   */
  async chat(
    messages: ChatMessage[],
    options?: {
      temperature?: number
      max_tokens?: number
    }
  ): Promise<ModelResponse> {
    // 检查速率限制
    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        responseTime: 0,
        timestamp: Date.now()
      }
    }

    // 等待并发槽位
    await this.acquireSlot()

    try {
      return await this.executeWithRetry(messages, options)
    } finally {
      this.releaseSlot()
    }
  }

  /**
   * 公共API：获取模型状态
   */
  getStatus(): ModelStatus {
    return { ...this.status }
  }

  /**
   * 公共API：获取配置信息
   */
  getConfig(): ModelConfig {
    return { ...this.config }
  }

  /**
   * 公共API：重置统计信息
   */
  resetStats(): void {
    this.status.errorCount = 0
    this.status.successCount = 0
    this.status.totalRequests = 0
    this.status.averageResponseTime = 0
  }

  /**
   * 公共API：检查模型是否在线
   */
  isOnline(): boolean {
    return this.status.isOnline
  }

  /**
   * 公共API：获取性能指标
   */
  getMetrics() {
    const successRate = this.status.totalRequests > 0
      ? (this.status.successCount / this.status.totalRequests * 100).toFixed(2)
      : '0.00'

    return {
      successRate: `${successRate}%`,
      averageResponseTime: `${this.status.averageResponseTime.toFixed(2)}ms`,
      totalRequests: this.status.totalRequests,
      errorCount: this.status.errorCount,
      successCount: this.status.successCount,
      cpuUsage: this.status.cpuUsage,
      memoryUsage: this.status.memoryUsage,
      gpuUsage: this.status.gpuUsage,
      isOnline: this.status.isOnline,
      lastCheckTime: this.status.lastCheckTime
    }
  }
}

// 创建单例实例
export const modelManager = new ModelManager()

// 导出类型
export type { ModelConfig, ModelStatus, ChatMessage, ModelResponse, HealthCheckResult }
export { ModelManager }

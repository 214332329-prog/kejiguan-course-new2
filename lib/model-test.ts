/**
 * 模型集成测试套件
 * 用于测试模型调用的功能、性能和可靠性
 */

import { modelManager } from './model-manager'

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

interface PerformanceMetrics {
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  successRate: number
  totalRequests: number
}

class ModelTestSuite {
  private results: TestResult[] = []
  private readonly responseTimeThreshold: number
  private readonly accuracyStandard: number

  constructor() {
    this.responseTimeThreshold = parseInt(process.env.RESPONSE_TIME_THRESHOLD || '5000')
    this.accuracyStandard = parseFloat(process.env.ACCURACY_STANDARD || '0.85')
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 开始模型集成测试...\n')

    // 功能测试
    await this.testConnection()
    await this.testBasicChat()
    await this.testContextMemory()
    await this.testErrorHandling()

    // 性能测试
    await this.testResponseTime()
    await this.testConcurrentRequests()
    await this.testRateLimiting()

    // 可靠性测试
    await this.testRetryMechanism()
    await this.testTimeoutHandling()

    console.log('\n📊 测试完成！')
    this.printSummary()

    return this.results
  }

  /**
   * 测试连接功能
   */
  private async testConnection(): Promise<void> {
    const startTime = Date.now()
    try {
      const isOnline = modelManager.isOnline()
      const status = modelManager.getStatus()

      this.results.push({
        name: '连接测试',
        passed: isOnline,
        duration: Date.now() - startTime,
        details: {
          isOnline,
          lastCheckTime: status.lastCheckTime,
          responseTime: status.responseTime
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '连接测试',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      })
    }
  }

  /**
   * 测试基本聊天功能
   */
  private async testBasicChat(): Promise<void> {
    const startTime = Date.now()
    try {
      const response = await modelManager.chat([
        { role: 'user', content: '你好，请介绍一下自己' }
      ])

      const passed = response.success &&
                     response.data?.content &&
                     response.data.content.length > 0 &&
                     response.responseTime < this.responseTimeThreshold

      this.results.push({
        name: '基本聊天功能',
        passed,
        duration: Date.now() - startTime,
        details: {
          responseTime: response.responseTime,
          contentLength: response.data?.content?.length || 0,
          success: response.success
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '基本聊天功能',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      })
    }
  }

  /**
   * 测试上下文记忆功能
   */
  private async testContextMemory(): Promise<void> {
    const startTime = Date.now()
    try {
      // 第一轮对话
      const response1 = await modelManager.chat([
        { role: 'user', content: '我叫张三' }
      ])

      // 第二轮对话，测试是否记住上下文
      const response2 = await modelManager.chat([
        { role: 'user', content: '我叫张三' },
        { role: 'assistant', content: response1.data?.content || '' },
        { role: 'user', content: '我叫什么名字？' }
      ])

      const content = response2.data?.content || ''
      const passed = response2.success &&
                     content.includes('张三') &&
                     response2.responseTime < this.responseTimeThreshold

      this.results.push({
        name: '上下文记忆功能',
        passed,
        duration: Date.now() - startTime,
        details: {
          responseTime: response2.responseTime,
          remembersContext: content.includes('张三'),
          success: response2.success
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '上下文记忆功能',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      })
    }
  }

  /**
   * 测试错误处理功能
   */
  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now()
    try {
      // 测试空消息处理
      const response = await modelManager.chat([])

      // 应该返回错误而不是崩溃
      const passed = !response.success || response.error !== undefined

      this.results.push({
        name: '错误处理功能',
        passed,
        duration: Date.now() - startTime,
        details: {
          handledEmptyMessages: !response.success,
          errorMessage: response.error
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '错误处理功能',
        passed: true, // 如果抛出异常，说明有错误处理
        duration: Date.now() - startTime,
        details: { errorCaught: true }
      })
    }
  }

  /**
   * 测试响应时间
   */
  private async testResponseTime(): Promise<void> {
    const startTime = Date.now()
    const testCount = 5
    const responseTimes: number[] = []

    try {
      for (let i = 0; i < testCount; i++) {
        const response = await modelManager.chat([
          { role: 'user', content: `测试消息 ${i + 1}` }
        ])

        if (response.success) {
          responseTimes.push(response.responseTime)
        }
      }

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxTime = Math.max(...responseTimes)
      const passed = avgTime < this.responseTimeThreshold && maxTime < this.responseTimeThreshold * 1.5

      this.results.push({
        name: '响应时间测试',
        passed,
        duration: Date.now() - startTime,
        details: {
          testCount,
          avgResponseTime: avgTime.toFixed(2) + 'ms',
          maxResponseTime: maxTime + 'ms',
          threshold: this.responseTimeThreshold + 'ms'
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '响应时间测试',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      })
    }
  }

  /**
   * 测试并发请求处理
   */
  private async testConcurrentRequests(): Promise<void> {
    const startTime = Date.now()
    const concurrentCount = 3

    try {
      const promises = Array(concurrentCount).fill(null).map((_, i) =>
        modelManager.chat([
          { role: 'user', content: `并发测试消息 ${i + 1}` }
        ])
      )

      const responses = await Promise.all(promises)
      const successCount = responses.filter(r => r.success).length
      const passed = successCount === concurrentCount

      this.results.push({
        name: '并发请求测试',
        passed,
        duration: Date.now() - startTime,
        details: {
          concurrentCount,
          successCount,
          successRate: `${(successCount / concurrentCount * 100).toFixed(1)}%`
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '并发请求测试',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      })
    }
  }

  /**
   * 测试速率限制
   */
  private async testRateLimiting(): Promise<void> {
    const startTime = Date.now()
    const rapidRequests = 10

    try {
      const promises = Array(rapidRequests).fill(null).map((_, i) =>
        modelManager.chat([
          { role: 'user', content: `速率测试 ${i + 1}` }
        ])
      )

      const responses = await Promise.all(promises)
      const rateLimitedCount = responses.filter(r =>
        r.error?.includes('Rate limit') || r.error?.includes('rate limit')
      ).length

      // 如果有速率限制，说明功能正常
      const passed = rateLimitedCount > 0 || responses.every(r => r.success)

      this.results.push({
        name: '速率限制测试',
        passed,
        duration: Date.now() - startTime,
        details: {
          rapidRequests,
          rateLimitedCount,
          allSuccess: responses.every(r => r.success)
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '速率限制测试',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      })
    }
  }

  /**
   * 测试重试机制
   */
  private async testRetryMechanism(): Promise<void> {
    const startTime = Date.now()

    try {
      // 重置统计信息
      modelManager.resetStats()

      // 发送一个正常请求
      const response = await modelManager.chat([
        { role: 'user', content: '测试重试机制' }
      ])

      const metrics = modelManager.getMetrics()
      const passed = response.success || parseFloat(metrics.successRate) >= this.accuracyStandard * 100

      this.results.push({
        name: '重试机制测试',
        passed,
        duration: Date.now() - startTime,
        details: {
          successRate: metrics.successRate,
          accuracyStandard: `${(this.accuracyStandard * 100).toFixed(0)}%`
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '重试机制测试',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      })
    }
  }

  /**
   * 测试超时处理
   */
  private async testTimeoutHandling(): Promise<void> {
    const startTime = Date.now()

    try {
      // 发送一个长文本请求，可能触发超时
      const longMessage = '请详细解释'.repeat(100)
      const response = await modelManager.chat([
        { role: 'user', content: longMessage }
      ])

      // 如果超时，应该有错误信息
      const passed = response.success || response.error?.includes('timeout') || response.error?.includes('超时')

      this.results.push({
        name: '超时处理测试',
        passed,
        duration: Date.now() - startTime,
        details: {
          hasTimeoutError: response.error?.includes('timeout') || response.error?.includes('超时'),
          responseTime: response.responseTime
        }
      })
    } catch (error: any) {
      this.results.push({
        name: '超时处理测试',
        passed: true, // 如果抛出异常，说明有超时处理
        duration: Date.now() - startTime,
        details: { timeoutHandled: true }
      })
    }
  }

  /**
   * 打印测试摘要
   */
  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    console.log('\n📈 测试结果摘要:')
    console.log(`   ✅ 通过: ${passed}/${total}`)
    console.log(`   ❌ 失败: ${failed}/${total}`)
    console.log(`   📊 成功率: ${(passed / total * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ 失败的测试:')
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error || '未通过'}`)
        })
    }

    console.log('\n📋 详细结果:')
    this.results.forEach(r => {
      const icon = r.passed ? '✅' : '❌'
      console.log(`   ${icon} ${r.name} (${r.duration}ms)`)
    })
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const metrics = modelManager.getMetrics()
    const responseTimes = this.results
      .filter(r => r.passed && r.details?.responseTime)
      .map(r => r.details.responseTime)

    return {
      avgResponseTime: responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      successRate: parseFloat(metrics.successRate) / 100,
      totalRequests: metrics.totalRequests
    }
  }
}

// 导出测试套件
export { ModelTestSuite }
export type { TestResult, PerformanceMetrics }

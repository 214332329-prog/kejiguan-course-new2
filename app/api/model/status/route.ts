import { NextResponse } from 'next/server'
import { modelManager } from '@/lib/model-manager'

/**
 * 获取模型状态API
 * 用于前端实时监控模型运行状态
 */
export async function GET() {
  try {
    const status = modelManager.getStatus()
    const metrics = modelManager.getMetrics()
    const config = modelManager.getConfig()

    return NextResponse.json({
      success: true,
      data: {
        status,
        metrics,
        config: {
          modelName: config.modelName,
          timeout: config.timeout,
          maxRetries: config.maxRetries,
          maxConcurrent: config.maxConcurrent,
          rateLimitPerMinute: config.rateLimitPerMinute
        }
      },
      timestamp: Date.now()
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get model status',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

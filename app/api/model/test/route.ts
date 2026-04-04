import { NextResponse } from 'next/server'
import { ModelTestSuite } from '@/lib/model-test'

/**
 * 模型集成测试API
 * 用于运行全面的功能测试和性能测试
 */
export async function POST() {
  try {
    const testSuite = new ModelTestSuite()
    const results = await testSuite.runAllTests()
    const metrics = testSuite.getPerformanceMetrics()

    // 检查是否满足性能要求
    const responseTimeThreshold = parseInt(process.env.RESPONSE_TIME_THRESHOLD || '5000')
    const accuracyStandard = parseFloat(process.env.ACCURACY_STANDARD || '0.85')

    const passedResponseTime = metrics.avgResponseTime <= responseTimeThreshold
    const passedAccuracy = metrics.successRate >= accuracyStandard

    return NextResponse.json({
      success: true,
      data: {
        results,
        metrics,
        requirements: {
          responseTimeThreshold: `${responseTimeThreshold}ms`,
          accuracyStandard: `${(accuracyStandard * 100).toFixed(0)}%`,
          passedResponseTime,
          passedAccuracy,
          allPassed: passedResponseTime && passedAccuracy
        }
      },
      timestamp: Date.now()
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Test execution failed',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

/**
 * 获取测试要求信息
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      requirements: {
        responseTimeThreshold: parseInt(process.env.RESPONSE_TIME_THRESHOLD || '5000'),
        accuracyStandard: parseFloat(process.env.ACCURACY_STANDARD || '0.85'),
        testCategories: [
          '功能测试',
          '性能测试',
          '可靠性测试'
        ],
        testItems: [
          '连接测试',
          '基本聊天功能',
          '上下文记忆功能',
          '错误处理功能',
          '响应时间测试',
          '并发请求测试',
          '速率限制测试',
          '重试机制测试',
          '超时处理测试'
        ]
      }
    },
    timestamp: Date.now()
  })
}

import { NextResponse } from 'next/server'
import { modelManager } from '@/lib/model-manager'

/**
 * 模型对话API
 * 使用ModelManager统一管理模型调用
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, temperature = 0.7, max_tokens = 2048 } = body

    // 验证请求
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: messages array is required',
          timestamp: Date.now()
        },
        { status: 400 }
      )
    }

    // 使用ModelManager调用模型
    const response = await modelManager.chat(messages, {
      temperature,
      max_tokens
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Model API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

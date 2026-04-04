import { NextResponse } from 'next/server'

// Qwen3:8B API配置
const QWEN_API_URL = process.env.QWEN_API_URL || 'http://localhost:11434/api/chat'
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen3:8b'
const REQUEST_TIMEOUT = 60000 // 60秒超时

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface QwenRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface QwenResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 系统提示词
const systemPrompt = `你是一个专业的课程学习平台AI助手。你的主要任务是帮助用户：
1. 设计课程结构和教学模块
2. 提供教学方法和策略建议
3. 设计学习任务和评估标准
4. 解决课程开发中的具体问题
5. 提供学习资源推荐

请用中文回复，保持专业、友好、有帮助的态度。`

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

    // 准备完整的消息列表
    const fullMessages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ]

    // 准备请求数据
    const qwenRequest: QwenRequest = {
      model: QWEN_MODEL,
      messages: fullMessages,
      temperature,
      max_tokens,
      stream: false
    }

    // 调用Qwen3:8B API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(QWEN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qwenRequest),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Qwen API error:', response.status, errorText)
        return NextResponse.json(
          {
            success: false,
            error: `Qwen API error: ${response.status}`,
            timestamp: Date.now()
          },
          { status: response.status }
        )
      }

      const data: QwenResponse = await response.json()

      // 格式化响应
      return NextResponse.json({
        success: true,
        data: {
          content: data.choices[0]?.message?.content || '抱歉，我无法生成回复。',
          usage: data.usage
        },
        timestamp: Date.now()
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            error: '请求超时，请稍后重试',
            timestamp: Date.now()
          },
          { status: 408 }
        )
      }

      throw fetchError
    }

  } catch (error: any) {
    console.error('Qwen API integration error:', error)
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

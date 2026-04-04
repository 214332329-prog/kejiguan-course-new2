interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface QwenResponse {
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
  timestamp: number
}

export class QwenClient {
  private apiUrl: string

  constructor(apiUrl: string = '/api/qwen') {
    this.apiUrl = apiUrl
  }

  async chat(messages: ChatMessage[], options?: {
    temperature?: number
    max_tokens?: number
  }): Promise<QwenResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 2048
        })
      })

      const result: QwenResponse = await response.json()
      return result

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        timestamp: Date.now()
      }
    }
  }
}

export const qwenClient = new QwenClient()

// 定义请求参数类型
export interface DeepSeekRequest {
  model: string,
  messages: {
    role: 'user' | 'assistant',
    content: string
  }[],
  stream: boolean,
  temperature: number,  // 回复随机性（0-1，越小越固定）
  max_tokens: 2000  // 最大输出token数
}

// 定义流式响应类型
export interface DeepSeekStreamResponse {
  id: string,
  object: string,
  created: number,
  model: string,
  choices: {
    index: number,
    delta: {              // 流式返回的增量内容（逐字/逐词）
      content?: string,   // 每次返回的文本片段
      role?: 'assistant'
    },
    finish_reason: string | null, // 结束原因（null表示还在流式返回）
  }[]
}

// 核心函数：创建DeepSeek流式请求
export const createDeepSeekStream = async (
  messages: {role: 'user' | 'assistant', content: string}[],
  options?: {
    onChunk?:(chunk:string, fullContent:string) => void,
    onComplete?: (fullContent: string) => void,
    onError?: (error: Error) => void,
    controller?: AbortController
  }
) => {
  const controller = options?.controller || new AbortController()
  const signal = controller.signal
  
  try {
    // API请求体参数
    const requestBody: DeepSeekRequest = {
      model: import.meta.env.VITE_API_MODEL,
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      signal  // 支持取消请求
    })

    // 检查请求是否成功（非200状态码抛错）
    if (!response.ok) {
      // 这行代码什么意思？
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `API请求失败（状态码：${response.status}），请检查API密钥/模型名是否正确`)
    }

    // 检查响应体是否存在（避免空响应）
    if (!response.body) {
      throw new Error('DeepSeek API返回空响应，请检查网络或API配置');
    }

    // 返回流式读取器（用于后续逐行读取响应）
    // return response.body.getReader()

    // 返回流式处理器对象，便于控制
    return {
      controller,
      process: async () => {
        const reader = response.body!.getReader() // 流式读取器
        // 处理流式响应，实现打字机效果
        const decoder = new TextDecoder() // 把二进制流解码为文本
        let fullContent = ''  // 存储完整的AI回复
        let lastUpdateTime = 0  // 控制更新频率，避免刷新太快
        let buffer = '' // 缓存不完整的分块

        try {
          // 循环读取流式数据，直到读取完成
          while (true) {
            const {done, value} = await reader.read()
            // 如果读取完成，退出循环
            if (done) break

            // 解码二进制数据为文本并缓存分块（处理不完整的JSON）
            // buffer += decoder.decode(value, {stream: true}) 
            const chunk = decoder.decode(value, {stream: true}) 
            // 按行分割DeepSeek的流式响应每行是一个数据块）
            const lines = chunk.split('\n').filter(line => line.trim() !== '')
            // 保留最后一行（可能是不完整的分块）
            // buffer = lines.pop() || ''

            // 遍历每一行数据，解析并更新UI
            for (const line of lines) {
              if (line.trim() === '') continue
              // 如果收到结束标识，停止解析
              if (line === 'data: [DONE]') {
                options?.onComplete?.(fullContent)
                return fullContent
              }
              // 过滤非data开头的无效行（避免解析无关内容）
              if (line.startsWith('data: ')) {
                try {
                  // 移除DeepSeek流数据的前缀（格式是：data: {JSON}）
                  const data = line.replace(/^data: /, '').trim()
                  // 解析JSON数据（匹配第一步定义的类型）
                  const json = JSON.parse(data) as DeepSeekStreamResponse
                  // 获取本次返回的文本片段（逐字/逐词）
                  const content = json.choices[0]?.delta?.content || ''

                  // 如果有内容，更新到聊天界面
                  if (content) {
                    fullContent += content
                    // 节流更新（每50ms更新一次UI）
                    const now = Date.now()
                    if (now - lastUpdateTime > 50) {
                      options?.onChunk?.(content, fullContent)
                      lastUpdateTime = now
                    }
                  }
                } catch (e) {
                  // 更详细的错误信息
                  console.warn('解析JSON失败，跳过该行:', {
                    error: e,
                    line: line.slice(0, 100), // 只显示前100个字符
                    lineLength: line.length
                  });
                  continue; // 跳过这行，继续处理下一行
                }
              } 
          }
        }
      } finally {
        reader.releaseLock()
      }

      options?.onComplete?.(fullContent)
      return fullContent
      }
    }
  } catch (error) {
    // 统一捕获错误，方便后续排查
    options?.onError?.(error as Error)
    throw error
  }
}
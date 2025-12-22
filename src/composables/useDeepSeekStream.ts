import { ref } from 'vue'
import { createDeepSeekStream } from '@/utils/api'

export function useDeepSeekStream() {
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const abortController = ref<AbortController | null>(null)

  // 流式对话函数
  const streamChat = async (
    messages: { role: 'user' | 'assistant', content: string }[],
    callbacks: {
      onChunk: (chunk: string, fullContent: string) => void
      onComplete?: (fullContent: string) => void
      onError?: (error: string) => void
    }
  ): Promise<string> => {
    try {
      isStreaming.value = true
      error.value = null
      abortController.value = new AbortController()

      const streamProcessor = await createDeepSeekStream(messages, {
        onChunk: callbacks.onChunk,
        onComplete:(fullContent) => {
          isStreaming.value = false
          callbacks.onComplete?.(fullContent)
        },
        onError: (err) => {
          error.value = err.message
          isStreaming.value = false
          callbacks.onError?.(err.message)
        },
        controller: abortController.value
      })

      return await streamProcessor.process()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      error.value = errorMessage
      isStreaming.value = false
      callbacks.onError?.(errorMessage)
      throw err
    }
  }



  return {
    streamChat,
    isStreaming,
    error,
    clearError: () => error.value = null
  }
}
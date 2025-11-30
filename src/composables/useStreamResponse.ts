import { useChatStore } from "@/stores/chat"

export const useStreamResponse = () => {
  const chatStore = useChatStore()

  const simulateStreaming = async (messageId: string, fullContent:string): Promise<void> => {
    let displayedContent = ''

    for (let i = 0; i < fullContent.length; i++) {
      displayedContent += fullContent[i]

      // 更新消息内容
      chatStore.updateMessage(messageId, {content: displayedContent, status: 'sent'})

      // 控制打字速度
      const delay = 20 + Math.random() * 30
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // 流式完成后确保状态正确
    chatStore.updateMessage(messageId, { 
      status: 'sent'
    })
  }

  return {
    simulateStreaming
  }
}
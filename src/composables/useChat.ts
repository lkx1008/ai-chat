import { ref } from "vue"
import { useChatStore } from "@/stores/chat"
import { simulateAIResponse } from "@/utils/mockAI"

export const useChat = () => {
  const chatStore = useChatStore()
  const isAIThinking = ref(false)

  // 发送消息
  const sendMessage = async (content:string) => {
    if (!content.trim()) return

    // addMessage内部有 对没有对话情况的处理
    // 如果没有当前会话，创建一个
    /* if (!chatStore.currentSessionId) {
      chatStore.createNewSession()
    } */

    // 添加用户发送消息
    chatStore.addMessage({
      role:'user',
      content:content.trim(),
      timestamp:Date.now(),
      status:'sent'
    })

    // 添加AI回复的消息（加载状态）
    chatStore.addMessage({
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'loading'
    })

    // 获取最后一条消息（刚添加的AI消息）
    const messages = chatStore.currentMessages
    const aiMessage = messages[messages.length - 1]

    // 模拟AI回复
    isAIThinking.value = true
    try {
      if (!aiMessage) return
      await simulateAIResponse(aiMessage.id, content)      
    } finally {
      isAIThinking.value = false
    }
  }

  // 重新生成消息
  const regenerateMessage = async (messageId: string) => {
    const messages = chatStore.currentMessages
    const targetMessageIndex = messages.findIndex(msg => msg.id === messageId)
    
    if (targetMessageIndex === -1) return
    
    // 找到目标消息对应的用户消息（前一条消息）
    const userMessageIndex = targetMessageIndex - 1
    if (userMessageIndex < 0 || messages[userMessageIndex]?.role !== 'user') {
      console.error('找不到对应的用户消息')
      return
    }
    
    const userMessage = messages[userMessageIndex]
    
    // 删除从目标消息开始的所有后续消息
    chatStore.deleteMessagesFrom(messageId)
    
    // 添加新的AI消息（加载状态）
    chatStore.addMessage({
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'loading'
    })

    // 获取新添加的AI消息
    const newAIMessage = chatStore.currentMessages[chatStore.currentMessages.length - 1]

    // 模拟AI回复
    isAIThinking.value = true
    try {
      if (!newAIMessage) return
      await simulateAIResponse(newAIMessage.id, userMessage.content)      
    } finally {
      isAIThinking.value = false
    }
  }

  // 重试失败的消息
  const retryMessage = async (messageId: string) => {
    const message = chatStore.currentMessages.find(msg => msg.id === messageId)
    if (!message || message.status !== 'error') return

    // 找到对应的用户消息（前一条消息）
    const messages = chatStore.currentMessages
    const messageIndex = messages.findIndex(msg => msg.id === messageId)
    const userMessageIndex = messageIndex - 1
    
    if (userMessageIndex < 0 || messages[userMessageIndex]?.role !== 'user') {
      console.error('找不到对应的用户消息')
      return
    }
    
    const userMessage = messages[userMessageIndex]
    
    // 更新消息状态为加载中
    chatStore.updateMessage(messageId, {
      status: 'loading',
      errorInfo: undefined // 清除错误信息
    })

    // 模拟AI回复
    isAIThinking.value = true
    try {
      await simulateAIResponse(messageId, userMessage.content)      
    } finally {
      isAIThinking.value = false
    }
  }

  return {
    sendMessage,
    isAIThinking,
    regenerateMessage,
    retryMessage
  }
}
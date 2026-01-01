import { defineStore } from "pinia"
import type { Message, ChatSession } from "@/types"
import { computed, ref } from "vue"
import { saveSessionsToStorage, loadSessionsFromStorage } from "@/utils/storage"

export const useChatStore = defineStore('chat', () => {
  // 状态定义
  // 所有对话
  const sessions = ref<ChatSession[]>([])
  // 当前活跃的对话id
  const currentSessionId = ref<string | null>(null)

  // 初始化：从本地存储加载数据
  const initializeFromStorage = () => {
    const storedSessions = loadSessionsFromStorage()
    if (storedSessions.length > 0) {
      sessions.value = storedSessions
      // 设置当前会话为最近更新的一个
      const latestSession = [...storedSessions].sort((a, b) => b.updatedAt - a.updatedAt)[0]
      currentSessionId.value = latestSession!.id
    }
  }

  // 防抖式存储优化，避免频繁IO操作
  // 连续触发时，只执行最后一次保存
  let saveTimeout: number | null = null
  const saveToStorage = () => {
    // 检查是否有已经设置的定时器
    // 防抖逻辑：清除上次的定时器，重新设置
    if (saveTimeout) {
      // clearTimeout()方法取消先前通过调用setTimeout()建立的超时任务
      clearTimeout(saveTimeout)
    }
    // 设置一个新的定时器
    saveTimeout = setTimeout(() => {
      saveSessionsToStorage(sessions.value)
      saveTimeout = null
    }, 500) // 延迟 500ms 保存，避免频繁写入
  }

  // Getter 计算属性
  // 当前的对话对象
  const currentSession = computed(() => {
    return sessions.value.find(session => session.id === currentSessionId.value)
  })
  // 当前会话的所有消息
  const currentMessages = computed(() => {
    return currentSession.value?.messages || []
  }) 

  // 按更新时间倒序排列的会话列表 ***
  const sortedSessions = computed(() => {
    return [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  // actions
  // 创建新的对话
  const createNewSession = () => {
    // 创建新的对话对象
    const newSession: ChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    // 添加到对话数组开头
    sessions.value.unshift(newSession)
    // 把新添加的对话设为当前对话
    currentSessionId.value = newSession.id

    // 保存到本地存储
    saveToStorage()

    return newSession
  }

   // 切换会话  ***
  const switchSession = (sessionId: string) => {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      currentSessionId.value = sessionId
    }
  }

  // 删除会话 ***
  const deleteSession = (sessionId: string) => {
    const index = sessions.value.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      sessions.value.splice(index, 1)
      
      // 如果删除的是当前会话，需要切换到其他会话
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          // 切换到最近的一个会话
          currentSessionId.value = sortedSessions.value[0]?.id || null
        } else {
          currentSessionId.value = null
        }
      }
      
      saveToStorage()
    }
  }

  // 更新会话标题 ***
  const updateSessionTitle = (sessionId: string, title: string) => {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      session.title = title
      session.updatedAt = Date.now()
      saveToStorage()
    }
  }


  // 添加消息
  const addMessage = (message:Omit<Message, 'id'>) => {
    const session = currentSession.value
    // 如果没有当前对话，就创建新对话
    if (!session) {
      createNewSession()
      return addMessage(message)
    }
    // 创建新的消息对象
    const newMessage: Message = {
      ...message,
      id: generateId()
    }
    // 添加消息到对话消息数组末尾
    session.messages.push(newMessage)
    // 更新对话的更新时间
    session.updatedAt = Date.now()
    // 用第一条用户消息的前20个字作为对话标题
    if (session.messages.length === 1 && message.role === 'user') {
      session.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
    }

    // 保存到本地存储
    saveToStorage()
  }

  // 更新消息（用于流式响应）
  const updateMessage = (messageId:string, updates: Partial<Message>) => {
    const session = currentSession.value
    if (!session) return

    const message = session.messages.find(msg => msg.id === messageId)
    if (message) {
      Object.assign(message, updates)
      session.updatedAt = Date.now()

      // 保存到本地存储
      saveToStorage()   
    }
  }

  // 删除消息 ***
  const deleteMessage = (messageId: string) => {
    const session = currentSession.value
    if (!session) return

    const messageIndex = session.messages.findIndex(msg => msg.id === messageId)
    if (messageIndex !== -1) {
      session.messages.splice(messageIndex, 1)
      session.updatedAt = Date.now()
      
      // 保存到本地存储
      saveToStorage()
    }
  }

  // 删除从指定消息开始的所有后续消息 用于重新生成消息
  const deleteMessagesFrom = (messageId: string) => {
    const session = currentSession.value
    if (!session) return
  
    const messageIndex = session.messages.findIndex(msg => msg.id === messageId)
    if (messageIndex !== -1) {
      session.messages.splice(messageIndex)
      session.updatedAt = Date.now()

      // 保存到本地存储
      saveToStorage()
    }
  }

  // 生成id的工具函数
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  return {
    sessions,
    currentSessionId,
    currentSession,
    currentMessages,
    sortedSessions,
    createNewSession,
    switchSession,
    deleteSession,
    updateSessionTitle,
    addMessage,
    updateMessage,
    deleteMessage,
    deleteMessagesFrom,
    initializeFromStorage
  }

})
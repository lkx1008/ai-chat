import type { ChatSession } from '@/types'

const STORAGE_KEY = 'ai-chat-sessions'

// 保存会话数据到 localStorage
export const saveSessionsToStorage = (sessions: ChatSession[]): void => {
  try {
    const dataToSave = {
      sessions,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('保存会话数据失败:', error)
  }
}

// 从 localStorage 加载会话数据
export const loadSessionsFromStorage = (): ChatSession[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) {
      return []
    }

    const parsedData = JSON.parse(storedData)
    
    // 基本数据验证
    if (!parsedData.sessions || !Array.isArray(parsedData.sessions)) {
      console.warn('本地存储的数据格式不正确')
      return []
    }

    console.log(`从本地存储加载了 ${parsedData.sessions.length} 个会话`)
    return parsedData.sessions
  } catch (error) {
    console.error('加载会话数据失败:', error)
    return []
  }
}

// 清理所有存储的会话数据
export const clearSessionsStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('清理会话数据失败:', error)
  }
}
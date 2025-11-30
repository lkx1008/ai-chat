// 定义消息类型
export interface Message {
  id: string,
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  status: 'loading' | 'sent' | 'error'
  type?: 'text' | 'card',
  cardData?: ArticleCard ,
  errorInfo?: {  // 新增错误信息字段
    message: string // 错误信息
    code?: string   // 错误码
    retryable?: boolean // 是否可重试
  }
}
// 定义卡片数据类型
export interface ArticleCard  {
  title: string
  description: string
  image?: string
  url: string
}
// 定义对话类型
export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}
// 定义对话状态
export interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null
}
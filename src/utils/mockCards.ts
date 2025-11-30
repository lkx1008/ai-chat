// src/utils/mockCards.ts
import type { ArticleCard } from '@/types'

// 模拟文章卡片数据
export const mockArticleCards: ArticleCard[] = [
  {
    title: 'Vue 3 组合式 API 详解',
    description: '学习 Vue 3 组合式 API 的核心概念和最佳实践，提升开发效率。',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
    url: 'https://vuejs.org/guide/extras/composition-api-faq.html'
  },
  {
    title: 'TypeScript 与 Vue 3 完美结合',
    description: '如何在 Vue 3 项目中充分发挥 TypeScript 的类型安全优势。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    url: 'https://vuejs.org/guide/typescript/overview.html'
  },
  {
    title: '前端状态管理最佳实践',
    description: '深入理解 Pinia 状态管理库，构建可维护的前端应用架构。',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    url: 'https://pinia.vuejs.org/'
  },
  {
    title: '现代 CSS 布局技术',
    description: '掌握 Flexbox、Grid 等现代 CSS 布局方案，实现响应式设计。',
    image: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=400&h=200&fit=crop',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout'
  }
]

// 根据用户消息智能推荐文章
export const getRelevantArticle = (userMessage: string): ArticleCard | null => {
  const message = userMessage.toLowerCase()
  
  if (message.includes('vue') || message.includes('前端框架')) {
    return mockArticleCards[0] as ArticleCard
  }
  
  if (message.includes('typescript') || message.includes('类型')) {
    return mockArticleCards[1] as ArticleCard
  }
  
  if (message.includes('状态管理') || message.includes('pinia')) {
    return mockArticleCards[2] as ArticleCard
  }
  
  if (message.includes('css') || message.includes('布局') || message.includes('样式')) {
    return mockArticleCards[3] as ArticleCard
  }
  
  return null
}

// 随机获取一篇文章
export const getRandomArticle = (): ArticleCard => {
  const randomIndex = Math.floor(Math.random() * mockArticleCards.length)
  return mockArticleCards[randomIndex] as ArticleCard
}
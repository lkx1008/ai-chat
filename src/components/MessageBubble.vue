<template>
  <div class="message" :class="messageClass">
    <!-- 头像和角色名称 -->
    <div class="message-avatar">
      <div class="avatar-container">
        <div class="avatar" :class="avatarClass">
          {{ message.role === 'user' ? '您' : 'AI' }}
        </div>
        <div class="role-name">{{ message.role === 'user' ? '用户' : 'AI助手' }}</div>
      </div>
    </div>
    <!-- 消息内容区域 -->
    <div class="message-content">
      <!-- 加载状态 -->
      <div v-if="message.status === 'loading'" class="loading-indicator">
        <div class="typing-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- 错误状态 -->
      <ErrorMessage
        v-else-if="message.status === 'error'"
        :message="message"
        @retry="handleRetry"
        class="error-container"
      />

      <!-- 正常消息内容 -->
      <template v-else>
        <!-- AI消息使用Markdown渲染 -->
        <div 
          v-if="message.role === 'assistant'" 
          class="markdown-content" 
          v-html="renderedContent"
        />
        <!-- 用户消息使用普通文本 -->
        <div 
          v-else 
          class="message-text" 
          v-html="formattedTextContent"
        />
        <!-- 卡片内容 -->
        <ArticleCard
          v-if="message.type === 'card' && message.cardData"
          :card-data="message.cardData"
          class="message-card"
        />

        <!-- AI消息的操作按钮 -->
        <MessageActions
          v-if="message.role === 'assistant' && message.status === 'sent'"
          :message-id="message.id"
          :content="message.content"
          @copy="handleCopy"
          @regenerate="handleRegenerate"
          class="message-actions"
        />
      </template>
      <!-- 时间戳 -->
      <div v-if="message.status === 'sent' || message.status === 'error'" class="message-time">
        {{ formattedTime }}
        <span v-if="message.status === 'error'" class="error-indicator"> · 失败</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
// 导入Message类型
import type { Message } from '@/types'
import ArticleCard from './ArticleCard.vue'
import MessageActions from './MessageActions.vue'
import ErrorMessage from './ErrorMessage.vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{message: Message}>()
const emit = defineEmits<{
  copy: [content: string]
  regenerate: [messageId: string]
  retry: [messageId: string]
}>()

const messageClass = computed(() => ({
  'user-message': props.message.role === 'user',
  'ai-message': props.message.role === 'assistant'
}))

const avatarClass = computed(() => ({
  'user-avatar': props.message.role === 'user',
  'ai-avatar': props.message.role === 'assistant'
}))

const formattedTime = computed(() => {
  return new Date(props.message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const formattedTextContent  = computed(() => {
  // 简单的换行处理，将换行符转换为<br>
  // 对于流式响应，直接显示当前内容
  return props.message.content.replace(/\n/g, '<br>')
})

// markdown
const renderedContent = ref('')
// 渲染 Markdown 内容
const updateRenderedContent = () => {
  if (props.message.content && props.message.role === 'assistant') {
    try {
      renderedContent.value = renderMarkdown(props.message.content)
    } catch (error) {
      console.error('Markdown 渲染失败:', error)
      // 降级为纯文本
      renderedContent.value = props.message.content.replace(/\n/g, '<br>')
    }
  } else {
    renderedContent.value = props.message.content.replace(/\n/g, '<br>')
  }
}

// 处理复制
const handleCopy = (content: string) => {
  emit('copy', content)
}

// 处理重新生成
const handleRegenerate = (messageId: string) => {
  emit('regenerate', messageId)
}

// 处理重试
const handleRetry = (messageId: string) => {
  emit('retry', messageId)
}

// 监听消息内容变化
watch(() => props.message.content, updateRenderedContent, { immediate: true })

// 组件挂载后重新渲染以确保复制功能正常工作
onMounted(() => {
  nextTick(updateRenderedContent)
})

</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 24px;
  max-width: 100%;
  
  &.user-message {
    flex-direction: row-reverse;
    align-self: flex-end;
    
    .message-content {
      align-items: flex-end;
    }
  }
  
  &.ai-message {
    align-self: flex-start;
    
    .message-content {
      align-items: flex-start;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 12px;
}

/* 新增：头像容器样式 */
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 60px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  
  &.user-avatar {
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    color: white;
  }
  
  &.ai-avatar {
    background-color: #f0f0f0;
    color: #666;
    border: 1px solid #e0e0e0;
  }
}

.role-name {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: center;
  word-break: keep-all;
}


.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  min-width: 120px;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  
  .user-message & {
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    color: white;
    border-bottom-right-radius: 4px;
  }
  
  .ai-message & {
    background-color: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.markdown-content {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.6;
  word-wrap: break-word;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-indicator {
  padding: 12px 20px;
  background-color: white;
  border-radius: 18px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.typing-animation {
  display: flex;
  align-items: center;
  
  span {
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background-color: #999;
    margin: 0 2px;
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

.error-container {
  max-width: 100%;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  padding: 0 4px;
}

.error-indicator {
  color: #ff4d4f;
}

.message-card {
  max-width: 320px;
  margin-top: 12px;
}

/* 动画效果 */
.message {
  animation: messageAppear 0.3s ease-out;
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  30% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message {
    margin-bottom: 16px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
  
  .message-text,
  .markdown-content {
    padding: 10px 14px;
    font-size: 14px;
  }
}
</style>
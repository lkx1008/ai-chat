<template>
  <div class="error-message">
    <div class="error-icon">
      <el-icon><Warning /></el-icon>
    </div>
    <div class="error-content">
      <div class="error-text">
        {{ errorInfo?.message || '请求失败，请稍后重试' }}
        <span v-if="errorInfo?.code" class="error-code">({{ errorInfo.code }})</span>
      </div>
      <div class="error-actions">
        <button 
          v-if="errorInfo?.retryable !== false" 
          @click="handleRetry" 
          class="retry-button"
        >
          <el-icon><RefreshRight /></el-icon>
          重试
        </button>
        <button @click="handleCopyError" class="copy-error-button">
          <el-icon><CopyDocument /></el-icon>
          复制错误
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/types'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  retry: [messageId: string]
}>()

const errorInfo = props.message.errorInfo

// 处理重试
const handleRetry = () => {
  emit('retry', props.message.id)
}

// 复制错误信息
const handleCopyError = async () => {
  const errorText = `错误信息: ${errorInfo?.message || '未知错误'}
错误代码: ${errorInfo?.code || '无'}
发生时间: ${new Date(props.message.timestamp).toLocaleString()}`

  try {
    await navigator.clipboard.writeText(errorText)
    // 可以添加复制成功的提示
    console.log('错误信息已复制')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = errorText
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  margin: 8px 0;
}

.error-icon {
  color: #ff4d4f;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-text {
  color: #ff4d4f;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.error-code {
  color: #d48806;
  font-size: 12px;
}

.error-actions {
  display: flex;
  gap: 8px;
}

.retry-button,
.copy-error-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button {
  background: #fff2f0;
  border-color: #ffa39e;
  color: #cf1322;
}

.retry-button:hover {
  background: #ffccc7;
  border-color: #ff4d4f;
}

.copy-error-button {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #389e0d;
}

.copy-error-button:hover {
  background: #d9f7be;
  border-color: #73d13d;
}
</style>
<template>
  <div class="message-actions">
    <button 
      class="action-btn copy-btn" 
      @click="handleCopy"
      :title="copyTooltip"
    >
      <el-icon><CopyDocument /></el-icon>
      {{ copyTooltip }}
    </button>
    
    <button 
      class="action-btn regenerate-btn" 
      @click="handleRegenerate"
      title="重新生成"
    >
      <el-icon><RefreshRight /></el-icon>
      重新生成
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  messageId: string
  content: string
}>()

const emit = defineEmits<{
  copy: [content: string]
  regenerate: [messageId: string]
}>()

const copyTooltip = ref('复制内容')

// 处理复制
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    copyTooltip.value = '已复制!'
    
    setTimeout(() => {
      copyTooltip.value = '复制内容'
    }, 2000)
    
    emit('copy', props.content)
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = props.content
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    copyTooltip.value = '已复制!'
    setTimeout(() => {
      copyTooltip.value = '复制内容'
    }, 2000)
    
    emit('copy', props.content)
  }
}

// 处理重新生成
const handleRegenerate = () => {
  emit('regenerate', props.messageId)
}
</script>

<style scoped>
.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
  color: #333;
}

.copy-btn:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.regenerate-btn:hover {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
}

.action-btn svg {
  flex-shrink: 0;
}
</style>
<template>
  <div class="input-container">
    <div class="input-box" :class="{ 'has-text': hasText }">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="message-input"
        placeholder="输入您的消息..."
        rows="1"
        @keydown="handleKeydown"
        @input="handleInput"
      ></textarea>
      <div class="input-actions">
        <button class="action-btn" title="上传文件">
          <el-icon :size="20"><Link /></el-icon>
        </button>
        <button 
          class="send-btn" 
          :disabled="!hasText"
          @click="sendMessage"
        >
          <el-icon :size="20"><Top /></el-icon>
        </button>
      </div>
    </div>
    <div class="input-tip">
      <span>Enter发送，Shift+Enter换行</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

const hasText = computed(() => inputText.value.trim().length > 0)
const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 自定义事件，把子组件数据传到父组件
const emit = defineEmits<{
  send: [message: string]
}>()

// 发送消息
const sendMessage = () => {
  if (!hasText.value) return
  const message = inputText.value.trim()
  // 触发 send 事件，将消息内容作为参数传递
  emit('send', message)
  // 清空输入框
  inputText.value = ''

  // 重置文本域高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

// 处理按键事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()  // 阻止默认的换行行为
    sendMessage()
  }
}

// 处理输入事件，自动调整高度
const handleInput = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
    }
  })
}


</script>

<style scoped>
.input-container {
  padding: 20px 24px;
  background-color: white;
  border-top: 1px solid #e1e5e9;
}

.input-box {
  display: flex;
  align-items: center;
  border: 1.5px solid #e1e5e9;
  border-radius: 16px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  
  &.has-text {
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
  
  &:focus-within {
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  resize: none;
  max-height: 120px;
  min-height: 20px;
  font-size: 16px;
  line-height: 1.5;
  font-family: inherit;
  
  &::placeholder {
    color: #9ca3af;
  }
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
    color: #374151;
  }
}

.send-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(106, 17, 203, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.input-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-container {
    padding: 16px;
  }
  
  .input-box {
    border-radius: 12px;
    padding: 10px 14px;
  }
  
  .message-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>
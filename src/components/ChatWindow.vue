<template>
  <!-- 聊天容器 -->
  <div class="chat-container">
    <!-- 左侧边栏 -->
    <div class="container-left">
      <Sidebar></Sidebar>
    </div>
    <!-- 右边对话区域 -->
    <div class="container-right">
      <div class="header">
        AI对话助手
      </div>
      <!-- 消息区域 -->
      <div class="messages-container" ref="messagesContainer">
        <!-- 无对话时 -->
        <div v-if="!currentMessages.length" class="welcome-container">
          <h1 class="welcome-title">你好！</h1>
          <p class="welcome-subtitle">我是您的AI助手，可以回答各种问题、协助解决问题或进行创意对话</p>
        </div>
        <!-- 有对话时 -->
        <div v-else class="messages-list">
          <div 
            v-for="message in currentMessages" 
            :key="message.id"
            class="message-wrapper"
          >
            <MessageBubble
              :message="message"
              @copy="handleCopyMessage"
              @regenerate="handleRegenerateMessage"
              @retry="handleRetryMessage"
            />
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <Input @send="handleSend"></Input>      
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useChat } from '@/composables/useChat'
// 引入组件
import Sidebar from './Sidebar.vue'
import MessageBubble from './MessageBubble.vue'
import Input from './Input.vue'
import { ref, computed, nextTick, watch, onMounted } from 'vue'

//定义仓库chatStore
const chatStore = useChatStore()

// 处理消息的方法
const { sendMessage,regenerateMessage,retryMessage  } = useChat() 

//导出聊天信息
const currentMessages = computed(() => chatStore.currentMessages)
const messagesContainer = ref<HTMLElement | null>(null)

// 初始化存储
onMounted(() => {
  chatStore.initializeFromStorage()
})

// 发送消息
const handleSend = (content:string) => {
  sendMessage(content)
}

// 处理复制消息
const handleCopyMessage = (content: string) => {
  console.log('复制消息内容:', content)
}

// 处理重新生成消息
const handleRegenerateMessage = async (messageId: string) => {
  // console.log('重新生成消息:', messageId)
  await regenerateMessage(messageId)
}

// 处理重试失败的消息
const handleRetryMessage = async (messageId: string) => {
  console.log('重试消息:', messageId)
  await retryMessage(messageId)
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，实现自动滚动
// immediate: true，监听开始时立即执行一次
watch(currentMessages, () => {
  scrollToBottom()
}, { deep: true, immediate: true })


// 由于第一个监视器开启了深度监视，可以监视到消息内容的变化（流式响应），所以删除第二个监视器
// 监听单个消息内容变化（用于流式响应）
// 因为流式响应中消息的content会不断变化，但消息数组长度不变
/* watch(
  () => currentMessages.value.map(msg => msg.content).join('|'),
  () => {scrollToBottom()}
) */

</script>

<style scoped lang="scss">
.chat-container {
  height: 100vh;
  display: flex;

  .container-right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .header {
      padding: 16px 24px;
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      background-color: white;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      max-width: 900px;
      width: 100%;
      margin: 0 auto; // 水平居中
      display: flex;
      flex-direction: column;
    }

    /* 欢迎界面样式 */
    .welcome-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 40px;
    }

    .welcome-title {
      font-size: 32px;
      margin-bottom: 24px;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .welcome-subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 40px;
      max-width: 600px;
    }

    /* 消息列表样式 */
    .messages-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container .container-right {
    .welcome-container {
      padding: 20px;
    }
    
    .welcome-title {
      font-size: 24px;
    }
    
    .welcome-subtitle {
      font-size: 16px;
    }
  }
}
</style>
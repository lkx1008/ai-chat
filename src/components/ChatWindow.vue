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
        <!-- 有对话时，超过消息阈值使用虚拟滚动 -->
        <div v-else class="messages-list">
          <!-- DynamicScroller 虚拟滚动容器 -->
          <DynamicScroller
            v-if="useVirtualScroll"
            ref="scroller"
            class="dynamic-scroller"
            :items="currentMessages"
            :min-item-size="60"
            :buffer="200"
            key-field="id"
          >
            <template #default="{ item: message, index, active }">
              <DynamicScrollerItem
                :item="message"
                :data-index="index"
                :active="active"
                :size-dependencies="[message.content, message.type]"
              >
                <MessageBubble
                  :message="message"
                  :virtual-mode="true"
                  :index="index"
                  :active="active"
                  @copy="handleCopyMessage"
                  @regenerate="handleRegenerateMessage"
                  @retry="handleRetryMessage"
                />
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>

          <!-- 普通列表（用于少量消息） -->
          <div v-else ref="normalList" class="normal-messages-list">
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

          <!-- 滚动到底部按钮 -->
          <!-- <button 
            v-if="showScrollToBottom && useVirtualScroll"
            class="scroll-to-bottom-btn"
            @click="scrollToLatest"
            aria-label="滚动到底部"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
            </svg>
          </button> -->

          <!-- 新消息提示 -->
          <!-- <div v-if="newMessageCount > 0" class="new-message-indicator" @click="scrollToLatest">
            {{ newMessageCount }} 条新消息
          </div> -->
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
// 引入虚拟滚动相关组件
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
// 引入组件
import Sidebar from './Sidebar.vue'
import MessageBubble from './MessageBubble.vue'
import Input from './Input.vue'
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'

//定义仓库chatStore
const chatStore = useChatStore()

// 处理消息的方法
const { sendMessage,regenerateMessage,retryMessage  } = useChat() 

//导出聊天信息
const currentMessages = computed(() => chatStore.currentMessages)
const messagesContainer = ref<HTMLElement | null>(null)
// refs
const scroller = ref<any>(null)
const normalList = ref<HTMLElement | null>(null)

// 虚拟滚动配置
const VIRTUAL_SCROLL_THRESHOLD = 50 // 启用虚拟滚动的阈值

// 状态
// const showScrollToBottom = ref(false)
// const newMessageCount = ref(0)
const userScrolled = ref(false)

// 是否使用虚拟滚动
const useVirtualScroll = computed(() => {
  return currentMessages.value.length > VIRTUAL_SCROLL_THRESHOLD
})

// 滚动事件处理函数
/* const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 是否接近底部（距离底部100px以内）
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

  // 更新用户滚动状态
  // userScrolled.value = !isNearBottom

  // 显示/隐藏滚动按钮
  showScrollToBottom.value = !isNearBottom

  // 如果用户滚动到底部，重置新消息计数
  if (isNearBottom) {
    newMessageCount.value = 0
  }
} */

// 设置滚动事件监听
/* const setupScrollListeners = () => {
  // 清理之前的监听
  cleanupScrollListeners()
  
  if (useVirtualScroll.value && scroller.value) {
    // 监听虚拟滚动器的滚动事件
    const scrollElement = scroller.value.$el
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    }
  } else if (normalList.value) {
    // 监听普通列表的滚动事件
    normalList.value.addEventListener('scroll', handleScroll, { passive: true })
  }
} */
// 清理滚动事件监听
/* const cleanupScrollListeners = () => {
  if (scroller.value?.$el) {
    scroller.value.$el.removeEventListener('scroll', handleScroll)
  }
  
  if (normalList.value) {
    normalList.value.removeEventListener('scroll', handleScroll)
  }
} */



// 初始化存储
onMounted(() => {
  chatStore.initializeFromStorage()

  // 延迟设置监听，确保DOM已渲染
  /* nextTick(() => {
    setupScrollListeners()
  }) */
})

/* onUnmounted(() => {
  cleanupScrollListeners()
}) */

// 监听虚拟滚动状态变化
/* watch(useVirtualScroll, () => {
  nextTick(() => {
    setupScrollListeners()
  })
}) */

// 监听scroller ref变化（当切换到虚拟滚动时）
/* watch(scroller, () => {
  if (scroller.value && useVirtualScroll.value) {
    nextTick(() => {
      setupScrollListeners()
    })
  }
}) */

// 发送消息
const handleSend = (content:string) => {
  sendMessage(content)
  // 发送消息后处理滚动
  nextTick(() => {
    scrollToLatest()
  })
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

// 滚动到底部   这里的逻辑需要处理一下？
const scrollToLatest = () => {
  nextTick(() => {
    if (useVirtualScroll.value && scroller.value) {
    // 使用DynamicScroller的scrollToBottom方法
    scroller.value.scrollToBottom()
  } else if (normalList.value) {
    normalList.value.scrollTop = normalList.value.scrollHeight
    }
  })
}

// 自动滚动到底部
/* const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - messagesContainer.value.clientHeight
    }
  })
} */

// 监听消息变化，实现自动滚动
// immediate: true，监听开始时立即执行一次
/* watch(currentMessages, () => {
  // 需要nextTick吗？
  nextTick(() => {
    scrollToLatest()
  })
}, { deep: true, immediate: true }) */

// 监听消息变化
watch(currentMessages, (newMessages, oldMessages) => {
  // ?? 是空值合并运算符,如果左边的值是 null 或 undefined，则返回右边的默认值 0
  const oldLength = oldMessages?.length ?? 0
  // 切换会话 或者 当前会话有新消息
  if (newMessages !== oldMessages || newMessages.length > oldLength) {
    nextTick(() => {
      scrollToLatest()
    })
  } else if (newMessages.length === oldLength) {
    // 消息内容更新（如流式响应）
    // 延迟滚动，确保DOM已更新
    setTimeout(() => {
      scrollToLatest()
    }, 100)
  }
},{deep: true, immediate: true })


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
      /* overflow-y: auto; */
      overflow: hidden;
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

    /* 消息列表容器样式 */
    .messages-list {
      height: 100%;
      width: 100%;
      /* display: flex;
      flex-direction: column;
      gap: 16px; */

      .dynamic-scroller {
        height: 100%;
        width: 100%;
      }

      .normal-messages-list {
        height: 100%;
        overflow-y: auto;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 8px 0;
        
        .message-wrapper {
          width: 100%;
        }
      }
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
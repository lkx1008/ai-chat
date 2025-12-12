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
          <button 
            v-if="showScrollToBottom"
            class="scroll-to-bottom-btn"
            @click="scrollToLatest"
            aria-label="滚动到底部"
          >
            <el-icon><ArrowDown /></el-icon>
          </button>
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
const showScrollToBottom = ref(false)
const userScrolled = ref(false)

// 是否使用虚拟滚动
const useVirtualScroll = computed(() => {
  return currentMessages.value.length > VIRTUAL_SCROLL_THRESHOLD
})

// 滚动事件处理函数
const handleScroll = (event: Event) => {
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
}

// 设置滚动事件监听
const setupScrollListeners = () => {
  // 清理之前的监听
  cleanupScrollListeners()
  
  // 使用 nextTick 确保 DOM 更新完成
  nextTick(() => {
    if (useVirtualScroll.value) {
      if (scroller.value?.$el) {
        // 监听虚拟滚动器的滚动事件
        scroller.value.$el.addEventListener('scroll', handleScroll, { passive: true })
      }
    } else if (normalList.value) {
      // 监听普通列表的滚动事件
    normalList.value.addEventListener('scroll', handleScroll, { passive: true })
    }
  })
}
// 清理滚动事件监听
const cleanupScrollListeners = () => {
  if (scroller.value?.$el) {
    scroller.value.$el.removeEventListener('scroll', handleScroll)
  }
  
  if (normalList.value) {
    normalList.value.removeEventListener('scroll', handleScroll)
  }
}



// 初始化存储
onMounted(() => {
  chatStore.initializeFromStorage()

  // 延迟设置监听，确保DOM已渲染
  nextTick(() => {
    setupScrollListeners()
  })
})

onUnmounted(() => {
  cleanupScrollListeners()
})

// 监听虚拟滚动状态变化 （切换普通/虚拟模式）
watch(useVirtualScroll, () => {
  nextTick(() => {
    setupScrollListeners()
  })
})

// 监听虚拟滚动组件实例化（确保能获取到 DOM）
watch(scroller, () => {
  if (scroller.value && useVirtualScroll.value) {
    nextTick(() => {
      setupScrollListeners()
    })
  }
})

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

    // 重置状态
    showScrollToBottom.value = false
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
      position: relative;
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
      position: relative;
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

      /* 滚动按钮 */
      .scroll-to-bottom-btn {
        position: absolute;
        right: 16px;
        bottom: 16px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 100;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: #f5f5f5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

  
    .scroll-to-bottom-btn {
      width: 36px;
      height: 36px;
      right: 12px;
      bottom: 12px;
    }
  }
}
</style>
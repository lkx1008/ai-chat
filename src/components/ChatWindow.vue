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
      
      <!-- 主要内容区域 - 改为flex布局 -->
      <div class="main-content">
        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <!-- 无对话时 -->
          <div v-if="!currentMessages.length" class="welcome-container">
            <h1 class="welcome-title">你好！</h1>
            <p class="welcome-subtitle">我是您的AI助手，可以回答各种问题、协助解决问题或进行创意对话</p>
          </div>
          
          <!-- 有对话时，超过消息阈值使用虚拟滚动 -->
          <div v-else class="messages-list-wrapper">
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

        <!-- 输入区域，包含停止按钮 -->
        <div class="input-area">
          <!-- 输入框 -->
          <Input @send="handleSend"></Input>
          
          <!-- 停止按钮（当AI正在生成时显示） -->
          <button 
            v-if="isAIThinking" 
            @click="handleStopGeneration"
            class="stop-generation-btn"
            aria-label="停止生成"
          >
            <el-icon><Close /></el-icon>
            停止生成
          </button>
        </div>
        
      </div>
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
const { sendMessage, regenerateMessage, retryMessage, isAIThinking, stopCurrentResponse  } = useChat() 

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
const isAtBottom = ref(true) // 是否在底部
const autoScrollPaused = ref(false) // 自动滚动是否被暂停
const lastScrollTop = ref(0) // 上一次的滚动位置

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

  // 判断是否在底部（容差5px）
  const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 5
  isAtBottom.value = atBottom

  // 判断滚动方向
  const scrollDelta = scrollTop - lastScrollTop.value
    
  // 如果向上滚动（scrollDelta为负值）
  if (scrollDelta < -10) { // -10的阈值避免微小抖动误判
    autoScrollPaused.value = true // 暂停自动滚动
  }
  // 如果用户滚动到底部，恢复自动滚动
  if (atBottom) {
    autoScrollPaused.value = false
  }

  lastScrollTop.value = scrollTop

  // 显示/隐藏滚动按钮
  showScrollToBottom.value = !atBottom
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

// 重置滚动状态
const resetScrollState = () => {
  autoScrollPaused.value = false
  isAtBottom.value = true
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
  // 发送消息前重置滚动状态
  resetScrollState()
  
  sendMessage(content)
  // 发送消息后处理滚动
  nextTick(() => {
    // console.log('有新消息，自动滚动到底部')
    scrollToLatest()
  })
}

// 处理停止生成
const handleStopGeneration = () => {
  stopCurrentResponse()
}

// 处理复制消息
const handleCopyMessage = (content: string) => {
  console.log('复制消息内容:', content)
}

// 处理重新生成消息
const handleRegenerateMessage = async (messageId: string) => {
  // 重置滚动状态
  resetScrollState()
  await regenerateMessage(messageId)
}

// 处理重试失败的消息
const handleRetryMessage = async (messageId: string) => {
  console.log('重试消息:', messageId)
  // 不需要重置滚动状态，因为要在原地查看消息
  // resetScrollState()
  await retryMessage(messageId)
}

// 滚动到底部
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
    isAtBottom.value = true
    autoScrollPaused.value = false
  })
}

// 检查是否应该自动滚动
const shouldAutoScroll = () => {
  return !autoScrollPaused.value && isAtBottom.value
}

// 监听当前会话ID的变化，处理会话切换
watch(() => chatStore.currentSessionId, () => {
  // 切换会话时重置滚动状态并滚动到底部
  resetScrollState()
  nextTick(() => {
    // console.log('切换会话');
    scrollToLatest()
  })
})

// 监听消息变化,处理同一会话内的消息更新
watch(currentMessages, () => {
  // 只要有消息变化，就检查是否需要滚动
  if (shouldAutoScroll()) {
    // 延迟一点确保DOM更新完成
    setTimeout(() => {
      if (shouldAutoScroll()) {
        // console.log('消息内容变化，自动滚动到底部')
        scrollToLatest()
      }
    }, 50)
  }
}, { deep: true, immediate: true })

</script>

<style scoped lang="scss">
.chat-container {
  height: 100vh;
  display: flex;
  overflow: hidden;

  .container-left {
    flex-shrink: 0;
    height: 100%;
  }

  .container-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: #f8f9fa;
    position: relative;

    .header {
      flex-shrink: 0;
      padding: 16px 24px;
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      background-color: white;
      z-index: 10;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      padding: 0;
    }

    .messages-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      max-width: 100%;
      width: 100%;
      margin: 0 auto;
      padding: 20px 0;
      box-sizing: border-box;
    }

    /* 欢迎界面样式 */
    .welcome-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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
    .messages-list-wrapper {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .dynamic-scroller {
        flex: 1;
        min-height: 0;
        overflow-y: auto !important;
        overflow-x: hidden;
        padding: 8px 20px;
        
        /* 自定义滚动条样式 */
        &::-webkit-scrollbar {
          width: 8px;
        }
        
        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          
          &:hover {
            background: rgba(0, 0, 0, 0.3);
          }
        }
      }

      .normal-messages-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 8px 20px;
        
        /* 自定义滚动条样式 */
        &::-webkit-scrollbar {
          width: 8px;
        }
        
        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          
          &:hover {
            background: rgba(0, 0, 0, 0.3);
          }
        }
        
        .message-wrapper {
          width: 100%;
          box-sizing: border-box;
        }
      }

      /* 滚动按钮 */
      .scroll-to-bottom-btn {
        position: absolute;
        right: 32px;
        bottom: 20px;
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
     /* 输入区域样式 */
    .input-area {
      position: relative;
      // padding: 0 20px 20px;
    }

    /* 停止生成按钮 */
    .stop-generation-btn {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background-color: #ff4d4f;
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
      transition: all 0.2s ease;
      z-index: 10;

      &:hover {
        background-color: #ff7875;
        box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container .container-right {
    .main-content {
      padding: 0;
    }
    
    .messages-container {
      padding: 12px 0;
    }
    
    .messages-list-wrapper {
      .dynamic-scroller,
      .normal-messages-list {
        padding: 8px 12px;
      }
    }
    
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
      right: 16px;
      bottom: 16px;
    }
    /* .input-area {
      padding: 0 12px 12px;
    } */
    
    .stop-generation-btn {
      top: -36px;
      font-size: 11px;
      padding: 5px 10px;
    }
  }
}
</style>
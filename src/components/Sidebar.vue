<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }"> 
    <!-- 图标 + 侧边栏展开切换 -->
    <div class="sidebar-header">
      <el-avatar v-if="!isCollapsed">AI</el-avatar>
      <span class="sidebar-title" v-if="!isCollapsed">AI Chat</span>
      <el-icon
       class="toggle-icon" 
       :size="40"
       @click="isCollapsed = !isCollapsed"
       >
        <Menu />
      </el-icon>
    </div>
    <!-- 开启新对话 -->
    <div class="sidebar-new" @click="handleNewChat">
      <el-icon :size="25"><Edit /></el-icon>
      <span v-if="!isCollapsed">新对话</span>
    </div>
    <!-- 历史对话 -->
    <div class="sidebar-history" v-if="!isCollapsed">
      <h3 class="history-title">历史对话</h3>
      <div class="history-list">
        <div
         class="history-item" 
         v-for="session in chatStore.sortedSessions" 
         :class="{ 'active': session.id === chatStore.currentSessionId }"
         :key="session.id"
         @click="handleSwitchSession(session.id)"
        >
          <el-icon><Message /></el-icon>
          <span class="history-text">{{ session.title }}</span>
          <el-icon
            class="delete-icon"
            @click.stop="openDeleteDialog(session.id)"
          >
            <Delete />
          </el-icon>
        </div>
        
        <!-- 空状态 -->
        <div v-if="chatStore.sortedSessions.length === 0" class="empty-history">
          <el-icon :size="30"><ChatDotRound /></el-icon>
          <span>暂无历史对话</span>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="删除对话"
      width="500"
    >
      <span>确认删除对话吗？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click=closeDeleteDialog>取消</el-button>
          <el-button type="primary" @click="confirmDelete">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'

// 删除对话框相关
const dialogVisible = ref(false) 
const currentDeleteId = ref<string | null>(null)

const chatStore = useChatStore()
const isCollapsed = ref(false)

// 打开删除对话框
const openDeleteDialog = (sessionId: string) => {
  currentDeleteId.value = sessionId
  dialogVisible.value = true
}

// 关闭删除对话框
const closeDeleteDialog = () => {
  dialogVisible.value = false
  currentDeleteId.value = null
}

// 确认删除
const confirmDelete = () => {
  if (currentDeleteId.value) {
    chatStore.deleteSession(currentDeleteId.value)
    dialogVisible.value = false
  }
}

// 创建新对话
const handleNewChat = () => {
  chatStore.createNewSession()
  isCollapsed.value = false
}

// 切换会话
const handleSwitchSession = (sessionId: string) => {
  chatStore.switchSession(sessionId)
}

</script>

<style scoped lang="scss">
.sidebar {
  // width: 280px;
  height: 100vh;
  background-color: var(--sidebar-bg-color);
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  // transition: width 0.3s ease; /* 平滑过渡效果 */
}
/* 折叠状态样式 */
// .sidebar-collapsed {
//   width: 80px;
// }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between; 
  padding: 16px;
  gap: 12px;
  /* 折叠时调整头部布局 */
  .sidebar-collapsed & {
    justify-content: center;
  }
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
}
/* 折叠切换图标样式 */
.toggle-icon {
  cursor: pointer;
  color: #666;
  padding: 4px;
  // transition: all 0.2s ease;
}

.toggle-icon:hover {
  background-color: #f5f5f5;
  color: #409eff;
}

.sidebar-new {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  gap: 12px;
  justify-content: center; /* 折叠时图标居中 */
  .sidebar-collapsed & {
    justify-content: center;
  }
  &:hover {
    background-color: #f5f7fa;
  }
}

.sidebar-history {
  padding: 16px;
  border-top: 1px solid #eee;
  width: 250px;
}

.history-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  gap: 12px;

  &.active {
    background: #ecf5ff;
    border: 1px solid #409eff;
  }

}

.history-item:hover {
  background: #f5f7fa;
}

/* 新增：历史对话文本样式 */
.history-text {
  flex: 1; /* 占据剩余空间 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
  min-width: 0; /* 重要：允许文本容器收缩 */
}

.empty-history {
  display: flex;
  align-items: center;
  span {
    margin-left: 10px;
  }
}
</style>
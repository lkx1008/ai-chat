<script setup lang="ts">
import ChatWindow from '@/components/ChatWindow.vue'
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

// 在组件挂载时初始化数据
onMounted(() => {
  chatStore.initializeFromStorage()
})
</script>

<template>
  <div class="app_container">
    <ChatWindow></ChatWindow>
  </div>
</template>

<style scoped>
/* Markdown 样式 */
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin: 16px 0 8px 0;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.25em; }
.markdown-content h3 { font-size: 1.125em; }

.markdown-content p {
  margin: 8px 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.markdown-content li {
  margin: 4px 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content code:not(pre code) {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #e74c3c;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 代码块样式 */
.code-block-wrapper {
  margin: 16px 0;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  overflow: hidden;
  background: #f6f8fa;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f1f3f4;
  border-bottom: 1px solid #e1e4e8;
  font-size: 12px;
}

.language-tag {
  color: #6a737d;
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.copy-button {
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background: #40a9ff;
}

.markdown-content pre {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  background: #fafbfc;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.45;
}

.markdown-content pre code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}
</style>

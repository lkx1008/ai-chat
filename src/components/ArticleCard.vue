<!-- src/components/ArticleCard.vue -->
<template>
  <div class="article-card" @click="handleClick">
    <!-- 卡片图片 -->
    <div v-if="cardData.image" class="card-image-container">
      <img :src="cardData.image" :alt="cardData.title" class="card-image" />
    </div>
    
    <!-- 卡片内容 -->
    <div class="card-content">
      <h3 class="card-title">{{ cardData.title }}</h3>
      <p class="card-description">{{ cardData.description }}</p>
      <div class="card-footer">
        <span class="card-link">阅读全文 →</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArticleCard } from '@/types'

const props = defineProps<{cardData: ArticleCard}>()

// 处理卡片点击
// '_blank'表示在新窗口/新标签页中打开链接，如果使用 '_self' 则在当前窗口打开
const handleClick = () => {
  window.open(props.cardData.url, '_blank')
}
</script>

<style scoped>
.article-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 320px;
  margin: 8px 0;
}

.article-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-image-container {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.card-link {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.card-link:hover {
  color: #40a9ff;
}
</style>
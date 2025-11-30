import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// 引入全局样式
import '@/assets/styles/main.scss'
// 引入element-plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入 highlight.js 样式
import 'highlight.js/styles/github.css'

const app = createApp(App)
// 全局注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())

app.mount('#app')

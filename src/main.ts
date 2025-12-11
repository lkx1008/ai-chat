import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// 引入全局样式
import '@/assets/styles/main.scss'
// 引入element-plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入 highlight.js 样式
import 'highlight.js/styles/github.css'
// 引入虚拟列表相关库
import VueVirtualScroller from 'vue-virtual-scroller'
const app = createApp(App)
// 全局注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
// 全局注册虚拟列表组件
app.use(VueVirtualScroller)

app.mount('#app')

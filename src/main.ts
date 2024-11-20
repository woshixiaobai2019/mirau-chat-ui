import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { useChatStore } from './store'
import { useCharacterStore } from './store'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(ElementPlus)
app.use(pinia)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 创建 store 实例
const chatStore = useChatStore()
const characterStore = useCharacterStore()

// 初始化 store 并挂载应用
Promise.all([
  chatStore.initialize(),
  characterStore.initialize()
]).then(() => {
  app.mount('#app')
})
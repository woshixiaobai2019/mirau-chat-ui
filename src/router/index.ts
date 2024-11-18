import { createRouter, createWebHistory } from 'vue-router'

import MainLayoutVue from '@/layout/MainLayout.vue'
const routes = [
  {
    path: '/',
    component: MainLayoutVue,
    children: [
      {
        path: 'chat/:id?',
        name: 'Chat',
        component: () => import('@/views/ChatView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
<template>
  <el-container class="layout-container">
    <!-- 左侧边栏 -->
    <el-aside :width="isCollapse ? '0' : '260px'" class="aside-container">
      <!-- 用户信息区域 -->
      <div class="user-info">
        <el-avatar :size="32" src="/api/placeholder/32/32" />
        <span class="username">Mirau</span>
      </div>
      
      <!-- 聊天历史列表 -->
      <div class="chat-list">
        <ChatList />
      </div>
      
      <!-- 底部用户设置 -->
      <div class="user-settings">
        <el-dropdown>
          <div class="settings-trigger">
            <el-avatar :size="24" src="/api/placeholder/24/24" />
            <span>mouse</span>
            <el-icon><Setting /></el-icon>
          </div>
        </el-dropdown>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container"  @click="handleMainClick">
      <!-- 顶部角色信息 -->
      <el-header height="60px" class="main-header">
        <div class="header-left">
          <el-button
            type="text"
            class="toggle-sidebar-btn"
            @click="toggleSidebar"
          >
            <el-icon :size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>
         </div>
        <div class="header-center">
      <span class="character-name">Executive coach</span>
        </div>
      <div class="header-right">
      <el-button
        type="text"
        class="more-btn"
        @click="toggleCharacterInfo"
      >
        <el-icon><MoreFilled /></el-icon>
      </el-button>
      </div>
       

      </el-header>

      <!-- 聊天窗口 -->
      <el-main class="chat-window">
        <ChatWindow />
      </el-main>
    </el-container>
        <CharacterInfo
      v-model:visible="isCharacterInfoVisible"
      width="300px"
    />
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { Setting, Fold, MoreFilled,Expand } from '@element-plus/icons-vue'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'
import CharacterInfo from "../components/CharacterInfo.vue"


const isCollapse = ref(true)
const isCharacterInfoVisible = ref(false)

const toggleCharacterInfo = (e) => {
  e.stopPropagation()
  console.log(isCharacterInfoVisible.value)
  isCharacterInfoVisible.value = !isCharacterInfoVisible.value
}
const toggleSidebar = (e) => {
  console.log(isCollapse.value)
  e.stopPropagation()
  isCollapse.value = !isCollapse.value
}

const handleNewChat = () => {
  // TODO: 实现新建对话的逻辑
  console.log('新建对话')
}
const handleMainClick = () => {
  console.log(isCharacterInfoVisible.value)
  // 仅在小屏幕下自动收起侧边栏
  if (window.innerWidth <= 768 && !isCollapse.value) {
    isCollapse.value = true
    
  }
  if (window.innerWidth <= 768 && isCharacterInfoVisible.value) {
    isCharacterInfoVisible.value = false
    
  }
  
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.aside-container {
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}

.user-info {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.user-settings {
  padding: 12px 16px;
  border-top: 1px solid #e6e6e6;
}

.settings-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
}

.settings-trigger:hover {
  background-color: #e6e6e6;
  border-radius: 4px;
}

.main-container {
  background-color: #fff;
}


.toggle-sidebar-btn {
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.toggle-sidebar-btn:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}

.new-chat-btn {
  font-size: 12px;
}

.chat-window {
  padding: 0;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
.main-header {
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 200px; /* 固定宽度确保中间标题居中 */
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.header-right {
  width: 200px; /* 与左侧相同宽度保持对称 */
  display: flex;
  justify-content: flex-end;
}

.toggle-sidebar-btn {
  padding: 8px;
  color: #606266;
}

.more-btn {
  padding: 8px;
  color: #606266 !important; /* 设置一个可见的颜色 */
}

.more-btn:hover, .toggle-sidebar-btn:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
<template>
  <div class="layout-container">
    <!-- 侧边栏切换按钮容器 -->
    <div class="sidebar-toggle-container" :class="{ 'sidebar-open': !isCollapse }">
        <el-icon :size="20" class="toggle-sidebar-btn" @click="toggleSidebar">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
    </div>

    <!-- 左侧边栏 -->
    <div class="sidebar" :class="{ 'collapsed': isCollapse }">
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
    </div>

    <!-- 主容器 -->
    <el-container class="main-container">
      <!-- 顶部角色信息 -->
      <el-header height="60px" class="main-header">
        <div class="header-center">
          <span class="character-name">{{currentChat.characterConfig.name}}</span>
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
      <el-main class="chat-window" @click="handleMainClick">
        <ChatWindow />
      </el-main>
    </el-container>

    <CharacterInfo
      v-model:visible="isCharacterInfoVisible"
      width="300px"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Setting, Fold, MoreFilled,Expand } from '@element-plus/icons-vue'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'
import CharacterInfo from "../components/CharacterInfo.vue"
import { useChatStore } from '../store'
import { storeToRefs } from 'pinia';
const chatStore = useChatStore();
const { currentChat } = storeToRefs(chatStore);

console.log(currentChat)
const isCollapse = ref(true)
const isCharacterInfoVisible = ref(false)

const toggleCharacterInfo = (e) => {
  e.stopPropagation()
  console.log("right side bar")
  console.log(isCharacterInfoVisible.value)
  isCharacterInfoVisible.value = !isCharacterInfoVisible.value
}
const toggleSidebar = (e) => {
  console.log("left side bar")
  console.log(isCollapse.value)
  e.stopPropagation()
  isCollapse.value = !isCollapse.value
}

const handleNewChat = () => {
  // TODO: 实现新建对话的逻辑
  console.log('新建对话')
}
const handleMainClick = () => {
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
/* .layout-container {
  height: 100vh;
  width: 100vw;
} */

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



.toggle-sidebar-btn {
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

/* .toggle-sidebar-btn:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
} */

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
.layout-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
/* 侧边栏切换按钮容器样式 */
.sidebar-toggle-container {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 2000; /* 确保按钮始终在最上层 */
  transition: left 0.3s ease;
}

.sidebar-toggle-container.sidebar-open {
  left: 270px; /* 当侧边栏打开时，按钮移动到侧边栏右侧 */
}

.toggle-sidebar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 260px;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

/* .user-info {
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  gap: 12px;
} */

/* .chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
} */

/* .user-settings {
  padding: 16px;
  border-top: 1px solid #dcdfe6;
} */

/* .settings-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
} */

.main-container {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}

/* .main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
} */


/* .header-center {
  flex: 1;
  text-align: center;
} */

.chat-window {
  height: calc(100% - 60px);
  overflow-y: auto;
  padding: 0px;
}

.toggle-sidebar-btn,
.more-btn {
  padding: 8px;
}

.character-name {
  font-size: 16px;
  font-weight: 500;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}


</style>

<template>
  <div class="chat-list-container">
  <el-button class="new-chat-item" @click="showNewChatDialog = true" :icon="Plus" type="primary">新建对话</el-button>
    <!-- 聊天列表 -->
    <div class="chat-items">
      <!-- 新对话按钮 -->

      
      <TransitionGroup name="list">
        <div
          v-for="chat in filteredChats"
          :key="chat.id"
          class="chat-item"
          :class="{ active: currentChatId === chat.id }"
          @click="selectChat(chat)"
        >
          <!-- 头像和名称区域 -->
          <div class="chat-item-main">
            <el-avatar :size="40" :src="chat.avatar" />
            <div class="chat-info">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="last-message">{{ chat.lastMessage }}</div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="chat-actions">
            <el-dropdown trigger="click" @command="handleCommand($event, chat)">
              <el-icon><MoreFilled /></el-icon>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pin">
                    <el-icon><Top /></el-icon>
                    置顶对话
                  </el-dropdown-item>
                  <!-- <el-dropdown-item command="archive">
                    <el-icon><Box /></el-icon>
                    归档对话
                  </el-dropdown-item> -->
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    <span class="text-red-500">删除对话</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-if="filteredChats.length === 0" class="empty-state">
        <el-empty description="无聊天记录" />
      </div>
          <!-- 新对话弹窗 -->
    <NewChatDialog
      v-model:show="showNewChatDialog"
      @confirm="handleNewChat"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, MoreFilled, Top, Box, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import NewChatDialog from './NewChat.vue'
import { useChatStore } from '../store'
import type { ChatListItem } from '../types'

// 使用 chat store
const chatStore = useChatStore()

// 状态
const showNewChatDialog = ref(false)

// 从 store 获取当前聊天 ID
const currentChatId = computed(() => chatStore.currentChatId)

// 获取排序后的聊天列表
const filteredChats = computed(() => chatStore.sortedChatList)

// 选择聊天
const selectChat = async (chat: ChatListItem) => {
  await chatStore.switchChat(chat.id)
}

// 处理新建对话
const handleNewChat = async (data: { name: string; avatar: string; systemPrompt: string }) => {
  try {
    await chatStore.startNewChat({
      name: data.name,
      avatar: data.avatar,
      systemPrompt: data.systemPrompt
    })
    showNewChatDialog.value = false
    ElMessage.success('创建成功')
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

// 处理下拉菜单命令
const handleCommand = async (command: string, chat: ChatListItem) => {
  switch (command) {
    case 'pin':
      await chatStore.togglePin(chat.id)
      ElMessage.success(`${chat.pinned ? '已取消置顶' : '已置顶'}对话`)
      break
      
    case 'delete':
      try {
        await ElMessageBox.confirm(
          '确定要删除这个对话吗？此操作不可恢复。',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        await chatStore.deleteChat(chat.id)
        ElMessage.success('已删除对话')
      } catch {
        // 用户取消删除
      }
      break
  }
}

</script>


<style scoped>
.chat-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-container {
  padding: 12px 16px;
  border-bottom: 1px solid #e6e6e6;
}

.chat-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.new-chat-item {
  margin-bottom: 0.3rem;
}

.chat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-item:hover {
  background-color: #f5f7fa;
}

.chat-item.active {
  background-color: #ecf5ff;
}

.chat-item-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 4px;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

/* 列表动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>
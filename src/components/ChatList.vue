<template>
  <div class="chat-list-container">
    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索对话"
        prefix-icon="Search"
        clearable
        size="small"
      />
    </div>

    <!-- 聊天列表 -->
    <div class="chat-items">
      <!-- 新对话按钮 -->
      <div class="new-chat-item" @click="showNewChatDialog = true">
        <el-icon class="new-chat-icon"><Plus /></el-icon>
        <span>新建对话</span>
      </div>

      <el-divider />
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
                  <el-dropdown-item command="archive">
                    <el-icon><Box /></el-icon>
                    归档对话
                  </el-dropdown-item>
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

<script setup>
import { ref, computed } from 'vue'
import { Search, MoreFilled, Top, Box, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import NewChatDialog from './NewChat.vue'
// 模拟的聊天数据
const chatList = ref([
  {
    id: 1,
    name: 'Executive Coach',
    avatar: '/api/placeholder/40/40',
    lastMessage: 'How can I help you today?',
    pinned: false
  },
  {
    id: 2,
    name: 'AI Assistant',
    avatar: '/api/placeholder/40/40',
    lastMessage: 'I can help you with that task.',
    pinned: true
  },
  // 可以添加更多模拟数据
])

const currentChatId = ref(1)
const searchQuery = ref('')
// 新增的状态
const showNewChatDialog = ref(false)

// 处理新建对话
const handleNewChat = (data) => {
  console.log('New chat data:', data)
  // TODO: 创建新对话，可能需要调用 store 或发送请求
}
// 过滤和排序聊天列表
const filteredChats = computed(() => {
  return chatList.value
    .filter(chat => {
      if (!searchQuery.value) return true
      return chat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             chat.lastMessage.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
    .sort((a, b) => {
      // 置顶的排在前面
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.id - a.id // 最新的排在前面
    })
})

// 选择聊天
const selectChat = (chat) => {
  currentChatId.value = chat.id
  // TODO: 触发父组件的事件或更新store
}

// 处理下拉菜单命令
const handleCommand = async (command, chat) => {
  switch (command) {
    case 'pin':
      chat.pinned = !chat.pinned
      ElMessage.success(`${chat.pinned ? '已置顶' : '已取消置顶'}对话`)
      break
      
    case 'archive':
      ElMessage.success('已归档对话')
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
        const index = chatList.value.findIndex(item => item.id === chat.id)
        if (index > -1) {
          chatList.value.splice(index, 1)
          ElMessage.success('已删除对话')
        }
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
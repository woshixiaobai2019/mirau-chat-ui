<template>
  <div>
    <div 
      class="message-container"
      :class="{ 'message-right': isUser }"
    >
      <!-- 头像部分 -->
      <div class="avatar-container" :class="{ 'order-last': isUser }">
        <el-avatar :size="40" :src="avatar" />
        <div class="name-tag">
          <el-tag size="small" type="info" effect="plain" class="role-tag">
            {{ roleTag }}
          </el-tag>
        </div>
        <!-- 更多操作下拉菜单 -->
        <div class="more-icon-container" >
          <el-dropdown 
            v-if="showActions" 
            trigger="click"
            @command="handleCommand"
          >

              <el-icon class="more-icon">
              <MoreFilled />
            </el-icon>
            
            <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">
                <el-icon><EditPen /></el-icon>
                <span>编辑消息</span>
              </el-dropdown-item>
              <el-dropdown-item command="copy" >
                <el-icon><CopyDocument /></el-icon>
                <span>复制消息</span>
              </el-dropdown-item>
              <el-dropdown-item command="delete" >
                <el-icon><Delete /></el-icon>
                <span>删除消息</span>
              </el-dropdown-item>
            </el-dropdown-menu>

            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 消息内容部分 -->
      <div class="message-content" :class="{ 'user-message': isUser }">
        <div class="message-text">{{ messages[currentIndex ] }}</div>
        
        <!-- 刷新按钮区域 -->
        <div 
          v-if="showActions && isLatestAssistantMessage && !isUser && messages.length <= 1" 
          class="refresh-container"
        >
          <el-icon class="refresh-icon" @click="handleRegenerate">
            <Refresh />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 评分和导航系统 (仅为助手消息显示) -->
    <div v-if="!isUser && isLatestAssistantMessage" class="bottom-controls">
      <div class="navigation-buttons" v-if="messages.length > 1">
        <el-icon 
          class="nav-icon" 
          :class="{ 'disabled': currentIndex+1 < 1 }"
          @click="handlePrevious"
        >
          <ArrowLeft />
        </el-icon>
        
        <span class="message-index">{{ currentIndex+1 }} / {{ messages.length }}</span>
        
        <el-icon 
          class="nav-icon"
          :class="{ 'disabled': currentIndex+1 >= 10 }"
          @click="handleNext"
        >
          <ArrowRight />
        </el-icon>
      </div>
    </div>

    <!-- 编辑消息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑消息"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="editForm" ref="editFormRef">
        <el-form-item
          prop="content"
          :rules="[
            { required: true, message: '消息内容不能为空' },
            { min: 1, message: '消息内容不能为空' }
          ]"
        >
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="5"
            resize="none"
            placeholder="请输入消息内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="confirmEdit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
      :show-close="false"
    >
      <span>确定要删除这条消息吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Refresh, 
  MoreFilled, 
  ArrowLeft, 
  ArrowRight,
  EditPen,
  CopyDocument,
  Delete
} from '@element-plus/icons-vue'
import { ElDropdown, ElDropdownMenu, ElDropdownItem,ElMessage,ElMessageBox } from 'element-plus'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  isUser: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    required: true
  },
  roleTag: {
    type: String,
    default: 'c.ai'
  },
  isLatestAssistantMessage: {
    type: Boolean,
    default: false
  },
  currentIndex: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits([
  'regenerate',
  'previous',
  'next',
  'edit-message',
  'delete'
])

// 状态管理
const showActions = ref(true)
const isRegenerating = ref(false)
const editDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = ref({
  content: ''
})

// 消息操作处理函数
const handleCommand = (command) => {
  console.log('Command received:', command)
  switch (command) {
    case 'edit':
      console.log('Editing...')
      openEditDialog()
      break
    case 'copy':
      console.log('Copying...')
      copyMessage()
      break
    case 'delete':
      console.log('Deleting...')
      openDeleteDialog()
      break
    default:
      console.log('Unknown command:', command)
  }
}

const testclick = ()=>{
  console.log('testclick')
}

// 打开编辑对话框
const openEditDialog = () => {
  console.log(editDialogVisible.value)
  editForm.value.content = props.messages[props.currentIndex]
  editDialogVisible.value = true
}

// 取消编辑
const cancelEdit = () => {
  editDialogVisible.value = false
  editForm.value.content = ''
}

// 确认编辑
const confirmEdit = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate((valid) => {
    if (valid) {
      console.log("new")
      console.log(editForm.value.content)
      emit('edit-message', editForm.value.content)
      editDialogVisible.value = false
      ElMessage.success('消息已更新')
    }
  })
}

// 打开删除确认对话框
const openDeleteDialog = () => {
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = () => {
  emit('delete', props.currentIndex - 1)
  deleteDialogVisible.value = false
  ElMessage.success('消息已删除')
}

// 复制消息
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.messages[props.currentIndex - 1])
    ElMessage.success('消息已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 其他处理函数
const handleRegenerate = () => {
  isRegenerating.value = true
  emit('regenerate')
}

const handlePrevious = () => {
  if (props.currentIndex > 0) {
    console.log("trigger prev")
    emit('previous')
  }
}

const handleNext = () => {
  if (props.currentIndex < props.messages.length) {
    emit('next')
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  width: 100%;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
  padding-bottom: 20px;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}
/* 添加新的编辑相关样式 */
.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.el-dropdown {
  display: flex;
  align-items: center;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 0.3rem;
}

.message-content :deep(.el-textarea__inner) {
  background-color: white;
  border-color: var(--el-border-color-hover);
}

.message-right {
  flex-direction: row-reverse;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.name-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
}

.role-tag {
  font-size: 0.7rem;
  padding: 0 0.5rem;
}

.more-icon {
  cursor: pointer;
  color: #909399;
  font-size: 1rem;
  padding: 0.2rem;
  transition: color 0.3s;
}

.more-icon:hover {
  color: #606266;
}

.message-content {
  background-color: #f4f4f5;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  max-width: 70%;
  position: relative;
}



.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.user-message {
  background-color: #e5e7eb;
  line-height: 2;
}

.refresh-container {
  position: absolute;
  bottom:  -1.2rem;
  right: 0;
}

.refresh-icon {
  cursor: pointer;
  color: #909399;
  font-size: 1.5rem;
  padding: 0.3rem;
  transition: color 0.3s;
}

.refresh-icon:hover {
  color: #606266;
}

.bottom-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 4rem 0.5rem 6rem;
  margin-top: -0.5rem;
}

.navigation-buttons {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.nav-icon {
  cursor: pointer;
  color: #909399;
  font-size: 1.2rem;
  padding: 0.3rem;
  transition: all 0.3s;
}

.nav-icon:hover:not(.disabled) {
  color: #606266;
  background-color: #f4f4f5;
  border-radius: 50%;
}

.nav-icon.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.message-index {
  color: #909399;
  font-size: 0.9rem;
  min-width: 3rem;
  text-align: center;
}

:deep(.el-rate__icon) {
  font-size: 16px;
  margin-right: 4px;
}

:deep(.el-rate__item) {
  vertical-align: middle;
}
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;  /* 添加相对定位 */
}

.name-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.more-icon-container {
  position: absolute;
  left: 20%;  /* 位于头像容器右侧 */
  top: 100%;    /* 垂直居中 */
  transform: translateY(-50%);
  margin-left: 0.5rem;  /* 与头像保持一定距离 */
  margin-top: 0.5rem;  /* 与头像保持一定距离 */
}

.more-icon {
  cursor: pointer;
  color: #909399;
  font-size: 1rem;
  padding: 0.2rem;
  transition: color 0.3s;
}

.more-icon:hover {
  color: #606266;
}

/* 如果是用户消息，图标位于左侧 */
.message-right .more-icon-container {
  left: auto;
  right: 10%;
  margin-left: 0;
  margin-right: 0.5rem;
}
</style>
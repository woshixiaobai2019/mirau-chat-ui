<template>
  <el-dialog
    v-model="visible"
    title="NewChat"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="new-chat-dialog"
  >
    <div class="new-chat-form">
      <!-- 头像上传区域 -->
      <div class="avatar-section" >
        <p class="section-title">set avatar</p>
          <div class="avatar-wrapper" v-if="avatarUrl" >
            <el-avatar 
              :size="60" 
              :src="avatarUrl"
              class="uploaded-avatar"
            />
          </div>
            <div class="upload-placeholder">
            <el-input
              v-model="avatarUrl"
              placeholder="input avatar url"
              resize="none"
              :maxlength="200"
              show-word-limit
            />
            </div>
 
      </div>

      <!-- System Prompt 输入区域 -->
      <div class="prompt-section">
        <p class="section-title">character name</p>
        <el-input
          v-model="name"
          placeholder="name"
          resize="none"
          :maxlength="20"
          show-word-limit
        />
      </div>
            <!-- System Prompt 输入区域 -->
      <div class="prompt-section">
        <p class="section-title">system prompt</p>
        <el-input
          v-model="systemPrompt"
          type="textarea"
          :rows="3"
          placeholder="input system prompt..."
          resize="none"
          :maxlength="500"
          show-word-limit
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">cancel</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :disabled="!isValid"
        >
          start chat
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'confirm'])

// 响应式对话框宽度
const dialogWidth = computed(() => {
  return window.innerWidth < 768 ? '65%' : '360px'
})

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const avatarUrl = ref('')
const systemPrompt = ref('')
const name = ref('')

// 表单验证
const isValid = computed(() => {
  return avatarUrl.value && systemPrompt.value.trim().length > 0 && name.value.trim().length > 0
})

// // 头像上传前验证
// const beforeAvatarUpload = (file) => {
//   const isImage = file.type.startsWith('image/')
//   const isLt2M = file.size / 1024 / 1024 < 2

//   if (!isImage) {
//     ElMessage.error('只能上传图片文件!')
//     return false
//   }
//   if (!isLt2M) {
//     ElMessage.error('图片大小不能超过 2MB!')
//     return false
//   }
//   return true
// }

// // 头像上传成功回调
// const handleAvatarSuccess = (res) => {
//   avatarUrl.value = res.url // 假设服务器返回图片URL
// }

const handleCancel = () => {
  visible.value = false
  avatarUrl.value = ''
  systemPrompt.value = ''
}

const handleConfirm = () => {
  if (!isValid.value) return

  emit('confirm', {
    avatar: avatarUrl.value,
    systemPrompt: systemPrompt.value.trim(),
    name: name.value.trim()
  })
  
  handleCancel()
}
</script>
<style scoped>
.new-chat-dialog :deep(.el-dialog) {
  border-radius: 16px;
  max-width: 85vw;
  margin: 0 auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.new-chat-dialog :deep(.el-dialog__header) {
  padding: 16px;
  margin-right: 0;
  border-bottom: 1px solid #f0f0f0;
}

.new-chat-dialog :deep(.el-dialog__body) {
  padding: 20px 16px;
}

.new-chat-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-wrapper {
  width: 100px;  /* 减小头像上传框大小 */
  height: 100px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .new-chat-dialog :deep(.el-dialog) {
    width: 85vw !important;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .new-chat-form {
    gap: 20px;
  }
  
  .avatar-wrapper {
    width: 80px;  /* 移动端更小的头像 */
    height: 80px;
  }
}
</style>
<template>
  <div :class="['message-bubble', { 'current-user': isCurrentUser }]">
    <div class="bubble-content">
      <span>{{ message.content }}</span>
      <div class="retry-button" v-if="message.userId !== currentUserId">
        
        <el-icon>
          <ArrowLeft @click="$emit('retry', message, 'previous')" />
        </el-icon>
        <span class="retry-count">{{ `${message.retryCount + 1} / 3` }}</span>
        <el-icon>
          <ArrowRight @click="$emit('retry', message, 'next')" />
        </el-icon>
      </div>
      <div class="edit-button" v-else>
        <el-icon>
          <Edit />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isCurrentUser: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['retry'])
</script>

<style scoped>
.message-bubble {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
}

.message-bubble.current-user {
  justify-content: flex-end;
}

.bubble-content {
  max-width: 60%;
  background-color: #f1f0f0;
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 14px;
  position: relative;
}

.current-user .bubble-content {
  background-color: #e6f2ff;
}

.retry-button {
  position: absolute;
  bottom: -8px;
  left: -8px;
  background-color: #f1f0f0;
  border-radius: 16px;
  padding: 2px 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.current-user .retry-button {
  background-color: #e6f2ff;
}

.retry-count {
  color: #666;
}

.edit-button {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background-color: #f1f0f0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.current-user .edit-button {
  background-color: #e6f2ff;
}

.edit-button .el-icon {
  font-size: 16px;
}
</style>
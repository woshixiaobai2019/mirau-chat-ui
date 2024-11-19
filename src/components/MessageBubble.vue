<template>
<div>
    <div 
      class="message-container"
      :class="{ 'message-right': isUser }"
      @mouseenter="showActions = true"
      @mouseleave="showActions = false"
    >
      <!-- 头像部分 -->
      <div class="avatar-container" :class="{ 'order-last': isUser }">
        <el-avatar :size="40" :src="avatar" />
        <div class="name-tag">
          <el-tag size="small" type="info" effect="plain" class="role-tag">
            {{ roleTag }}
          </el-tag>
        </div>
        <!-- 更多操作图标 -->
        <div class="more-icon-container">
          <el-icon 
            v-if="showActions"
            class="more-icon"
            @click="handleMoreActions"
          >
            <MoreFilled />
          </el-icon>
        </div>
      </div>

      <!-- 消息内容部分 -->
      <div class="message-content" :class="{ 'user-message': isUser }">
        <div class="message-text">{{ messages[currentIndex - 1] }}</div>
        
        <!-- 刷新按钮区域 -->
        <div v-if="showActions && isLatestAssistantMessage && !isUser && messages.length <= 1" 
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
      <div class="navigation-buttons" v-if="messages.length > 1 ">
        <el-icon 
          class="nav-icon" 
          :class="{ 'disabled': currentIndex <= 1 }"
          @click="handlePrevious"
        >
          <ArrowLeft />
        </el-icon>
        
        <span class="message-index">{{ currentIndex }} / {{ messages.length }}</span>
        
        <el-icon 
          class="nav-icon"
          :class="{ 'disabled': currentIndex >= messages.length }"
          @click="handleNext"
        >
          <ArrowRight />
        </el-icon>
      </div>
      
      <!-- <el-rate
        v-model="rating"
        :max="4"
        @change="handleRating"
      /> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh, MoreFilled, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

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
  'moreActions',
  'rateMessage'
])

// 状态管理
const showActions = ref(false)
const isRegenerating = ref(false)
const rating = ref(0)

// 处理函数
const handleRegenerate = () => {
  isRegenerating.value = true
  emit('regenerate')
}

const handlePrevious = () => {
  emit('previous')
}

const handleNext = () => {
    console.log(props.currentIndex)
    console.log(props.messages.length)
  emit('next')
}

const handleMoreActions = () => {
  emit('moreActions')
}

const handleRating = (value) => {
  emit('rateMessage', value)
}
</script>

<style scoped>
.message-container {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  width: 100%;
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

.user-message {
  background-color: #e5e7eb;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.refresh-container {
  position: absolute;
  top: -1.8rem;
  right: 0;
}

.refresh-icon {
  cursor: pointer;
  color: #909399;
  font-size: 1.2rem;
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
  padding: 0.5rem 4rem 0.5rem 5rem;
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
  left: 10%;  /* 位于头像容器右侧 */
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
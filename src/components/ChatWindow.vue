<template>
  <div class="chat-window-wrapper">
    <div class="message-list">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :is-current-user="message.userId === currentUserId"
        @retry="retryMessage(message)"
      />
      <div class="typing-indicator" v-if="isTyping">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
    <div class="input-area">
      <el-input
        v-model="inputMessage"
        placeholder="输入您的消息..."
        @keyup.enter="sendMessage"
        :disabled="isTyping"
      />
      <el-button type="primary" @click="sendMessage" :disabled="isTyping">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MessageBubble from './MessageBubble.vue'

const currentUserId = 1 // 模拟当前用户ID
const messages = ref([
  { id: 1, userId: 1, content: '你好!', retryCount: 0 },
  { id: 2, userId: 2, content: '你好,我是Executive coach,今天有什么需要帮助的吗?', retryCount: 0 },
  { id: 3, userId: 1, content: '我想了解一下你的服务。', retryCount: 0 },
  { id: 4, userId: 2, content: '当然,我很乐意为您提供帮助。我是一名专业的Executive coach,主要为高管提供咨询和辅导服务。', retryCount: 0 },
  { id: 5, userId: 1, content: '听起来不错,我想预约一次咨询。', retryCount: 0 },
  { id: 6, userId: 2, content: '好的,我会安排一次面谈。可以告诉我您方便的时间吗?', retryCount: 0 }
])

const isTyping = ref(false)
const inputMessage = ref('')

const sendMessage = () => {
  if (inputMessage.value.trim()) {
    messages.value.push({
      id: messages.value.length + 1,
      userId: currentUserId,
      content: inputMessage.value,
      retryCount: 0
    })
    inputMessage.value = ''
  }
}

const retryMessage = (message, direction) => {
  // 根据direction重新获取消息的逻辑
  console.log('重新获取消息:', message, direction)
  // 更新消息的retryCount
  message.retryCount++
}
</script>

<style scoped>
.chat-window-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.typing-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 24px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ccc;
  animation: typing-bounce 0.6s infinite alternate;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

.input-area {
  display: flex;
  padding: 12px;
  border-top: 1px solid #e6e6e6;
}

.input-area .el-input {
  flex: 1;
  margin-right: 12px;
}
</style>
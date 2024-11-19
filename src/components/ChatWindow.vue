<template>
  <div class="chat-window-wrapper">
    <div class="message-list">
            <MessageBubble
      :messages="userMessages"
      :isUser="true"
      avatar="/path/to/user-avatar.jpg"
      roleTag="user"
      :currentIndex="1"
      @moreActions="handleMoreActions"
    />
    <MessageBubble
      :messages="assistantMessages"
      :isUser="false"
      avatar="/path/to/assistant-avatar.jpg"
      roleTag="c.ai"
      :isLatestAssistantMessage="false"
      :currentIndex="currentAssistantIndex"
      @regenerate="handleRegenerate"
      @previous="handlePrevious"
      @next="handleNext"
      @moreActions="handleMoreActions"
      @rateMessage="handleRating"
    />
                <MessageBubble
      :messages="userMessages"
      :isUser="true"
      avatar="/path/to/user-avatar.jpg"
      roleTag="user"
      :currentIndex="1"
      @moreActions="handleMoreActions"
    />
    <MessageBubble
      :messages="assistantMessages"
      :isUser="false"
      avatar="/path/to/assistant-avatar.jpg"
      roleTag="c.ai"
      :isLatestAssistantMessage="true"
      :currentIndex="currentAssistantIndex"
      @regenerate="handleRegenerate"
      @previous="handlePrevious"
      @next="handleNext"
      @moreActions="handleMoreActions"
      @rateMessage="handleRating"
    />
    

      <div class="typing-indicator" v-if="isTyping">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>

    <chat-input @send-message="sendMessage"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'


// 模拟数据
const assistantMessages = ref([
  "I am Executive coach, how can I help you today",
  "Let me provide you with some guidance on that topic...",
  "Here's a detailed analysis of your situation...",
  "Based on your goals, I would recommend..."
])

const userMessages = ref([
  "Hello, I need some advice about career development"
])

const currentAssistantIndex = ref(1)

// 处理函数
const handleRegenerate = () => {
  console.log('Regenerating message...')
}

const handlePrevious = () => {
  if (currentAssistantIndex.value > 1) {
    currentAssistantIndex.value--
  }
}

const handleNext = () => {
    console.log("handle next")
  if (currentAssistantIndex.value < assistantMessages.value.length) {
    currentAssistantIndex.value++
  }
}

const handleMoreActions = () => {
  console.log('Opening more actions menu...')
}

const handleRating = (value) => {
  console.log('Rating:', value)
}

const isTyping = ref(false)
const inputMessage = ref('')

const sendMessage = (message) => {
  // 处理发送消息的逻辑
  console.log('发送消息:', message)
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
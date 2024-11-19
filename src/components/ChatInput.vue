<template>
  <div class="chat-input-area">
    <div class="input-container">
      <textarea
        ref="textareaRef"
        v-model="message"
        class="chat-textarea"
        placeholder="发消息..."
        :style="{ height: textareaHeight + 'px' }"
        @input="adjustHeight"
        @keydown.enter.prevent="handleSend"
      ></textarea>
      <div class="send-button" :class="{ 'active': message.trim() }" @click="handleSend">
        <el-icon><Top /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Top } from '@element-plus/icons-vue'

const message = ref('')
const textareaRef = ref(null)
const textareaHeight = ref(24)
const emit = defineEmits(['send-message'])

const adjustHeight = async () => {
  await nextTick()
  const textarea = textareaRef.value
  textarea.style.height = '24px'
  const scrollHeight = textarea.scrollHeight
  textareaHeight.value = Math.min(Math.max(scrollHeight, 24), 120)
}

const handleSend = () => {
  const trimmedMessage = message.value.trim()
  if (trimmedMessage) {
    emit('send-message', trimmedMessage)
    message.value = ''
    textareaHeight.value = 24
  }
}

onMounted(() => {
  adjustHeight()
})
</script>

<style scoped>
.chat-input-area {
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.input-container {
  display: flex;
  align-items: flex-end;
  background-color: white;
  border-radius: 20px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 0;
  font-size: 14px;
  line-height: 1.5;
  max-height: 120px;
  background: transparent;
  font-family: inherit;
}

.chat-textarea::placeholder {
  color: #999;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 8px;
  background-color: #f5f5f5;
  transition: all 0.2s;
}

.send-button.active {
  background-color: #1890ff;
  color: white;
}

.send-button:hover.active {
  background-color: #40a9ff;
}

.send-icon {
  width: 20px;
  height: 20px;
}
</style>
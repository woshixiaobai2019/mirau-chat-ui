<template>
  <div class="chat-window-wrapper">
    <div class="message-list" ref="messageListRef">
      <template v-if="currentChat">
        <template v-for="(group, groupIndex) in currentChat.messages.slice(1)" :key="groupIndex">
                   <div class="message-debug">
          </div>
          <MessageBubble
            :messages="group.messages.map(m => m.content)"
            :isUser="group.role === 'user'"
            :avatar="group.avatar"
            :roleTag="group.role === 'user' ? 'user' : 'assistant'"
            :currentIndex="group.currentIndex"
            :isLatestAssistantMessage="isLatestAssistantMessage(group, groupIndex)"
            @regenerate="() => handleRegenerate(group)"
            @previous="() => handlePrevious(group)"
            @next="() => handleNext(group)"
            @delete="() => handleDelete(group, groupIndex)"
            @edit-message="(newContent) => handleEditMessage(group, groupIndex, newContent)"
          />
        </template>
      </template>

      <div class="typing-indicator" v-if="isTyping">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>

    <chat-input 
      v-model="inputMessage"
      :disabled="isTyping"
      @send-message="sendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/store';
import type { ChatGroup, Message } from '@/types';
import MessageBubble from './MessageBubble.vue';
import ChatInput from './ChatInput.vue';
import {ElMessageBox,ElMessage} from 'element-plus'
import {chatAPI} from '@/api/chat';

const chatStore = useChatStore();
const { currentChat } = storeToRefs(chatStore);

const messageListRef = ref<HTMLDivElement | null>(null);
const inputMessage = ref('');
const isTyping = ref(false);



// 判断是否是助手的最新消息
const isLatestAssistantMessage = (group: ChatGroup, groupIndex: number) => {
  if (group.role !== 'assistant') return false;
  const assistantGroups = currentChat.value?.messages.filter(g => g.role === 'assistant') || [];
  return assistantGroups[assistantGroups.length - 1] === group;
};
// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  }, 100);
};


const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // 如果没有当前对话，创建一个新的
    if (!currentChat.value?.id) {
      await chatStore.startNewChat({
        name: 'New Chat',
        avatar: '/default-avatar.png',
        systemPrompt: 'You are a helpful assistant.'
      });
    }

    const chatId = currentChat.value!.id;
    
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: Date.now()
    };
    
    await chatStore.addMessage(chatId, userMessage);
    inputMessage.value = '';
    scrollToBottom();

    // 创建助手消息占位符
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
      isPending: true
    };

    await chatStore.addMessage(chatId, assistantMessage);
    isTyping.value = true;

    let fullResponse = '';
    
    try {
      const config = currentChat.value!.characterConfig;
      
      await chatAPI.streamChat(
        currentChat.value!.messages,
        config,
        (chunk: string) => {
          fullResponse += chunk;
          chatStore.editMessage(chatId, assistantMessage.id, fullResponse,true);
          scrollToBottom();
        },
        (error: Error) => {
          console.error('Error in chat stream:', error);
          ElMessage({
            message: `Error: ${error.message}`,
            type: 'error',
            duration: 5000
          });
          chatStore.editMessage(
            chatId, 
            assistantMessage.id, 
            'Error: Failed to get response. Please try again.',true
          );
          assistantMessage.isPending = false;
          isTyping.value = false;
        },
        () => {
          isTyping.value = false;
          assistantMessage.isPending = false;
          chatStore.editMessage(chatId, assistantMessage.id, fullResponse,true);
          scrollToBottom();
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      ElMessage({
        message: 'Failed to send message. Please try again.',
        type: 'error',
        duration: 5000
      });
      isTyping.value = false;
      assistantMessage.isPending = false;
      chatStore.editMessage(
        chatId, 
        assistantMessage.id, 
        'Error: Failed to send message. Please try again.',true
      );
    }
  };

  // 重新生成消息
  const handleRegenerate = async (group: ChatGroup) => {
    if (!currentChat.value?.id) return;
    
    const chatId = currentChat.value.id;
    const lastMessage = group.messages[group.currentIndex];
    if (!lastMessage || lastMessage.role !== 'assistant') return;
    
    // 设置消息为待处理状态
    isTyping.value = true;
    await chatStore.editMessage(chatId, lastMessage.id, "");
    const newLastMessage =  group.messages[group.currentIndex];
    let newResponse = '';
    
    try {
      const config = currentChat.value.characterConfig;
      
      // 获取到当前消息之前的所有消息历史
      const messageHistory = currentChat.value.messages.slice(0, -1);
      
      await chatAPI.streamChat(
        messageHistory,
        config,
        (chunk: string) => {
          newResponse += chunk;
          chatStore.editMessage(chatId, newLastMessage.id, newResponse,true);
          scrollToBottom();
        },
        (error: Error) => {
          console.error('Error in regenerating message:', error);
          ElMessage({
            message: `Error: ${error.message}`,
            type: 'error',
            duration: 5000
          });
          // 恢复原始消息
          chatStore.editMessage(chatId, newLastMessage.id, "Failed to regenerate message:",true);
          isTyping.value = false;
        },
        () => {
          isTyping.value = false;
          chatStore.editMessage(chatId, newLastMessage.id, newResponse,true);
          scrollToBottom();
        }
      );
    } catch (error) {
      console.error('Failed to regenerate message:', error);
      ElMessage({
        message: 'Failed to regenerate message. Please try again.',
        type: 'error',
        duration: 5000
      });
      // 恢复原始消息
      chatStore.editMessage(chatId, newLastMessage.id, "Failed to regenerate message:",true);
      isTyping.value = false;
    }
  };

  // 处理查看上一条消息
  const handlePrevious = async (group: ChatGroup) => {
    console.log("handlePrevious")
    if (!currentChat.value?.id) return;
    
    const lastMessage = group.messages[group.currentIndex];
    if (!lastMessage) return;

    await chatStore.switchMessageVariant(
      currentChat.value.id,
      lastMessage.id,
      'prev'
    );
  };

  // 处理查看下一条消息
  const handleNext = async (group: ChatGroup) => {
    if (!currentChat.value?.id) return;
    
    const lastMessage = group.messages[group.currentIndex];
    if (!lastMessage) return;
    if (group.currentIndex === group.messages.length - 1){
      await handleRegenerate(group)
    }
    else{
    await chatStore.switchMessageVariant(
      currentChat.value.id,
      lastMessage.id,
      'next'
    );
    }
  };

  // 处理消息编辑
  const handleEditMessage = async (group: ChatGroup, messageIndex: number, newContent: string) => {
    console.log("handleEditMessage")
    if (!currentChat.value?.id) return;
    
    const message = group.messages[messageIndex];
    if (!message) return;

    try {
      await chatStore.editMessage(
        currentChat.value.id,
        message.id,
        newContent
      );
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };
    // 添加删除消息处理函数
  const handleDelete = async (group: ChatGroup, groupIndex: number) => {
    if (!currentChat.value?.id) return;

    // 如果是系统消息，不允许删除
    if (group.role === 'system') {
      ElMessage.warning('Cannot delete system messages');
      return;
    }
    await chatStore.deleteMessageGroup(currentChat.value.id, groupIndex);
    ElMessage.success('Message deleted successfully');

  };


// 监听聊天历史变化，自动滚动到底部
watch(() => currentChat.value?.messages, () => {
  scrollToBottom();
}, { deep: true });

// 组件挂载时初始化
onMounted(() => {
  scrollToBottom();
});
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
  gap: 4px;
  padding: 8px;
  justify-content: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  animation: typing 1s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
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
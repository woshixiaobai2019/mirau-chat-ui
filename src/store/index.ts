import localforage from 'localforage';
import { defineStore } from 'pinia';
import type { 
  ChatState, 
  CharacterState, 
  ChatListItem, 
  ChatHistory, 
  StartNewChatParams,
  ChatGroup,
  Message,
  CharacterConfig
} from '../types';
// 在文件顶部的类型定义部分添加新的类型
interface ExportData {
  chatState: ChatState;
  characterState: CharacterState;
  version: string;
  exportDate: number;
}
// 初始化 LocalForage
localforage.config({
  name: 'mirau-local',
  storeName: 'chat_data'
});

// 用于类型检查的函数
function isChatState(obj: unknown): obj is ChatState {
  if (!obj || typeof obj !== 'object') return false;
  const state = obj as Partial<ChatState>;
  return (
    'currentChatId' in state &&
    Array.isArray((state as ChatState).chatList) &&
    typeof (state as ChatState).chatHistories === 'object'
  );
}

function isCharacterState(obj: unknown): obj is CharacterState {
  if (!obj || typeof obj !== 'object') return false;
  const state = obj as Partial<CharacterState>;
  return (
    Array.isArray((state as CharacterState).characters) &&
    ('currentCharacter' in state)
  );
}

// 创建用于生成唯一ID的函数
const generateId = (): string => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Chat Store
export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    currentChatId: null,
    chatList: [],
    chatHistories: {},
  }),

  getters: {
    currentChat: (state): ChatHistory | null => {
      if (!state.currentChatId) return null;
      return state.chatHistories[state.currentChatId] || null;
    },
    
    sortedChatList: (state) => {
      return [...state.chatList].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
    }
  },

  actions: {
    // 初始化存储
    async initialize() {
      try {
        const savedState = await localforage.getItem('chatState');
        if (savedState && isChatState(savedState)) {
          this.$patch(savedState);
        }
        if (this.currentChatId == null) {
          await this.startNewChat({
            name: 'Mirau',
            avatar: 'https://a.520gexing.com/uploads/allimg/2021042109/uqaqhuvavt0.jpg',
            systemPrompt: 'You are a helpful assistant.'
          });
        }
      } catch (error) {
        console.error('Failed to initialize chat store:', error);
      }
    },

    // 保存状态到 LocalForage
    async saveState() {
      try {
        // 创建一个可序列化的数据副本
        const stateToSave: ChatState = {
          currentChatId: this.currentChatId,
          chatList: JSON.parse(JSON.stringify(this.chatList)),
          chatHistories: JSON.parse(JSON.stringify(this.chatHistories)),
        };
        
        console.log('Saving userchat state:');
        console.log(stateToSave)
        await localforage.setItem('chatState', stateToSave);
      } catch (error) {
        console.error('Failed to save chat state:', error);
      }
    },
    // 导出数据
    async exportData() {
      const chatStore = useChatStore();
      const characterStore = useCharacterStore();
      
      const exportData: ExportData = {
        chatState: {
          currentChatId: chatStore.currentChatId,
          chatList: chatStore.chatList,
          chatHistories: chatStore.chatHistories,
        },
        characterState: {
          characters: characterStore.characters,
          currentCharacter: characterStore.currentCharacter,
        },
        version: '1.0',
        exportDate: Date.now(),
      };

      // 创建 Blob 对象
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mirau-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // 导入数据
    async importData(file: File) {
      try {
        const text = await file.text();
        const importedData: ExportData = JSON.parse(text);
        
        // 验证导入的数据结构
        if (!importedData.chatState || !importedData.characterState || !importedData.version) {
          throw new Error('Invalid backup file format');
        }

        const chatStore = useChatStore();
        const characterStore = useCharacterStore();

        // 更新 Chat Store
        if (isChatState(importedData.chatState)) {
          chatStore.$patch(importedData.chatState);
          await chatStore.saveState();
        }

        // 更新 Character Store
        if (isCharacterState(importedData.characterState)) {
          characterStore.$patch(importedData.characterState);
          await characterStore.saveState();
        }

        return true;
      } catch (error) {
        console.error('Failed to import data:', error);
        throw new Error('Failed to import data: ' + (error as Error).message);
      }
    },
    // 开始新对话
    async startNewChat({ avatar, systemPrompt, name }: StartNewChatParams) {
      const newChatId = Date.now();
      const newChatItem: ChatListItem = {
        id: newChatId,
        name,
        avatar,
        lastMessage: '',
        pinned: false,
        systemPrompt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newChatHistory: ChatHistory = {
        id: newChatId,
        characterConfig: {
          name,
          avatar,
          systemPrompt,
          temperature: 0.7,
          topP: 0.9,
          model:"qwen2_5-14b-instruct"
        },
        messages: [{
          role: 'system',
          avatar,
          messages: [{
            id: generateId(),
            content: systemPrompt,
            role: 'system',
            timestamp: Date.now(),
          }],
          currentIndex: 0,
        }],
      };

      this.chatList.push(newChatItem);
      this.chatHistories[newChatId] = newChatHistory;
      this.currentChatId = newChatId;
      await this.saveState();
    },

    // 切换对话
    async switchChat(chatId: number) {
      this.currentChatId = chatId;
      await this.saveState();
    },

    // 更新消息
    async updateLastMessage(chatId: number, message: string) {
      const chatItem = this.chatList.find(item => item.id === chatId);
      if (chatItem) {
        chatItem.lastMessage = message;
        chatItem.updatedAt = Date.now();
        await this.saveState();
      }
    },

    // 添加消息
    async addMessage(chatId: number, message: Message) {
      const chat = this.chatHistories[chatId];
      if (!chat) return;

      let currentGroup = chat.messages[chat.messages.length - 1];
      if (currentGroup?.role !== message.role) {
        currentGroup = {
          role: message.role,
          avatar: message.role === 'user' ? '/user-avatar.png' : chat.characterConfig.avatar,
          messages: [],
          currentIndex: 0,
        };
        chat.messages.push(currentGroup);
      }
      console.log(chat)
      currentGroup.messages.push(message);
      await this.updateLastMessage(chatId, message.content);
      await this.saveState();
    },

    // 编辑消息
    // 更新后的编辑消息函数
    async editMessage(chatId: number, messageId: string, newContent: string,generated=false) {
      const chat = this.chatHistories[chatId];
      if (!chat) return;

      for (const group of chat.messages) {
        const messageIndex = group.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          const message = group.messages[messageIndex];
          
          if (message.role === 'user' || generated) {
            // 用户消息直接修改
            message.content = newContent;
            if (messageIndex === group.messages.length - 1) {
              await this.updateLastMessage(chatId, newContent);
            }
          } else {
            // 助手消息创建新变体
            // 删除当前索引之后的所有变体
            group.messages = group.messages.slice(0, group.currentIndex + 1);
            
            // 添加新变体
            const newVariant: Message = {
              id: generateId(),
              content: newContent,
              role: message.role,
              timestamp: Date.now()
            };
            group.messages.push(newVariant);
            
            // 更新当前索引指向新变体
            group.currentIndex = group.messages.length - 1;

            // 如果这是该组最后一条消息，更新 lastMessage
            if (group === chat.messages[chat.messages.length - 1]) {
              await this.updateLastMessage(chatId, newContent);
            }
          }
          break;
        }
      }
      await this.saveState();
    },
        // 添加删除消息组的方法
        async deleteMessageGroup(chatId: number, groupIndex: number) {
          const chat = this.chatHistories[chatId];
          if (!chat) return;
    
          // 检查索引是否有效
          if (groupIndex < 0 || groupIndex >= chat.messages.length) return;
    
          // 不允许删除系统消息
          if (chat.messages[groupIndex].role === 'system') return;
    
          // 删除消息组
          chat.messages.splice(groupIndex, 1);
    
          // 如果删除的是最后一组消息，更新 lastMessage
          if (chat.messages.length > 0) {
            const lastGroup = chat.messages[chat.messages.length - 1];
            const lastMessage = lastGroup.messages[lastGroup.currentIndex];
            await this.updateLastMessage(chatId, lastMessage.content);
          } else {
            // 如果没有消息了，清空 lastMessage
            await this.updateLastMessage(chatId, '');
          }
    
          await this.saveState();
        },

    // 添加用于切换消息变体的函数
    async switchMessageVariant(chatId: number, messageId: string, direction: 'prev' | 'next') {
      const chat = this.chatHistories[chatId];
      if (!chat) return;

      for (const group of chat.messages) {
        const messageIndex = group.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          if (direction === 'prev' && group.currentIndex > 0) {
            group.currentIndex--;
            if (group === chat.messages[chat.messages.length - 1]) {
              await this.updateLastMessage(chatId, group.messages[group.currentIndex].content);
            }
          } else if (direction === 'next' && group.currentIndex < group.messages.length - 1) {
            group.currentIndex++;
            if (group === chat.messages[chat.messages.length - 1]) {
              await this.updateLastMessage(chatId, group.messages[group.currentIndex].content);
            }
          }
          break;
        }
      }
      await this.saveState();
    },

    // 获取消息的所有变体
    getMessageVariants(chatId: number, messageId: string) {
      const chat = this.chatHistories[chatId];
      if (!chat) return null;

      for (const group of chat.messages) {
        const messageIndex = group.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          return {
            variants: group.messages,
            currentIndex: group.currentIndex
          };
        }
      }
      return null;
    },


    // 删除对话
    async deleteChat(chatId: number) {
      this.chatList = this.chatList.filter(item => item.id !== chatId);
      delete this.chatHistories[chatId];
      if (this.currentChatId === chatId) {
        this.currentChatId = this.chatList[0]?.id || null;
      }
      await this.saveState();
    },

    // 置顶/取消置顶对话
    async togglePin(chatId: number) {
      const chatItem = this.chatList.find(item => item.id === chatId);
      if (chatItem) {
        chatItem.pinned = !chatItem.pinned;
        await this.saveState();
      }
    },
  },
});

// Character Store
export const useCharacterStore = defineStore('character', {
  state: (): CharacterState => ({
    characters: [],
    currentCharacter: null,
  }),

  actions: {
    // 初始化存储
    async initialize() {
      try {
        const savedState = await localforage.getItem('characterState');
        if (savedState && isCharacterState(savedState)) {
          this.$patch(savedState);
        }
      } catch (error) {
        console.error('Failed to initialize character store:', error);
      }
    },

    // 保存状态到 LocalForage
    async saveState() {
      
      try {
        const stateToSave: CharacterState = {
          characters: JSON.parse(JSON.stringify(this.characters)),
          currentCharacter:JSON.parse(JSON.stringify(this.currentCharacter)),
        };
        console.log('Saving character state:');
        console.log(stateToSave)
        await localforage.setItem('characterState', stateToSave);
      } catch (error) {
        console.error('Failed to save character state:', error);
      }
    },

    // 添加或更新角色
    async updateCharacter(character: CharacterConfig) {
      const index = this.characters.findIndex(c => c.name === character.name);
      if (index !== -1) {
        this.characters[index] = character;
      } else {
        this.characters.push(character);
      }
      await this.saveState();
    },

    // 选择当前角色
    async selectCharacter(name: string) {
      const character = this.characters.find(c => c.name === name);
      if (character) {
        this.currentCharacter = character;
        await this.saveState();
      }
    },

    // 删除角色
    async deleteCharacter(name: string) {
      this.characters = this.characters.filter(c => c.name !== name);
      if (this.currentCharacter?.name === name) {
        this.currentCharacter = this.characters[0] || null;
      }
      await this.saveState();
    },
  },
});
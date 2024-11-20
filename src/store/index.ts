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
    async editMessage(chatId: number, messageId: string, newContent: string) {
      const chat = this.chatHistories[chatId];
      if (!chat) return;

      for (const group of chat.messages) {
        const message = group.messages.find(m => m.id === messageId);
        if (message) {
          message.content = newContent;
          if (group.messages.indexOf(message) === group.messages.length - 1) {
            await this.updateLastMessage(chatId, newContent);
          }
          break;
        }
      }
      await this.saveState();
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
          characters: this.characters,
          currentCharacter: this.currentCharacter,
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
import { createStore } from 'vuex'

// 定义类型
interface Message {
  id: number
  content: string
  timestamp: number
  sender: 'user' | 'ai'
}

interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
}

interface RootState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
}

export default createStore<RootState>({
  state: {
    conversations: [],
    currentConversation: null,
    messages: []
  },
  getters: {
    getCurrentConversation: (state) => state.currentConversation,
    getConversations: (state) => state.conversations,
    getMessages: (state) => state.messages
  },
  mutations: {
    SET_CURRENT_CONVERSATION(state, conversation: Conversation) {
      state.currentConversation = conversation
    },
    ADD_MESSAGE(state, message: Message) {
      state.messages.push(message)
    },
    ADD_CONVERSATION(state, conversation: Conversation) {
      state.conversations.push(conversation)
    }
  },
  actions: {
    setCurrentConversation({ commit }, conversation: Conversation) {
      commit('SET_CURRENT_CONVERSATION', conversation)
    },
    addMessage({ commit }, message: Message) {
      commit('ADD_MESSAGE', message)
    },
    addConversation({ commit }, conversation: Conversation) {
      commit('ADD_CONVERSATION', conversation)
    }
  },
  modules: {
  }
})
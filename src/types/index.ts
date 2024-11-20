// 基础类型定义
export type Role = 'assistant' | 'user' | 'system';

// 聊天消息的类型
export interface Message {
  id: string;
  content: string;
  role: Role;
  timestamp: number;
  isEditing?: boolean;
  isPending?: boolean;
}

// 对话历史中的一组消息
export interface ChatGroup {
  role: Role;
  avatar: string;
  messages: Message[];
  currentIndex: number;
}

// 聊天列表项的类型
export interface ChatListItem {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  pinned: boolean;
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
}

// AI角色的配置类型
export interface CharacterConfig {
  name: string;
  avatar: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
}

// 聊天历史记录的类型
export interface ChatHistory {
  id: number;
  characterConfig: CharacterConfig;
  messages: ChatGroup[];
}

// 创建新对话的请求参数
export interface StartNewChatParams {
  avatar: string;
  systemPrompt: string;
  name: string;
}

// 发送消息的请求参数
export interface SendMessageParams {
  userMessage: string;
  systemPrompt: string;
  history: ChatGroup[];
  temperature: number;
  topP: number;
}

// 聊天状态的存储类型
export interface ChatState {
  currentChatId: number | null;
  chatList: ChatListItem[];
  chatHistories: Record<number, ChatHistory>;
}

// 角色状态的存储类型
export interface CharacterState {
  characters: CharacterConfig[];
  currentCharacter: CharacterConfig | null;
}

// Message Bubble Props类型
export interface MessageBubbleProps {
  message: Message;
  isLatestAssistantMessage: boolean;
  canEdit: boolean;
  onEdit: (messageId: string, newContent: string) => void;
  onRefresh?: () => void;
  onRetry?: () => void;
}

// localStorage中存储的数据结构
export interface LocalStorageData {
  chatState: ChatState;
  characterState: CharacterState;
}

// 工具类型：用于生成唯一ID
export type GenerateId = () => string;

// API响应的类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
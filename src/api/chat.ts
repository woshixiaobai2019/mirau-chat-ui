// api/chat.ts
import type { Message, ChatGroup, CharacterConfig } from '../types';

interface ApiRequestBody {
  messages: {
    role: string;
    content: string;
  }[];
  model: string;
  top_p: number;
  temperature: number;
  stream: boolean;
}

// 默认配置
const DEFAULT_CONFIG: Partial<CharacterConfig> = {
  model: "qwen2_5-14b-instruct",
  temperature: 0.8,
  topP: 0.7
};

class ChatAPI {
    private static instance: ChatAPI;
    private API_ENDPOINT = 'http://localhost:8885/v1/chat/completions';
  
    private constructor() {}
  
    public static getInstance(): ChatAPI {
      if (!ChatAPI.instance) {
        ChatAPI.instance = new ChatAPI();
      }
      return ChatAPI.instance;
    }
  
    private formatMessages(history: ChatGroup[]): { role: string; content: string }[] {
      const formattedMessages: { role: string; content: string }[] = [];
      
      for (const group of history) {
        const currentMsg = group.messages[group.currentIndex];
        formattedMessages.push({ role: currentMsg.role, content: currentMsg.content });
      }
      
      return formattedMessages;
    }
  
    public async streamChat(
      history: ChatGroup[],
      config: Partial<CharacterConfig>,
      onMessage: (chunk: string) => void,
      onError: (error: Error) => void,
      onComplete: () => void
    ): Promise<void> {
      try {
        const messages_all = this.formatMessages(history);
        
        const finalConfig = {
          ...DEFAULT_CONFIG,
          ...config
        };
        
        const body: ApiRequestBody = {
          messages:[{"role":"system","content":finalConfig.systemPrompt!}].concat(messages_all.slice(1,)),
          model: finalConfig.model!,
          temperature: finalConfig.temperature!,
          top_p: finalConfig.topP!,
          stream: true // 启用流式传输
        };
  
        const response = await fetch(this.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify(body)
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is null');
        }
  
        const decoder = new TextDecoder();
        let buffer = '';
  
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }
  
          // 将新的数据块添加到缓冲区
          buffer += decoder.decode(value, { stream: true });
          
          // 处理数据流
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
  
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data.trim() === '[DONE]') {
                onComplete();
                continue;
              }
  
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  onMessage(content);
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        onError(error as Error);
      }
    }

  public validateMessageSequence(history: ChatGroup[]): boolean {
    if (history.length === 0) return true;

    // 检查是否以system消息开始
    if (history[0].role !== 'system') {
      return false;
    }

    // 检查消息交替
    for (let i = 1; i < history.length; i++) {
      const currentRole = history[i].role;
      const prevRole = history[i - 1].role;

      if (currentRole === 'system') return false;
      if (currentRole === prevRole) return false;
      if (currentRole === 'assistant' && prevRole !== 'user') return false;
      if (currentRole === 'user' && prevRole !== 'assistant' && prevRole !== 'system') return false;
    }

    return true;
  }
}

export const chatAPI = ChatAPI.getInstance();
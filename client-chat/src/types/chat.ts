// types/chat.ts
export interface User {
  id: string;
  name: string;
}

export interface Message {
  id?: string;
  author: string;
  text: string;
  isOwnMessage: boolean;
  timestamp?: number;
}

export interface ChatState {
  users: User[];
  selectedUserId: string | null;
  messages: Record<string, Message[]>;
  input: string;
  isConnected: boolean;
  error: string | null;
}

export interface MessagePayload {
  sender: string;
  recipient: string;
  message: string;
}

export interface MessageResponse {
  author: string;
  text: string;
}
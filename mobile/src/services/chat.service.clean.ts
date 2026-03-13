/**
 * chat.service.ts
 * REST calls for conversations and message history.
 * Socket.IO live events are handled separately in chatSocket.service.ts
 */
import { api } from './api';

export interface ChatConversation {
  _id: string;
  userId: string;
  userName: string;
  adminId?: string;
  status: 'open' | 'closed';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  senderName: string;
  text: string;
  status: 'pending' | 'sent' | 'delivered' | 'read';
  clientId?: string;
  createdAt: string;
}

/** Returns conversations for the current user (own one) or all (if admin) */
export const getConversations = async (): Promise<ChatConversation[]> => {
  const res = await api.get('/chat/conversations');
  return res.data;
};

/** Gets or creates the user's support conversation */
export const getOrCreateConversation = async (): Promise<ChatConversation> => {
  const res = await api.post('/chat/conversations');
  return res.data;
};

/** Returns paginated message history for a conversation */
export const getMessages = async (conversationId: string, page = 1): Promise<ChatMessage[]> => {
  const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page },
  });
  return res.data;
};

/** Mark all messages in conversation as read */
export const markConversationRead = async (conversationId: string): Promise<void> => {
  await api.patch(`/chat/conversations/${conversationId}/read`);
};


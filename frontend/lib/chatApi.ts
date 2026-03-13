import { apiGet, apiPost } from "./api";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string;
  message_type: "text";
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  type: "direct" | "activity_group";
  title: string;
  avatar_url: string | null;
  activity_id?: string;
  latest_message?: ChatMessage | null;
}

export function listConversations(): Promise<ConversationSummary[]> {
  return apiGet<ConversationSummary[]>("/api/v1/chat/conversations");
}

export function getOrCreateDirectConversation(friendProfileId: string): Promise<ConversationSummary> {
  return apiPost<ConversationSummary>(`/api/v1/chat/conversations/direct/${friendProfileId}`);
}

export function listMessages(conversationId: string): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(`/api/v1/chat/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  return apiPost<ChatMessage>(`/api/v1/chat/conversations/${conversationId}/messages`, { content });
}

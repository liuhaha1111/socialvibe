import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiGet, apiPost } from "../lib/api";

export interface ChatConversation {
  id: string;
  type: "direct" | "system";
  title: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  other_profile_id: string | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_profile_id: string | null;
  sender_name: string | null;
  sender_avatar_url: string | null;
  content: string;
  message_type: "text" | "system";
  created_at: string;
}

interface ChatContextType {
  conversations: ChatConversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  loadingConversations: boolean;
  refreshConversations: () => Promise<void>;
  loadMessages: (conversationId: string, limit?: number) => Promise<ChatMessage[]>;
  sendMessage: (conversationId: string, content: string) => Promise<ChatMessage>;
  markRead: (conversationId: string, lastReadMessageId?: string) => Promise<void>;
  openConversation: (conversationId: string) => Promise<ChatMessage[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [loadingConversations, setLoadingConversations] = useState(true);

  const refreshConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await apiGet<ChatConversation[]>("/api/v1/me/conversations");
      setConversations(data);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations().catch((error) => {
      console.error("Failed to load conversations:", error);
    });
  }, [refreshConversations]);

  const loadMessages = useCallback(async (conversationId: string, limit = 50) => {
    const data = await apiGet<ChatMessage[]>(`/api/v1/me/conversations/${conversationId}/messages?limit=${limit}`);
    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: data
    }));
    return data;
  }, []);

  const markRead = useCallback(
    async (conversationId: string, lastReadMessageId?: string) => {
      await apiPost("/api/v1/me/conversations/" + conversationId + "/read", {
        last_read_message_id: lastReadMessageId
      });
      await refreshConversations();
    },
    [refreshConversations]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const data = await apiPost<ChatMessage>(`/api/v1/me/conversations/${conversationId}/messages`, {
        content
      });
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), data]
      }));
      await refreshConversations();
      return data;
    },
    [refreshConversations]
  );

  const openConversation = useCallback(
    async (conversationId: string) => {
      const data = await loadMessages(conversationId);
      const lastMessageId = data[data.length - 1]?.id;
      await markRead(conversationId, lastMessageId);
      return data;
    },
    [loadMessages, markRead]
  );

  const value = useMemo(
    () => ({
      conversations,
      messagesByConversation,
      loadingConversations,
      refreshConversations,
      loadMessages,
      sendMessage,
      markRead,
      openConversation
    }),
    [conversations, messagesByConversation, loadingConversations, refreshConversations, loadMessages, sendMessage, markRead, openConversation]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

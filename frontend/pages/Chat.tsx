import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { listMessages, sendMessage, type ChatMessage, type ConversationSummary } from "../lib/chatApi";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

interface ChatLocationState {
  conversation?: ConversationSummary;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export const Chat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const state = location.state as ChatLocationState | null;
  const conversation = state?.conversation;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");

  const conversationId = conversation?.id;

  const refreshMessages = useCallback(async () => {
    if (!conversationId) {
      return;
    }
    setLoading(true);
    try {
      const data = await listMessages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "消息加载失败");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    refreshMessages().catch(() => undefined);
  }, [refreshMessages]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((item) => item.id === incoming.id) ? prev : [...prev, incoming]));
        }
      )
      .subscribe();

    return () => {
      if (typeof (channel as { unsubscribe?: () => void }).unsubscribe === "function") {
        (channel as { unsubscribe: () => void }).unsubscribe();
      }
    };
  }, [conversationId]);

  const canSend = useMemo(() => content.trim().length > 0 && Boolean(conversationId), [content, conversationId]);

  const handleSend = async () => {
    if (!conversationId || !content.trim()) {
      return;
    }
    try {
      const created = await sendMessage(conversationId, content.trim());
      setMessages((prev) => (prev.some((item) => item.id === created.id) ? prev : [...prev, created]));
      setContent("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    }
  };

  if (!conversationId || !conversation) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center max-w-sm w-full">
          <h1 className="text-xl font-bold text-slate-900">未选择会话</h1>
          <p className="text-slate-500 text-sm mt-2">请先在消息列表中选择一个会话。</p>
          <button onClick={() => navigate("/chat-list")} className="mt-5 w-full h-11 rounded-full bg-primary text-white font-semibold">
            返回消息列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light h-screen flex flex-col justify-center overflow-hidden">
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden mx-auto">
        <header className="flex-none bg-white border-b border-slate-100 z-20">
          <div className="h-10 w-full bg-white" />
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => navigate("/chat-list")}
              className="text-slate-900 flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col items-center flex-1 mx-2">
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">{conversation.title}</h2>
              <p className="text-xs text-slate-500">{conversation.type === "activity_group" ? "活动群聊" : "好友私聊"}</p>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background-light p-4 flex flex-col gap-3">
          {loading && <p className="text-xs text-slate-500 text-center">加载中...</p>}
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          {!loading &&
            messages.map((message) => {
              const isMine = user.id && message.sender_profile_id === user.id;
              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                      isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-slate-900 rounded-bl-none border border-slate-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-white/80" : "text-slate-400"}`}>{formatTime(message.created_at)}</p>
                  </div>
                </div>
              );
            })}

          {!loading && messages.length === 0 && <p className="text-sm text-slate-500 text-center py-8">还没有消息，发一条开始聊天吧。</p>}
        </main>

        <footer className="flex-none bg-white px-4 py-3 pb-8 border-t border-slate-100 z-20">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-slate-100 rounded-3xl flex items-center px-4 py-2 min-h-[48px]">
              <input
                className="w-full bg-transparent border-none p-0 text-slate-900 placeholder-slate-400 focus:ring-0 text-[16px]"
                placeholder="输入消息..."
                type="text"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSend().catch(() => undefined);
                  }
                }}
              />
            </div>
            <button
              onClick={() => handleSend().catch(() => undefined)}
              disabled={!canSend}
              className="flex-none bg-primary text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed h-[48px] w-[48px] flex items-center justify-center"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

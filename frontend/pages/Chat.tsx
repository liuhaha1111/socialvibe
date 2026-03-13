import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../context/ChatContext";

const SELF_PROFILE_ID = "11111111-1111-1111-1111-111111111111";

function formatMessageTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { conversations, messagesByConversation, openConversation, sendMessage } = useChat();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversation = useMemo(
    () => conversations.find((item) => item.id === conversationId),
    [conversations, conversationId]
  );
  const messages = conversationId ? messagesByConversation[conversationId] ?? [] : [];

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    setLoading(true);
    setError(null);
    openConversation(conversationId)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load conversation");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conversationId, openConversation]);

  const handleSend = async () => {
    if (!conversationId) {
      return;
    }

    const content = input.trim();
    if (!content) {
      return;
    }

    setSending(true);
    setError(null);
    try {
      await sendMessage(conversationId, content);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Conversation ID is missing.</p>
      </div>
    );
  }

  return (
    <div className="bg-background-light h-screen flex flex-col justify-center overflow-hidden">
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden mx-auto">
        <header className="flex-none bg-white border-b border-slate-100 z-20 px-4 py-3 pt-12">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/chat-list")}
              className="text-slate-900 flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col items-center flex-1 mx-2 min-w-0">
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight truncate">
                {conversation?.title ?? "Conversation"}
              </h2>
              <span className="text-xs font-medium text-slate-500">{conversation?.type === "system" ? "System" : "Direct"}</span>
            </div>
            <div className="w-8" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background-light p-4 flex flex-col gap-4">
          {loading && <p className="text-sm text-slate-500">Loading messages...</p>}
          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          {!loading && messages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}

          {messages.map((message) => {
            const isMine = message.sender_profile_id === SELF_PROFILE_ID;
            const isSystem = message.message_type === "system" || message.sender_profile_id === null;

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                    {message.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? "bg-primary text-white" : "bg-white text-slate-800"}`}>
                  {!isMine && (
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">{message.sender_name ?? "User"}</p>
                  )}
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-white/80" : "text-slate-400"}`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </main>

        <footer className="flex-none bg-white px-4 py-3 pb-8 border-t border-slate-100 z-20">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-slate-100 rounded-3xl flex items-center px-4 py-2 min-h-[48px] focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input
                className="w-full bg-transparent border-none p-0 text-slate-900 placeholder-slate-400 focus:ring-0 text-[16px]"
                placeholder="Type a message..."
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="flex-none bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 h-[48px] w-[48px] flex items-center justify-center disabled:opacity-60"
              aria-label="Send"
            >
              <Send size={22} className="ml-0.5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

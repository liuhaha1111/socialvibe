import React, { useMemo, useState } from "react";
import { ArrowLeft, Bell, MessageSquare, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/ChatContext";

function formatConversationTime(value: string | null): string {
  if (!value) {
    return "";
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
}

export const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const { conversations, loadingConversations } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.title.toLowerCase().includes(q) ||
        (conversation.last_message ?? "").toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery]);

  return (
    <div className="bg-background-light min-h-screen text-slate-900 pb-20 font-sans flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-5 pt-12 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-900"
                aria-label="Back"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-extrabold tracking-tight">Messages</h1>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input
              className="w-full bg-white border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar">
          {loadingConversations && <p className="px-5 py-4 text-sm text-slate-500">Loading conversations...</p>}

          {!loadingConversations && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-slate-500">
              <MessageSquare className="mx-auto mb-3 opacity-40" size={28} />
              <p className="font-semibold">No conversations yet</p>
            </div>
          )}

          {filtered.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => navigate(`/chat/${conversation.id}`)}
              className="w-full text-left flex items-center gap-3 px-5 py-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer"
            >
              <div className="relative shrink-0">
                {conversation.type === "system" ? (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Bell size={22} className="text-white" />
                  </div>
                ) : conversation.avatar_url ? (
                  <img
                    src={conversation.avatar_url}
                    alt={conversation.title}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <MessageSquare size={18} className="text-slate-500" />
                  </div>
                )}

                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                    {conversation.unread_count}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-base font-bold text-slate-900 truncate">{conversation.title}</h3>
                  <span className="text-[10px] font-medium text-slate-400">
                    {formatConversationTime(conversation.last_message_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate pr-4">{conversation.last_message ?? "No messages yet"}</p>
              </div>
            </button>
          ))}
        </main>
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listConversations, type ConversationSummary } from "../lib/chatApi";

function formatTime(iso?: string): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  useEffect(() => {
    let active = true;
    listConversations()
      .then((data) => {
        if (!active) {
          return;
        }
        setConversations(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "加载会话失败");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return conversations;
    }
    return conversations.filter((item) => {
      const text = `${item.title} ${item.latest_message?.content ?? ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [conversations, search]);

  return (
    <div className="bg-background-light min-h-screen text-slate-900 pb-20 font-sans flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-5 pt-12 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-900"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-extrabold tracking-tight">消息</h1>
            </div>
            <button
              onClick={() => navigate("/friends")}
              className="hover:text-primary transition-colors text-slate-600"
              aria-label="好友管理"
            >
              <UserPlus size={24} />
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input
              className="w-full bg-white border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              placeholder="搜索会话"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar">
          {loading && <p className="px-5 py-6 text-sm text-slate-500">加载中...</p>}
          {!loading && error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}

          {!loading &&
            !error &&
            filtered.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => navigate("/chat", { state: { conversation } })}
                className="w-full text-left flex items-center gap-3 px-5 py-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <div className="relative shrink-0">
                  {conversation.avatar_url ? (
                    <img
                      src={conversation.avatar_url}
                      alt={conversation.title}
                      className={`w-12 h-12 ${
                        conversation.type === "activity_group" ? "rounded-lg" : "rounded-full"
                      } object-cover border border-gray-100`}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {conversation.title.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-base font-bold text-slate-900 truncate">{conversation.title}</h3>
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatTime(conversation.latest_message?.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate pr-4">
                    {conversation.latest_message?.content ?? "暂无消息"}
                  </p>
                </div>
              </button>
            ))}

          {!loading && !error && filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">
              暂无会话，先去
              <button onClick={() => navigate("/friends")} className="text-primary font-semibold mx-1">
                添加好友
              </button>
              吧。
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

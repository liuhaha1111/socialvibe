import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, UserCheck, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  acceptFriendRequest,
  discoverProfiles,
  listFriendRequests,
  listFriends,
  rejectFriendRequest,
  sendFriendRequest,
  type FriendProfile,
  type FriendRequest
} from "../lib/friendsApi";
import { getOrCreateDirectConversation } from "../lib/chatApi";

export const Friends: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [query, setQuery] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [profiles, setProfiles] = useState<FriendProfile[]>([]);

  const refresh = useCallback(async (search?: string) => {
    const [requestData, friendData, profileData] = await Promise.all([
      listFriendRequests(),
      listFriends(),
      discoverProfiles(search)
    ]);
    setRequests(requestData);
    setFriends(friendData);
    setProfiles(profileData);
  }, []);

  useEffect(() => {
    setDiscovering(true);
    refresh()
      .then(() => setError(null))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "加载好友数据失败");
      })
      .finally(() => setDiscovering(false));
  }, [refresh]);

  const incomingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending" && request.to_profile_id === user.id),
    [requests, user.id]
  );

  const friendIdSet = useMemo(() => new Set(friends.map((friend) => friend.id)), [friends]);

  const handleSearch = async () => {
    try {
      setDiscovering(true);
      const data = await discoverProfiles(query.trim());
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败");
    } finally {
      setDiscovering(false);
    }
  };

  const handleSendRequest = async (profileId: string) => {
    try {
      await sendFriendRequest(profileId);
      await refresh(query.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送好友请求失败");
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await refresh(query.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "同意好友请求失败");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await refresh(query.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "拒绝好友请求失败");
    }
  };

  const handleOpenChat = async (profileId: string) => {
    try {
      const conversation = await getOrCreateDirectConversation(profileId);
      navigate("/chat", { state: { conversation } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "打开聊天失败");
    }
  };

  return (
    <div className="bg-background-light min-h-screen text-slate-900 pb-20 font-sans flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-5 pt-12 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/chat-list")}
              className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-900"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight">好友管理</h1>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input
              className="w-full bg-white border-0 rounded-xl py-2.5 pl-10 pr-24 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              placeholder="搜索用户"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch().catch(() => undefined);
                }
              }}
            />
            <button
              onClick={() => handleSearch().catch(() => undefined)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 h-8 rounded-full text-xs font-semibold bg-primary text-white"
            >
              搜索
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-6">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {discovering && <p className="text-sm text-slate-500">加载中...</p>}

          <section>
            <h2 className="text-sm font-bold text-slate-500 mb-3">待处理请求</h2>
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-slate-400">暂无待处理请求</p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((request) => (
                  <div key={request.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <p className="font-semibold text-slate-900">{request.from_profile?.name ?? "未知用户"}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(request.id).catch(() => undefined)}
                        className="flex-1 h-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <UserCheck size={14} />
                        同意
                      </button>
                      <button
                        onClick={() => handleReject(request.id).catch(() => undefined)}
                        className="flex-1 h-9 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-semibold flex items-center justify-center gap-1"
                      >
                        <X size={14} />
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 mb-3">我的好友</h2>
            {friends.length === 0 ? (
              <p className="text-sm text-slate-400">还没有好友，先添加一些吧。</p>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{friend.name}</p>
                      <p className="text-xs text-slate-500">{friend.location || "未填写地区"}</p>
                    </div>
                    <button
                      onClick={() => handleOpenChat(friend.id).catch(() => undefined)}
                      className="px-3 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                    >
                      聊天
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 mb-3">发现用户</h2>
            {profiles.length === 0 ? (
              <p className="text-sm text-slate-400">未找到用户</p>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => {
                  const isFriend = friendIdSet.has(profile.id);
                  const isSelf = profile.id === user.id;
                  const hasPending = requests.some(
                    (request) =>
                      request.status === "pending" &&
                      request.from_profile_id === user.id &&
                      request.to_profile_id === profile.id
                  );
                  return (
                    <div key={profile.id} className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{profile.name}</p>
                        <p className="text-xs text-slate-500">{profile.location || "未填写地区"}</p>
                      </div>
                      {isSelf ? (
                        <span className="text-xs text-slate-400">自己</span>
                      ) : isFriend ? (
                        <span className="text-xs text-green-600 font-semibold">已是好友</span>
                      ) : hasPending ? (
                        <span className="text-xs text-amber-600 font-semibold">待处理</span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(profile.id).catch(() => undefined)}
                          className="px-3 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <UserPlus size={14} />
                          添加
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

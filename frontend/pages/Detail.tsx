import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, MapPin, MessageSquare, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useActivity } from "../context/ActivityContext";
import { apiGet, apiPost } from "../lib/api";
import { getOrCreateDirectConversation } from "../lib/chatApi";

interface ActivityDetailResponse {
  id: string;
  title: string;
  image_url: string | null;
  location: string;
  start_time: string;
  category: string;
  description: string | null;
  participant_count: number;
  max_participants: number;
  host: {
    id: string;
    name: string;
    avatar_url: string;
    bio: string | null;
    email: string | null;
    location: string | null;
  } | null;
}

export const Detail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleFavorite, isFavorite, refreshActivities } = useActivity();

  const activity = location.state?.activity;
  const activityId = activity?.id as string | undefined;

  const [detail, setDetail] = useState<ActivityDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!activityId) {
      return;
    }
    let active = true;
    apiGet<ActivityDetailResponse>(`/api/v1/activities/${activityId}`)
      .then((data) => {
        if (active) {
          setDetail(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "加载活动详情失败");
        }
      });
    return () => {
      active = false;
    };
  }, [activityId]);

  const view = useMemo(() => {
    if (detail) {
      const date = new Date(detail.start_time);
      const dateText = Number.isNaN(date.getTime())
        ? detail.start_time
        : date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      return {
        id: detail.id,
        title: detail.title,
        image: detail.image_url || activity?.image || "",
        location: detail.location,
        date: dateText,
        tag: detail.category,
        description: detail.description || "",
        participant_count: detail.participant_count,
        max_participants: detail.max_participants
      };
    }
    if (!activityId || !activity) {
      return null;
    }
    return {
      id: activity.id,
      title: activity.title,
      image: activity.image,
      location: activity.location,
      date: activity.date,
      tag: activity.tag,
      description: activity.description || "",
      participant_count: activity.participants,
      max_participants: activity.participants + activity.needed
    };
  }, [activity, activityId, detail]);

  if (!activityId || !view) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center max-w-sm w-full">
          <h1 className="text-xl font-bold text-slate-900">活动不存在</h1>
          <p className="text-slate-500 text-sm mt-2">该活动可能已下线，或入口数据无效。</p>
          <button onClick={() => navigate("/", { replace: true })} className="mt-5 w-full h-11 rounded-full bg-primary text-white font-semibold">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(activityId);
  const remaining = Math.max(view.max_participants - view.participant_count, 0);

  const handleJoin = async () => {
    try {
      setJoining(true);
      await apiPost(`/api/v1/activities/${activityId}/join`);
      await refreshActivities();
      const refreshed = await apiGet<ActivityDetailResponse>(`/api/v1/activities/${activityId}`);
      setDetail(refreshed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入活动失败");
    } finally {
      setJoining(false);
    }
  };

  const handleDirectChat = async () => {
    if (!detail?.host?.id) {
      return;
    }
    try {
      const conversation = await getOrCreateDirectConversation(detail.host.id);
      navigate("/chat", { state: { conversation } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法发起私聊");
    }
  };

  return (
    <div className="bg-background-light min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-900">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-bold text-slate-900">活动详情</h2>
        <button
          onClick={() => toggleFavorite(activityId).catch(() => undefined)}
          className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center ${favorite ? "text-primary" : "text-slate-900"}`}
        >
          <Heart size={18} className={favorite ? "fill-current" : ""} />
        </button>
      </header>

      <main className="px-4 py-4 space-y-5">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
          {view.image && <img src={view.image} alt={view.title} className="w-full h-52 object-cover" />}
          <div className="p-4">
            <p className="text-xs font-bold text-primary">{view.tag}</p>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{view.title}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-2">
              <MapPin size={14} />
              {view.location}
            </p>
            <p className="text-sm text-slate-500 mt-1">{view.date}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              <Users size={14} />
              已报名 {view.participant_count}/{view.max_participants}
            </p>
            <span className="text-xs text-slate-500">{remaining > 0 ? `还差 ${remaining} 人` : "名额已满"}</span>
          </div>
          <p className="text-sm text-slate-600 mt-3">{view.description || "主办方暂未填写活动描述。"}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">主办方</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{detail?.host?.name || "未知主办方"}</p>
              <p className="text-xs text-slate-500">{detail?.host?.location || "未填写地区"}</p>
            </div>
            <button onClick={() => handleDirectChat().catch(() => undefined)} className="h-9 px-3 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
              <MessageSquare size={14} />
              私聊主办方
            </button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-background-light via-background-light to-transparent">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          <button onClick={() => navigate("/chat-list")} className="h-12 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">
            查看群聊
          </button>
          <button
            onClick={() => handleJoin().catch(() => undefined)}
            disabled={joining || remaining <= 0}
            className="h-12 rounded-full bg-primary text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {remaining <= 0 ? "名额已满" : joining ? "加入中..." : "加入活动"}
          </button>
        </div>
      </div>
    </div>
  );
};

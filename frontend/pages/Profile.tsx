import React from "react";
import { Calendar, ChevronRight, Settings, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivity } from "../context/ActivityContext";
import { useUser } from "../context/UserContext";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop";

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { activities } = useActivity();

  const createdActivities = activities.filter((item) => item.isUserCreated);

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex justify-center">
      <div className="w-full max-w-md bg-background-light min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        <header className="pt-12 pb-4 px-5 flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">个人主页</h1>
          <button onClick={() => navigate("/settings")} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-slate-600" aria-label="设置">
            <Settings size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 py-5 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar || DEFAULT_AVATAR} alt={user.name} className="w-14 h-14 rounded-full object-cover border border-slate-100" />
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">{user.name}</h2>
                <p className="text-sm text-slate-500 truncate">{user.location || "未设置地区"}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3">{user.bio || "这个人很神秘，暂时没有留下简介。"}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => navigate("/friends")} className="h-10 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1">
                <UserPlus size={14} />
                好友管理
              </button>
              <button onClick={() => navigate("/chat-list")} className="h-10 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                我的消息
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold text-slate-900 mb-3">我发起的活动</h3>
            {createdActivities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-sm text-slate-500">
                还没有发起活动，去创建一个吧。
                <button onClick={() => navigate("/create")} className="ml-1 text-primary font-semibold">
                  立即发布
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {createdActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => navigate("/detail", { state: { activity } })}
                    className="w-full text-left bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-3 items-center"
                  >
                    <img src={activity.image} alt={activity.title} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-primary">{activity.tag}</p>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{activity.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {activity.date}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

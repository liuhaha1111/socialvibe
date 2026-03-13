import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Activity } from "../context/ActivityContext";

interface CheckInLocationState {
  activity?: Activity;
}

export const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckInLocationState | null;
  const activity = state?.activity;

  const [checkedIn, setCheckedIn] = useState(false);

  if (!activity) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center max-w-sm w-full">
          <h1 className="text-xl font-bold text-slate-900">没有可签到的活动</h1>
          <p className="text-slate-500 text-sm mt-2">请先从活动详情进入签到页面。</p>
          <button onClick={() => navigate("/", { replace: true })} className="mt-5 w-full h-11 rounded-full bg-primary text-white font-semibold">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light min-h-screen text-slate-900 pb-24">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur px-4 py-3 border-b border-slate-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center" aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">活动签到</h1>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs font-bold text-primary">{activity.tag}</p>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">{activity.title}</h2>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
            <MapPin size={14} />
            {activity.location}
          </p>
          <p className="text-sm text-slate-500 mt-1">{activity.date}</p>
        </div>

        {checkedIn ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-700">
            <p className="font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} />
              签到成功
            </p>
            <p className="text-sm mt-2">你已完成本次活动签到，可以进入群聊继续互动。</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-sm text-slate-600">点击按钮完成签到。后续可接入地理位置或二维码校验。</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-background-light via-background-light to-transparent">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          <button onClick={() => navigate("/chat-list")} className="h-12 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">
            去群聊
          </button>
          <button
            onClick={() => setCheckedIn(true)}
            disabled={checkedIn}
            className="h-12 rounded-full bg-primary text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {checkedIn ? "已签到" : "立即签到"}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Activity } from "../context/ActivityContext";

interface ReviewLocationState {
  activity?: Activity;
}

export const Review: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ReviewLocationState | null;
  const activity = state?.activity;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => rating > 0 && !submitting, [rating, submitting]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Review API not in current backend scope; keep UI flow real-data ready.
      await Promise.resolve();
      navigate("/profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (!activity) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center max-w-sm w-full">
          <h1 className="text-xl font-bold text-slate-900">没有可评价的活动</h1>
          <p className="text-slate-500 text-sm mt-2">请先从活动详情进入评价页面。</p>
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
        <h1 className="text-lg font-bold">活动评价</h1>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs font-bold text-primary">{activity.tag}</p>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">{activity.title}</h2>
          <p className="text-sm text-slate-500 mt-2">{activity.date}</p>
          <p className="text-sm text-slate-500 mt-1">{activity.location}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">综合评分</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} onClick={() => setRating(value)} className="p-1" aria-label={`评分 ${value} 星`}>
                <Star size={28} className={value <= rating ? "text-primary fill-current" : "text-slate-200"} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <label className="text-sm font-semibold text-slate-700" htmlFor="review-comment">
            评价内容（可选）
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full mt-2 min-h-28 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="写下你对本次活动的体验..."
            maxLength={250}
          />
          <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/250</p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-background-light via-background-light to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => handleSubmit().catch(() => undefined)}
            disabled={!canSubmit}
            className="w-full h-12 rounded-full bg-primary text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "提交中..." : "提交评价"}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivity } from "../context/ActivityContext";

const categories = ["城市漫步", "手作体验", "咖啡聚会", "运动", "音乐", "桌游"];

export const Create: React.FC = () => {
  const navigate = useNavigate();
  const { createActivity } = useActivity();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState("2026-03-08");
  const [time, setTime] = useState("18:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapGeolocationError = (geoError: GeolocationPositionError): string => {
    const raw = geoError.message.toLowerCase();
    if (raw.includes("err_blocked_by_client") || raw.includes("network error. check devtools")) {
      return "定位服务被浏览器插件拦截，请关闭拦截插件后重试";
    }
    if (geoError.code === geoError.PERMISSION_DENIED) {
      return "你拒绝了定位权限，请在浏览器设置中允许定位";
    }
    if (geoError.code === geoError.POSITION_UNAVAILABLE) {
      return "定位不可用，请检查网络后重试";
    }
    if (geoError.code === geoError.TIMEOUT) {
      return "定位超时，请重试";
    }
    return geoError.message || "定位失败";
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("当前浏览器不支持定位");
      return;
    }

    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        if (!location.trim()) {
          setLocation("当前位置");
        }
        setLocating(false);
      },
      (geoError) => {
        setError(mapGeolocationError(geoError));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError("请填写活动标题");
      return;
    }
    if (!location.trim()) {
      setError("请填写活动地点");
      return;
    }
    if (latitude == null || longitude == null) {
      setError("请先使用当前位置获取定位");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      await createActivity({
        title: title.trim(),
        location: location.trim(),
        start_time: startTime,
        category,
        description: description.trim(),
        max_participants: maxParticipants,
        image_url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop",
        latitude,
        longitude
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen text-slate-900 pb-24">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">发布新活动</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-5">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">活动标题</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full h-12 rounded-xl border border-slate-200 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="例如：周末城市漫步"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">活动分类</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`h-10 rounded-xl text-sm font-semibold border ${
                  item === category ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 px-3 py-2">
            <label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
              <Calendar size={14} />
              日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0"
            />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-3 py-2">
            <label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
              <Clock size={14} />
              时间
            </label>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0"
            />
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">活动地点</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 pl-9 pr-4 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="例如：静安公园"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="text-xs font-semibold text-primary"
            >
              {locating ? "定位中..." : "使用当前位置"}
            </button>
            {latitude != null && longitude != null ? (
              <span className="text-[11px] text-slate-500">
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </span>
            ) : null}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">人数上限</label>
            <span className="text-primary font-bold text-lg flex items-center gap-1">
              <Users size={16} />
              {maxParticipants}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={50}
            value={maxParticipants}
            onChange={(event) => setMaxParticipants(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">活动描述（可选）</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full min-h-28 rounded-xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="介绍活动流程、注意事项等"
          />
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-background-light via-background-light to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => handlePublish().catch(() => undefined)}
            disabled={submitting}
            className="w-full h-12 rounded-full bg-primary text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "发布中..." : "发布活动"}
          </button>
        </div>
      </div>
    </div>
  );
};

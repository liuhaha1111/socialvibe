import React, { useMemo, useState } from "react";
import { Heart, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivity } from "../context/ActivityContext";
import { useUser } from "../context/UserContext";

function mapNearbyRequestError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (normalized.includes("missing bearer token") || normalized.includes("invalid or expired token")) {
    return "登录状态已失效，请重新登录后重试。";
  }

  if (normalized.includes("network error. check devtools") || normalized.includes("err_blocked_by_client")) {
    return "定位服务被浏览器插件拦截，请关闭拦截插件后重试。";
  }

  return message || "附近活动加载失败，请稍后重试。";
}

function mapGeolocationError(error: GeolocationPositionError): string {
  const message = (error.message || "").toLowerCase();
  if (message.includes("network error. check devtools") || message.includes("err_blocked_by_client")) {
    return "定位服务被浏览器插件拦截，请关闭拦截插件后重试，或手动输入位置。";
  }

  if (error.code === error.PERMISSION_DENIED) {
    return "你拒绝了定位权限，请在浏览器设置中允许定位。";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "定位不可用，请检查网络后重试。";
  }

  if (error.code === error.TIMEOUT) {
    return "定位超时，请重试。";
  }

  return "定位失败，请稍后重试。";
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { activities, isFavorite, toggleFavorite, refreshActivities } = useActivity();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [locating, setLocating] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const tags = Array.from(new Set(activities.map((item) => item.tag)));
    return ["全部", ...tags];
  }, [activities]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return activities.filter((item) => {
      const matchesKeyword =
        keyword.length === 0 ||
        item.title.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        item.tag.toLowerCase().includes(keyword);
      const matchesCategory = category === "全部" || item.tag === category;
      return matchesKeyword && matchesCategory;
    });
  }, [activities, category, search]);

  const featured = filtered[0];

  const handleToggleNearby = async () => {
    if (nearbyEnabled) {
      setNearbyEnabled(false);
      setNearbyError(null);
      await refreshActivities();
      return;
    }

    if (!navigator.geolocation) {
      setNearbyError("当前浏览器不支持定位");
      return;
    }

    setLocating(true);
    setNearbyError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await refreshActivities({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius_km: 20
          });
          setNearbyEnabled(true);
        } catch (error) {
          setNearbyEnabled(false);
          setNearbyError(mapNearbyRequestError(error));
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        setNearbyEnabled(false);
        setNearbyError(mapGeolocationError(error));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
      <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md pt-12 pb-3 px-6 border-b border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight">你好，{user.name}</h2>
            <p className="text-sm text-slate-500 mt-1">发现你感兴趣的新活动</p>
          </div>
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-primary/10">
            <MapPin size={16} className="text-primary" />
            <p className="text-sm font-bold text-slate-700">{user.location || "未设置位置"}</p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            onClick={() => handleToggleNearby().catch(() => undefined)}
            disabled={locating}
            className={`rounded-full px-4 py-2 text-xs font-bold border transition-colors ${
              nearbyEnabled ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            {locating ? "定位中..." : nearbyEnabled ? "已开启附近 20km" : "开启附近活动"}
          </button>
          {nearbyError ? <p className="text-xs text-red-500 truncate">{nearbyError}</p> : null}
        </div>

        <div className="flex w-full items-center rounded-full bg-white shadow-sm border border-primary/10">
          <div className="pl-4 pr-2 text-primary">
            <Search size={20} />
          </div>
          <input
            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 text-base font-medium h-12 py-2"
            placeholder="搜索活动标题、地点或分类"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </header>

      <div className="py-4">
        <div className="flex gap-3 px-6 overflow-x-auto custom-scrollbar pb-3 snap-x w-full">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`snap-start shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-transform active:scale-95 ${
                category === item ? "bg-primary text-white shadow-primary/30 shadow-sm" : "bg-white border border-slate-100 text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {featured && (
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">热门推荐</h3>
            <button onClick={() => setCategory("全部")} className="text-sm font-semibold text-primary hover:text-primary/80">
              查看全部
            </button>
          </div>

          <div
            onClick={() => navigate("/detail", { state: { activity: featured } })}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden group shadow-xl shadow-primary/10 cursor-pointer"
          >
            <img alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={featured.image} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-5">
              <h4 className="text-white text-2xl font-bold mb-2 leading-tight">{featured.title}</h4>
              <div className="flex items-center gap-3 text-white/90 text-sm font-medium">
                <span>{featured.date}</span>
                {featured.distanceKm !== undefined ? <span>{featured.distanceKm.toFixed(1)}km</span> : null}
                <span>还差 {featured.needed} 人</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 space-y-6">
        <h3 className="text-xl font-bold text-slate-900">{search ? "搜索结果" : "附近活动"}</h3>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p>没有找到匹配活动</p>
          </div>
        )}

        {filtered.map((activity) => (
          <div
            key={activity.id}
            onClick={() => navigate("/detail", { state: { activity } })}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-4 cursor-pointer"
          >
            <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
              <img alt={activity.title} className="w-full h-full object-cover" src={activity.image} />
              <div className="absolute top-1 left-1 bg-white/90 text-[10px] font-bold px-1.5 py-0.5 rounded text-primary">{activity.tag}</div>
            </div>
            <div className="flex flex-col flex-1 justify-between py-1">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{activity.title}</h4>
                  <button
                    className={`text-slate-400 hover:text-primary transition-colors ${isFavorite(activity.id) ? "text-primary" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(activity.id).catch(() => undefined);
                    }}
                  >
                    <Heart size={20} className={isFavorite(activity.id) ? "fill-current" : ""} />
                  </button>
                </div>
                <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                  <MapPin size={14} /> {activity.location}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-primary">{activity.date}</span>
                <div className="flex items-center gap-2">
                  {activity.distanceKm !== undefined ? (
                    <span className="text-[10px] font-medium text-slate-500">{activity.distanceKm.toFixed(1)}km</span>
                  ) : null}
                  <span className="text-[10px] font-medium text-slate-400">还差 {activity.needed} 人</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
      <div className="h-8" />
    </div>
  );
};

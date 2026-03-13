import React, { useMemo } from "react";
import { Calendar, ChevronRight, MapPin, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivity } from "../context/ActivityContext";
import { useUser } from "../context/UserContext";

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { activities } = useActivity();

  const myCreatedActivities = useMemo(
    () => activities.filter((activity) => activity.isUserCreated).slice(0, 8),
    [activities]
  );

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex justify-center">
      <div className="w-full max-w-md bg-background-light min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        <header className="pt-12 pb-4 px-5 flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center border-2 border-primary"
              style={{ backgroundImage: `url('${user.avatar}')` }}
            />
            <h1 className="text-xl font-bold tracking-tight truncate">My Profile</h1>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-slate-600"
            aria-label="Settings"
          >
            <Settings size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 py-5 space-y-5">
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.bio || "No bio yet"}</p>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>{user.email || "No email"}</p>
              <p className="flex items-center gap-1">
                <MapPin size={14} className="text-primary" />
                <span>{user.location || "No location"}</span>
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Created Activities</h3>
              <button onClick={() => navigate("/create")} className="text-sm font-semibold text-primary">
                Create New
              </button>
            </div>

            {myCreatedActivities.length === 0 ? (
              <div className="text-sm text-slate-500 py-3">You have not created any activities yet.</div>
            ) : (
              <div className="space-y-3">
                {myCreatedActivities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => navigate("/detail", { state: { activity } })}
                    className="w-full text-left flex gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <img src={activity.image} alt={activity.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">{activity.tag}</p>
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{activity.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={12} /> {activity.date}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 shrink-0 mt-1" />
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivity } from '../context/ActivityContext';
import { ArrowLeft, Search, Heart, MapPin, Trash2 } from 'lucide-react';

export const Saved: React.FC = () => {
  const navigate = useNavigate();
  const { activities, favorites, toggleFavorite, isFavorite } = useActivity();

  // Filter activities that are in the favorites list
  const savedActivities = activities.filter(activity => favorites.includes(activity.id));

  return (
    <div className="bg-background-light min-h-screen text-slate-900 font-sans pb-24">
      <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-6 py-4 border-b border-primary/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">我的收藏</h1>
        </div>
      </header>

      <main className="px-6 py-4 space-y-4">
        {savedActivities.length > 0 ? (
          savedActivities.map((activity) => (
            <div key={activity.id} onClick={() => navigate('/detail', { state: { activity } })} className={`bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-4 cursor-pointer`}>
              <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden">
                <img alt={activity.title} className="w-full h-full object-cover" src={activity.image} />
                <div className="absolute top-1 left-1 bg-white/90 backdrop-blur text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide text-primary">
                  {activity.tag}
                </div>
              </div>
              <div className="flex flex-col flex-1 justify-between py-0.5">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-base leading-tight mb-1 line-clamp-2">{activity.title}</h4>
                    <button 
                      className="text-primary p-1 -mr-1 hover:bg-red-50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(activity.id);
                      }}
                    >
                      <Heart size={18} className="fill-current" />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {activity.location}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-primary">{activity.date}</span>
                    <span className="text-[10px] font-medium text-slate-400">
                      还差 {activity.needed} 人
                    </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Heart size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-1">暂无收藏</h3>
            <p className="text-sm">你喜欢的活动会出现在这里</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20"
            >
              去逛逛
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
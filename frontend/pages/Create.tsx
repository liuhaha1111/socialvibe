import React, { useState } from 'react';
import { X, Edit2, Calendar, Clock, Plus, Info, Users, ArrowRight, Footprints, Palette, Coffee, Trophy, Music, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActivity } from '../context/ActivityContext';

const defaultCategories = [
  { name: '鍩庡競婕', icon: <Footprints size={20} /> },
  { name: '鎵嬩綔浣撻獙', icon: <Palette size={20} /> },
  { name: '鍜栧暋鑱氫細', icon: <Coffee size={20} /> },
  { name: '杩愬姩', icon: <Trophy size={20} /> },
  { name: '闊充箰', icon: <Music size={20} /> },
];

export const Create: React.FC = () => {
  const navigate = useNavigate();
  const { createActivity } = useActivity();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0].name);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [date, setDate] = useState('2023-10-24');
  const [time, setTime] = useState('17:00');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [limit, setLimit] = useState(8);

  const handlePublish = async () => {
    if (!title) {
      alert("Please enter activity title");
      return;
    }

    const finalCategory = isCustomCategory ? customCategory : selectedCategory;
    if (isCustomCategory && !customCategory) {
      alert("Please enter custom category");
      return;
    }

    if (!locationName) {
      alert("Please enter location");
      return;
    }

    const startTime = new Date(`${date}T${time}:00`).toISOString();
    await createActivity({
      title,
      location: locationName,
      start_time: startTime,
      category: finalCategory,
      description,
      max_participants: limit,
      image_url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop"
    });
    navigate("/");
  };

  return (
    <div className="font-sans bg-background-light text-slate-900 min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors">
            <X size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-center flex-1">鍙戝竷鏂版椿鍔?</h1>
          <div className="w-10"></div> 
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-2 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold mb-3 px-1 text-slate-900">娲诲姩鍚嶇О</h2>
            <div className="group relative">
              <input 
                className="w-full bg-white border-0 rounded-2xl py-6 px-5 text-xl font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 transition-all shadow-sm shadow-primary/5" 
                placeholder="缁欎綘鐨勬椿鍔ㄨ捣涓悕瀛?.." 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                <Edit2 size={20} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">閫夋嫨鍒嗙被</label>
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-3 -mx-5 px-5 snap-x">
              {defaultCategories.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                      setSelectedCategory(cat.name);
                      setIsCustomCategory(false);
                  }}
                  className={`snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full transition-transform active:scale-95 ${!isCustomCategory && selectedCategory === cat.name ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-600'}`}
                >
                  {cat.icon}
                  <span className="font-semibold text-sm">{cat.name}</span>
                </button>
              ))}
              <button 
                  onClick={() => setIsCustomCategory(true)}
                  className={`snap-start shrink-0 flex items-center justify-center w-12 h-10 rounded-full transition-transform active:scale-95 ${isCustomCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-600'}`}
                >
                  <Plus size={24} />
              </button>
            </div>
            {isCustomCategory && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                    <input 
                        className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                        placeholder="杈撳叆鑷畾涔夋爣绛惧悕绉?(渚嬪: 璇讳功浼?"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        autoFocus
                    />
                </div>
            )}
          </div>
        </section>

        <hr className="border-dashed border-slate-200" />

        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold px-1 text-slate-900">鏃堕棿鍦扮偣</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative flex flex-col gap-1.5 p-4 bg-white rounded-2xl border-2 border-transparent hover:border-primary/20 transition-colors cursor-pointer shadow-sm group">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Calendar size={18} />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">鏃ユ湡</span>
              </div>
              <input 
                type="date" 
                className="font-bold text-lg leading-tight bg-transparent border-none p-0 focus:ring-0 text-slate-900 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="relative flex flex-col gap-1.5 p-4 bg-white rounded-2xl border-2 border-transparent hover:border-primary/20 transition-colors cursor-pointer shadow-sm group">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Clock size={18} />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">鏃堕棿</span>
              </div>
              <input 
                type="time" 
                className="font-bold text-lg leading-tight bg-transparent border-none p-0 focus:ring-0 text-slate-900 w-full"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                <MapPin size={20} />
             </div>
             <input 
                className="w-full bg-white border-0 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                placeholder="杈撳叆娲诲姩鍦扮偣 (渚嬪: 闈欏畨鍏洯)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
             />
          </div>

          <div className="relative w-full h-32 rounded-3xl overflow-hidden group shadow-sm opacity-80 hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-slate-200">
              <img 
                alt="Map" 
                className="w-full h-full object-cover mix-blend-multiply" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCodDhtLlCOzZ5LneMiwgjCvfbSpLGA7bsrsPlqlDO6wSh_IinBwwHp4d9t4AbdSu2JvbzICtw9iJczMpAYNxzSQw1hmUGLoZEpXxZfNyRMm2zvnq5hRYKbLcBXEtZgVJ_1OAZWTqr8PPESvIVc1xZJyNcrTE3UL7deMvRsXcLGvUZEaBLs10IrMdREU8puNRvD82kJi0_opEjHbwUvyl8TIJiIomm5LzwLBc3_q23J1c4kT5kOCfF3NTRqvcUE05-UL854gC1Qcr8"
              />
            </div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm text-slate-600">鍦板浘棰勮</span>
            </div>
          </div>
        </section>

        <hr className="border-dashed border-slate-200" />

        <section className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-baseline mb-3 px-1">
              <h2 className="text-xl font-bold text-slate-900">娲诲姩鎻忚堪</h2>
              <span className="text-xs font-medium text-slate-400">閫夊～</span>
            </div>
            <textarea 
              className="w-full bg-white border-0 rounded-2xl p-5 min-h-[140px] text-base leading-relaxed placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 resize-none shadow-sm" 
              placeholder="鎻忚堪涓€涓嬪叿浣撶殑娲诲姩鍐呭銆傝鎻愬強闇€瑕佺殑瑁呭鎴栭泦鍚堢偣鐨勮缁嗕俊鎭?.."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-2 px-1">
              <span className="text-xs text-slate-400 font-medium">{description.length}/500</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users size={20} />
                </div>
                <span className="font-bold text-slate-900">浜烘暟闄愬埗</span>
              </div>
              <span className="font-bold text-2xl text-primary font-display">{limit}</span>
            </div>
            <div className="px-2">
              <input 
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                type="range" 
                min="2" 
                max="20" 
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
              />
              <div className="flex justify-between mt-3 text-xs font-semibold text-slate-400">
                <span>浠呮垜鍜屽ソ鍙?</span>
                <span>澶у瀷鑱氫細</span>
              </div>
            </div>
          </div>
        </section>
        <div className="h-10"></div>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 pb-6 bg-gradient-to-t from-background-light via-background-light to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handlePublish}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <span>鍙戝竷娲诲姩</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};





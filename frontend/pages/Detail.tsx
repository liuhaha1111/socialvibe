import React from 'react';
import { ArrowLeft, Heart, Share, Calendar, Clock, MapPin, Star, ArrowRight, Mountain, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useActivity } from '../context/ActivityContext';

export const Detail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleFavorite, isFavorite } = useActivity();
  
  // Use passed activity or default for the mock detail page
  // We use a specific ID 'mock-trending-1' for the default detailed activity
  // so favorites work even if navigated from the trending card that doesn't have a real DB entry yet
  const activity = location.state?.activity;
  const activityId = activity?.id || 'mock-trending-1';
  
  const isFav = isFavorite(activityId);

  const handleBack = () => {
    // Check if there is a history stack to go back to, otherwise fallback to home.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="bg-background-light min-h-screen pb-24 relative">
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background-light/80 backdrop-blur-md">
        <button 
          onClick={handleBack} 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-slate-900 transition-transform active:scale-95 hover:bg-slate-50"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-bold opacity-0 transition-opacity duration-300">活动详情</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleFavorite(activityId)}
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm transition-transform active:scale-95 hover:bg-slate-50 ${isFav ? 'text-primary' : 'text-slate-900'}`}
          >
            <Heart size={20} className={isFav ? 'fill-current' : ''} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-slate-900 transition-transform active:scale-95 hover:bg-slate-50">
            <Share size={20} />
          </button>
        </div>
      </div>

      <main className="flex flex-col gap-6 px-4">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-soft group">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: `url('${activity?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuD3_TuoV-28pzAJFlSvukNAqz4I_9FsBiH8evKzTEPCAKyD0pRE6cNVkzAAAo0t0mjC6b_vZqaiKx372ZFD94QWE9iPhA4WMelyi-R8zXmTP9vOzQIDIyvzNBAk1Ftd7aReKF5hD04OnIr8Gi-rM6gEwm9Q-o0V_tgeW5kPiDm_jm48BS7Fk4E1Cb5Id509sRoz-f4jqLx-HT8xkww2YCm4XkNvQeNmBzwpJa3gGWX-eiwck4fM4Sl5f7hZr1bJ5UuYT0kkHmOphW4"}')`}}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
            <Mountain className="text-primary" size={18} />
            <span className="text-xs font-bold text-primary/80 tracking-wide uppercase">{activity?.tag || '户外探索'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900">{activity?.title || '日落建筑漫步 City Walk'}</h1>
          <div className="flex items-center gap-2 text-primary">
            <MapPin size={20} />
            <span className="text-sm font-medium">{activity?.location || '市中心广场喷泉 (Central Plaza)'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">日期</span>
              <span className="text-sm font-bold text-slate-900">{activity?.date?.split(' ')[0] || '10月14日 周六'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">时间</span>
              <span className="text-sm font-bold text-slate-900">{activity?.time || activity?.date?.split(' ')[1] || '17:00 - 19:00'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCYSCh2IRLw2C7lMBTmXTGfZ59u9bcoN9Jm9yo0IvZj7iYJZUEq7Jk1VVfLV9qnY5jUY6uecU_TGGiNPY2lUdAQDs_M0BisDCzTqLT0U_Iy3B1dSF9S8zMNrc7gSfIgWB_9L_M3FA7dvGuo2Le9untrG3fxO5ptjAaphjkK_ZBh8_SPVcOCqRU6ObgYjJF6NCetlroBlPsYrzYBv-pxf4GdunwSn-ZR4RHu0KLfdo7A2IbszARgyvzNl1-6avgdj5-H-4vW3qWVB2E')"}}></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                <Check size={12} className="text-white" strokeWidth={4} />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-slate-400 font-medium">发起人</p>
              <div className="flex items-center gap-1">
                <p className="text-base font-bold text-slate-900">Sarah J.</p>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-yellow-100 text-yellow-700 flex items-center gap-0.5">
                    4.9 <Star size={10} className="fill-current" />
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/chat')}
            className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            私信
          </button>
        </div>

        <div className="flex flex-col gap-3 py-2 border-t border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">已加入成员</h3>
            <span className="text-sm text-primary font-bold cursor-pointer">查看全部</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <img alt="User 1" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRLQjIGOQAkXcBc9kzXK4AUu0mcxQwycaSVSMdnQqs_HW_XaGm-SvUTWBaMXnUxkd9qf9gAZKvRYHgxWLPPV6ielq4BRmmni9eTpHkkgXPiXQSHRmfkfFbshKU5XgHd2VjMSFg278SwenOtz-YrpF757gRMyJRJBFRipYwvs855p0M6mRITIP--dfVkUt3u67QAQynyaqeIVdOWSSGh57hUl5Y1SMBgJaNGzmMWQ-MohSneg5Aivoow5SVGpABuqtN7JrYGszIC2M" />
              <img alt="User 2" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx7OF6dxiG24Dz231tjU-OjsW8h0yBNOclbXYP88KHtQHHzS_UeX-V3-9sWAVHmJK10K4Dr_ZRVUqNXuv8YPIFnPvF6YYaL_mmM665wqRUDOT_b9foIN1iGMnlFHO9tOunAR5r5Fgjp3MEShZvspS78kBTLaCbruMcw940-SuaH4Yh_b756mt3wuFcmoPss_eSvVXVE_MNSQ1x-Ey7JIAbkj-LriTr6mzNA6kLsDSf-uv8xYdLIEN5tSk8GEOW7rlq3CVssfJjZ6E" />
              <img alt="User 3" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyKVa8oSi2M-qPZxKKSIlGvc2qTAi3G7RRGcsrn1zZ2KteEav2tlrlteZ8J5etPdsfw-MCvuMdGwF4idrrYpxNziCoSelwq9AyicPYQfZZFCFLAcNlugmF6cdXLNbH1MuyeIvewqfv9Aj1_WhfyD_Qm4Ae6TuI5v2SvMQ1g7Q-pR7c--1234xjqEmXYA4MTcdTH9k-wOXxDNAb6Qg9Wrg720IhgAggsJ5TaM5KptnWC_zuCgfE166Al3fyr_tDO0D81UkhCcoL8Hc" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-slate-400">
                  +9
              </div>
            </div>
            <p className="text-sm text-slate-400">
                <strong className="text-slate-900">12 人</strong> 确认参加
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-slate-900">活动描述</h3>
          <p className="text-slate-500 text-base leading-relaxed text-justify">
            {activity?.description || '加入我们在日落时分轻松漫步于历史街区。我们将探索隐秘的小巷，欣赏独特的建筑，并了解这座城市丰富的历史。非常适合摄影爱好者和喜欢探索的朋友！'}
            <span className="text-primary font-bold cursor-pointer ml-1">阅读更多</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 pb-8">
          <h3 className="text-lg font-bold text-slate-900">集合地点</h3>
          <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm group">
            <div className="absolute inset-0 bg-cover bg-center grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5auomKZhP8YF1Lefntqhp_z7FYiwFmWT0kRBsJJqFJN83juQv2UnPkjTETEFBoNrQLEqebOr0uiKF_iF0Jx2CFi5mab4IKtTRT_k4B5hq6ZNEWsFHiaTM8fnU82XbfTfflSnKcD7bkHPdRAaLSQW2f-4_qLv1imIZzZRLljLhC8yoy7l9GwQf27GRlFnhXbCDyolaD8mVg3Ux0pqJWjS2DTrsMV2748x024Qf7W7hMz-BDX9l1BperHxmJcCHcjk9ee2RnpRYNQw')"}}></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                  <MapPin className="text-primary" size={24} />
                </div>
              </div>
              <div className="mt-1 px-3 py-1 bg-white rounded-lg shadow-md">
                <p className="text-xs font-bold text-slate-900 whitespace-nowrap">{activity?.location || '市中心广场 (Central Plaza)'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-50 pb-8">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">总费用</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">¥35</span>
              <span className="text-sm text-slate-400">/人</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkin')}
            className="flex-1 h-14 bg-primary text-white font-bold text-lg rounded-full shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
              立即加入
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
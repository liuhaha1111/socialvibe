import React from 'react';
import { X, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Review: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white h-screen sm:h-auto sm:min-h-[800px] sm:rounded-lg shadow-2xl overflow-hidden flex flex-col relative">
        <div className="flex items-center justify-between p-4 pt-6 bg-white z-10">
          <button onClick={() => navigate(-1)} className="text-slate-500 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">活动评价</h1>
          <button onClick={() => navigate(-1)} className="text-slate-400 font-semibold text-sm px-2">跳过</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-400 mb-4 shadow-lg shadow-primary/20">
                <img alt="Activity" className="w-full h-full object-cover rounded-full border-4 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe1_A8od1FofIH3Td8PCs8-Bfaa89m1M6T5CrvbxKb6fh7FSQOQo_AFfkDPpKD_AnlhLqtAohjXnB8Umrh_Keok9270Fr4W2k-Up6udrpcTLh9l-PGgioAuQnerUjaTN17ZOpoQjuCRteGnm5OwXujKf712FbdE_6x2KhIVUjh1VwVfvpJicTS2ii4oiWBNqliknYvu8m5GkCfLf_P70hbiqF3PST3aWzVQ9Q0NfVTlcTZ-iqo4OcCVR5WWh0vY-GBFv7PmLtZHNM" />
              </div>
              <h2 className="text-2xl font-bold mb-1">城市漫步 · 艺术中心</h2>
              <p className="text-slate-500 text-sm font-medium">发起人: Sarah Jenkins • 昨天</p>
            </div>
          </div>

          <div className="px-6 mb-8">
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">综合评分</p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4].map((star) => (
                  <button key={star} className="group focus:outline-none transition-transform active:scale-90">
                    <Star size={36} className="text-primary fill-current" />
                  </button>
                ))}
                <button className="group focus:outline-none transition-transform active:scale-90">
                  <Star size={36} className="text-slate-200 hover:text-primary/50 fill-current" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-slate-600">您的评分将使总分达到</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold text-xs">4.9</span>
                <span className="text-slate-400 text-xs line-through">4.8</span>
              </div>
            </div>
          </div>

          <div className="px-6 mb-8">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-primary" />
                印象标签
            </h3>
            <div className="flex flex-wrap gap-3">
              {['氛围好', '体验极佳'].map(tag => (
                <button key={tag} className="px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-semibold transition-colors">
                  {tag}
                </button>
              ))}
              {['发起人Nice', '超值', '专业向导'].map(tag => (
                <button key={tag} className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-primary/50 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6">
            <label className="text-base font-bold mb-3 block" htmlFor="comment">更多建议（选填）</label>
            <div className="relative group">
              <textarea 
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 resize-none h-32 transition-all shadow-sm" 
                id="comment" 
                placeholder="写下你的感受..."
              ></textarea>
              <div className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">
                  0/250
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
          <button 
             onClick={() => navigate('/profile')}
             className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>提交评价</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
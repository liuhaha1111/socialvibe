import React from 'react';
import { Home, Heart, MessageSquare, User, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  // Hide bottom nav on detail, chat, create, review, checkin, settings pages to match typical mobile flows or keep it if desired. 
  // Based on screenshots, Create, Chat, Detail usually hide main nav.
  const hideNavPaths = ['/create', '/chat', '/detail', '/review', '/checkin', '/settings'];
  if (hideNavPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe pt-2 px-6 z-50 max-w-md mx-auto">
      <div className="flex justify-between items-end pb-4">
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 group w-1/5 ${isActive('/') ? 'text-primary' : 'text-slate-400'}`}
        >
          <div className={`rounded-2xl w-12 h-8 flex items-center justify-center transition-all ${isActive('/') ? 'bg-primary/10' : 'group-hover:bg-primary/5'}`}>
            <Home size={24} className={isActive('/') ? 'fill-current' : ''} />
          </div>
          <span className="text-[10px] font-bold">首页</span>
        </button>

        <button 
          onClick={() => navigate('/saved')}
          className={`flex flex-col items-center gap-1 group w-1/5 ${isActive('/saved') ? 'text-primary' : 'text-slate-400'}`}
        >
          <div className="rounded-2xl w-12 h-8 flex items-center justify-center transition-all group-hover:bg-primary/5">
            <Heart size={24} />
          </div>
          <span className="text-[10px] font-bold">收藏</span>
        </button>

        <div className="w-1/5 flex justify-center relative z-10">
          <button 
            onClick={() => navigate('/create')}
            className="absolute -top-10 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/40 border-4 border-background-light transform transition-transform active:scale-90 hover:scale-105"
          >
            <Plus size={32} />
          </button>
        </div>

        <button 
          onClick={() => navigate('/chat-list')}
          className={`flex flex-col items-center gap-1 group w-1/5 ${isActive('/chat-list') ? 'text-primary' : 'text-slate-400'}`}
        >
          <div className="relative rounded-2xl w-12 h-8 flex items-center justify-center transition-all group-hover:bg-primary/5">
            <MessageSquare size={24} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full border border-white"></span>
          </div>
          <span className="text-[10px] font-bold">聊天</span>
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 group w-1/5 ${isActive('/profile') ? 'text-primary' : 'text-slate-400'}`}
        >
          <div className={`rounded-2xl w-12 h-8 flex items-center justify-center transition-all ${isActive('/profile') ? 'bg-primary/10' : 'group-hover:bg-primary/5'}`}>
            <User size={24} className={isActive('/profile') ? 'fill-current' : ''} />
          </div>
          <span className="text-[10px] font-bold">我的</span>
        </button>
      </div>
    </nav>
  );
};
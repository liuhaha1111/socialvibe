import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Bell, UserPlus, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockChats = [
  {
    id: '1',
    name: '林雨薇 (Sarah)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZH9ZAEvqUmfr0JJxmIr5W_GREgOyRDSirdTZ2ZCM-GYhpyUuAd4BJPm_3pRoMyl7a6I0BA7mJZdn7YKWQpSntD1Gcd9p39UAEQWayXZWnFKqYn-gDf-gaibV0-LfskKA1vn72ipZLIuhWmgMYAw38086S09lkE_wpfv3Vha6SSN7aRlMoKwHAQzXFHT3fmhG8q4R-y7lU6DHlm6WXxWJ9yoDguFSeNc9k8-IWoo6jgOmxsAhORfVd8BPLZFPwkNPVzj158e3HinQ',
    message: '我们需要自带相机吗？还是现场会提供器材？',
    time: '10:46',
    unread: 0,
    online: true,
    tag: '胶片摄影'
  },
  {
    id: '2',
    name: '摄影俱乐部群',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARKR81gDM7pqFFGx65180tuJxaYuG3r_FtjJWpCrKNuxcKx983_QrNAJ7QLE6TkebbUW3NEfm1JI1btf1kAqJk7lFA8p5v9PTVScN-I-3Lg6S-u5I2h-wpYEmpQVKgWCcpFmsXYpQvqacmqv6UWaoKA4SIcLzDIHgz2oARH-LFfWTLcVJbIwmfrZO8-Fffm__qhBHnfoeExE4mDwh3xNndpKgJBmXMZnX3uAxEnk5AjMH24ffQuDiMOnUcphUyQxLNmyIX6JHx_Fo',
    message: 'Jason: 这周六的活动我也报名了！',
    time: '09:30',
    unread: 12,
    isGroup: true
  },
  {
    id: '3',
    name: 'Alex Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyKVa8oSi2M-qPZxKKSIlGvc2qTAi3G7RRGcsrn1zZ2KteEav2tlrlteZ8J5etPdsfw-MCvuMdGwF4idrrYpxNziCoSelwq9AyicPYQfZZFCFLAcNlugmF6cdXLNbH1MuyeIvewqfv9Aj1_WhfyD_Qm4Ae6TuI5v2SvMQ1g7Q-pR7c--1234xjqEmXYA4MTcdTH9k-wOXxDNAb6Qg9Wrg720IhgAggsJ5TaM5KptnWC_zuCgfE166Al3fyr_tDO0D81UkhCcoL8Hc',
    message: '好的，到时候见。',
    time: '昨天',
    unread: 0,
    online: false
  },
   {
    id: '4',
    name: '系统通知',
    avatar: '', 
    icon: <Bell size={24} className="text-white" />,
    bg: 'bg-primary',
    message: '您的活动“城市漫步”已通过审核。',
    time: '星期一',
    unread: 1,
    isSystem: true
  }
];

export const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chat.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background-light min-h-screen text-slate-900 pb-20 font-sans flex justify-center">
       <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
          <header className="sticky top-0 z-20 bg-background-light/95 backdrop-blur-md px-5 pt-12 pb-2 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-900">
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-extrabold tracking-tight">消息</h1>
              </div>
              <div className="flex gap-4 text-slate-600">
                 <button className="hover:text-primary transition-colors"><UserPlus size={24} /></button>
                 <button className="hover:text-primary transition-colors"><Plus size={24} /></button>
              </div>
            </div>
            <div className="relative">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={18} />
               </div>
               <input 
                 className="w-full bg-white border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all" 
                 placeholder="搜索" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar">
             {filteredChats.map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => navigate('/chat', { state: { user: chat } })}
                  className="flex items-center gap-3 px-5 py-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer"
                >
                   <div className="relative shrink-0">
                      {chat.avatar ? (
                        <img src={chat.avatar} alt={chat.name} className={`w-12 h-12 ${chat.isGroup ? 'rounded-lg' : 'rounded-full'} object-cover border border-gray-100`} />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${chat.bg} shadow-md`}>
                           {chat.icon}
                        </div>
                      )}
                      
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                           {chat.unread}
                        </div>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                         <h3 className="text-base font-bold text-slate-900 truncate">{chat.name}</h3>
                         <span className="text-[10px] font-medium text-slate-400">{chat.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate pr-4">{chat.message}</p>
                   </div>
                </div>
             ))}
          </main>
       </div>
    </div>
  );
};
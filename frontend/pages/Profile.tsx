import React, { useState } from 'react';
import { Calendar, ChevronRight, Share2, Mail, X, Settings, QrCode, Ticket, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useActivity } from '../context/ActivityContext';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { activities } = useActivity();
  
  const [activeTab, setActiveTab] = useState<'signedup' | 'created' | 'past'>('signedup');
  const [inviteVisible, setInviteVisible] = useState(true);
  const [showTicket, setShowTicket] = useState(false);

  const myCreatedActivities = activities.filter(a => a.isUserCreated);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: '市中心胡同艺术之旅',
        text: '快来看看这个有趣的活动！',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('链接已复制到剪贴板！');
    }
  };

  const handleTicketClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowTicket(true);
  };

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex justify-center">
      <div className="w-full max-w-md bg-background-light min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        <header className="pt-12 pb-4 px-5 flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div 
                className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center border-2 border-primary" 
                style={{backgroundImage: `url('${user.avatar}')`}}
              ></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight text-slate-900">我的活动</h1>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-slate-600"
          >
            <Settings size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <div className="px-5 py-6">
            <div className="flex p-1 bg-gray-100 rounded-full relative">
              {/* Animated Tab Background */}
              <div 
                className="absolute top-1 bottom-1 w-[32%] bg-white shadow-sm rounded-full transition-all duration-300 ease-in-out"
                style={{
                    left: activeTab === 'signedup' ? '4px' : activeTab === 'created' ? '34%' : '66.5%' // Approximate positioning
                }}
              ></div>
              
              <button 
                onClick={() => setActiveTab('signedup')}
                className={`flex-1 relative z-10 py-2 text-sm font-semibold text-center rounded-full transition-colors ${activeTab === 'signedup' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  已报名
              </button>
              <button 
                onClick={() => setActiveTab('created')}
                className={`flex-1 relative z-10 py-2 text-sm font-semibold text-center rounded-full transition-colors ${activeTab === 'created' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  我发起的
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`flex-1 relative z-10 py-2 text-sm font-semibold text-center rounded-full transition-colors ${activeTab === 'past' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  往期活动
              </button>
            </div>
          </div>

          <div className="px-5 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {activeTab === 'signedup' && (
                <>
                    {/* Card 1 - Active */}
                    <div onClick={() => navigate('/detail')} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative group overflow-hidden cursor-pointer active:scale-[0.99] transition-transform">
                    <div className="flex gap-4">
                        <div className="w-24 h-24 shrink-0 rounded-xl bg-gray-200 overflow-hidden relative">
                        <div className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARKR81gDM7pqFFGx65180tuJxaYuG3r_FtjJWpCrKNuxcKx983_QrNAJ7QLE6TkebbUW3NEfm1JI1btf1kAqJk7lFA8p5v9PTVScN-I-3Lg6S-u5I2h-wpYEmpQVKgWCcpFmsXYpQvqacmqv6UWaoKA4SIcLzDIHgz2oARH-LFfWTLcVJbIwmfrZO8-Fffm__qhBHnfoeExE4mDwh3xNndpKgJBmXMZnX3uAxEnk5AjMH24ffQuDiMOnUcphUyQxLNmyIX6JHx_Fo')"}}></div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                            <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1 inline-block">城市漫步</span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 leading-tight truncate">市中心胡同艺术之旅</h3>
                            <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs font-medium">
                            <Calendar size={14} />
                            <span>10月24日 (周六) • 10:00</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 bg-cover" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDAMnrtqJByj4CgXl3JWOmvLnTQsPTWVnK6lborUtt47oVVIIcOdCNP_SLlDj5y16Vb4bxT1-XoNH1TJzAfVKAM9uRXb37sYdwa4zeO94w7SL-BgkiNiPClwkpGcX0VELj1dSGUamSVdeMHmSIlpHRWxxHO2KAiADNTPmxGb-GkkTs1E_ozFwvyVarvhjxqwP2CatieUG7ynAWUWxotfIe7OA1P-fEzsmnjl6K7dF9qV36ygTHhl5AuDRRv0DolWgNGuR3tIn3n_j8')"}}></div>
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 bg-cover" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9ONgIN8hAQZjHHHd0QD26mYHPU3Pe7-dborRHOZITYzI_ULO2Aw-IL-FbmlZzom0ZaDAzONJfzGHCSPb9lg2VdLfoC7h5sOPexygXt3vrB-uWDzxamvuFRaDLTihkIjCHToatXDPjzF70MkzIe-KhC3Q37KNPn5--Dzj8noDpQ41UvtOGfMaDYof7nwaNsMbmZnptw-K5TY_FFzm_lnRyJ-SAmNudkCvNNEbr8889jCwHxNErkBzJzV1xdwgtDRP-NjUOknXgPcI')"}}></div>
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[8px] text-white font-bold">+5</div>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} />
                                已确认
                            </span>
                        </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
                        <button 
                            onClick={handleTicketClick}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex items-center justify-center gap-1.5"
                        >
                            <Ticket size={14} />
                            查看门票
                        </button>
                        <button 
                        onClick={handleShare}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-slate-400 hover:text-primary hover:border-primary transition-colors hover:bg-primary/5"
                        >
                        <Share2 size={18} />
                        </button>
                    </div>
                    </div>

                    {/* Card 2 - Waitlist */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
                    <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-200 overflow-hidden relative">
                        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBpF6O9phNTixKxy7qmaFY3FQBm3fdiQy-QoLIStJ1clYnI_xlHIElfjlcVqL9q0Owe2lwwt_fPwJRNSgFE756eBtxqWQRsspq2NyO7OA45XhheU35IRehWqDwFlsbvyPGbs6sk35z2OZlcKeDLK1JEo8I70WLOchyz7TGYL3Yv1rgpr_TaTtKgqk5OrSy1wGDHEcoJdxgCWeBu3_3azij_i0w3HqovmsL8-1kSURj1PELaP3r1p-VW5-6CiNWnPc28To7jxVIIsYc')"}}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">工作坊</span>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                            候补 #4
                        </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">零基础陶艺课</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Calendar size={14} />
                        <span>11月01日 (周日) • 14:00</span>
                        </div>
                    </div>
                    <button className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-background-light hover:bg-gray-200 transition-colors">
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                    </div>

                    {/* Card 3 - Pending */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center opacity-70 grayscale-[0.5]">
                    <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-200 overflow-hidden relative">
                        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9ywPpaWUY7Z3-2U_K9z1kRLddW07QbyUUNi40U9DA7VnqRevUpm6IQl9vvPMFG8fcnG-fCdwz_mvgm_l0EJHxzZ3T2SpwFSU1GiQl1pn0SH_hHjWf1gNa5g9LGIaaUKFJyj2OmOmHNwOYzXknulwB5_J8lFoAHXgNZsIJUIPMUOfML1xzBU-kU2XTgnOe7lkJ91xFYGBRooKjp7XHRacx6C8ezhiqJO-s85Z2S-BiPEwCMSj-OtMkwyKyhWGcHaCOMxcmPJE0o7M')"}}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">社交聚会</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            待定
                        </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">晨间咖啡局</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Calendar size={14} />
                        <span>11月04日 (周三) • 08:30</span>
                        </div>
                    </div>
                    <button className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-background-light hover:bg-gray-200 transition-colors">
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                    </div>

                    {/* Invite */}
                    {inviteVisible && (
                        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">活动邀请</h4>
                        <div className="bg-gradient-to-r from-primary/10 to-purple-100/50 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                            <Mail size={24} />
                            </div>
                            <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">胶片摄影俱乐部</p>
                            <p className="text-xs text-slate-600">邀请人: Sarah J.</p>
                            </div>
                            <div className="flex gap-2">
                            <button 
                                onClick={() => setInviteVisible(false)}
                                className="h-8 w-8 rounded-full flex items-center justify-center bg-white text-slate-400 shadow-sm border border-gray-100 hover:bg-slate-50"
                            >
                                <X size={18} />
                            </button>
                            <button 
                                onClick={() => {
                                    setInviteVisible(false);
                                    alert("成功加入胶片摄影俱乐部！");
                                }}
                                className="h-8 px-3 rounded-full flex items-center justify-center bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
                            >
                                加入
                            </button>
                            </div>
                        </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'created' && (
                <div className="flex flex-col gap-4">
                    {myCreatedActivities.length > 0 ? (
                        myCreatedActivities.map(activity => (
                            <div key={activity.id} onClick={() => navigate('/detail', { state: { activity } })} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center cursor-pointer">
                                <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-200 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${activity.image}')`}}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">{activity.tag}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{activity.title}</h3>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                                    <Calendar size={14} />
                                    <span>{activity.date}</span>
                                    </div>
                                </div>
                                <button className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-background-light hover:bg-gray-200 transition-colors">
                                    <ChevronRight size={20} className="text-slate-400" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p className="mb-4">你还没有发起过活动</p>
                            <button onClick={() => navigate('/create')} className="text-primary font-bold text-sm">去发布一个</button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'past' && (
                 <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center opacity-80 grayscale">
                        <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-200 overflow-hidden relative">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDMAHT2D9iANNFqugigMC8hS4wp_L5EyRwSmWTsN2jsPmRArWOswEuSL7MmSfjrdWC5-fI9vhSZIa_Nm6Yj3IQt6BuhcpbC1fg5CK-_F3aCkXEd9HO7QHP7SUVNGtty3sfWtpN5886XC3CUWWo1O-odIuITHHHMuncCCqT9x-36xTYAcHNgqsn2Y-MwtUOPRWaLez12BK5lm7pOZsPdC6qslRSF0dvpuE4eXayNcXtGNVe8PdcTKo74VzPXqo8AVWY78Hp52rL2G4" className="w-full h-full object-cover" alt="past" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">已结束</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">早间咖啡跑团</h3>
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                            <Clock size={14} />
                            <span>10月10日 • 08:00</span>
                            </div>
                        </div>
                        <button className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-background-light hover:bg-gray-200 transition-colors">
                            <ChevronRight size={20} className="text-slate-400" />
                        </button>
                    </div>
                 </div>
            )}

          </div>
          <div className="h-8"></div>
        </main>

        {/* Ticket Modal */}
        {showTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
                     <button 
                        onClick={() => setShowTicket(false)}
                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/10 hover:bg-black/20 text-white rounded-full flex items-center justify-center transition-colors"
                     >
                         <X size={18} />
                     </button>
                     <div className="bg-primary p-6 pt-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <h3 className="text-xl font-bold text-white relative z-10">活动入场券</h3>
                        <p className="text-white/80 text-xs mt-1 relative z-10">请在入场时向工作人员出示</p>
                     </div>
                     <div className="p-6 flex flex-col items-center">
                         <div className="p-3 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 mb-5">
                             <QrCode size={140} className="text-slate-900" />
                         </div>
                         <h2 className="text-lg font-bold text-slate-900 text-center leading-tight">市中心胡同艺术之旅</h2>
                         <p className="text-slate-500 text-sm font-medium mt-1">10月24日 (周六) • 10:00</p>
                         
                         <div className="w-full border-t border-slate-100 my-5 relative">
                             <div className="absolute -left-8 -top-3 w-6 h-6 bg-slate-800 rounded-full"></div>
                             <div className="absolute -right-8 -top-3 w-6 h-6 bg-slate-800 rounded-full"></div>
                         </div>

                         <div className="flex justify-between w-full items-center">
                             <div className="text-left">
                                 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">票号</p>
                                 <p className="text-slate-900 font-mono font-bold">SV-8293-01</p>
                             </div>
                             <div className="text-right">
                                 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">状态</p>
                                 <p className="text-green-500 font-bold flex items-center justify-end gap-1">
                                     <CheckCircle size={14} /> 有效
                                 </p>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
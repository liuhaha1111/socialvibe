import React from 'react';
import { X, CheckCircle, Clock, MapPin, Check, Fingerprint, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CheckIn: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden font-sans transition-colors duration-200">
      <div className="flex items-center justify-between px-4 py-4 pt-12 lg:pt-4 z-50">
        <button onClick={() => navigate(-1)} className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">活动签到</h2>
        <button className="flex w-10 items-center justify-center">
          <span className="text-primary text-sm font-bold leading-normal">帮助</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-4 gap-8 relative z-10 pb-10">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" style={{animationDuration: '1.5s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-400 rounded-lg animate-bounce opacity-50" style={{animationDuration: '2s'}}></div>
          <div className="absolute top-1/2 left-10 w-2 h-2 bg-red-400 transform rotate-45 opacity-60"></div>
        </div>

        <div className="text-center space-y-2 animate-[scale-in_0.5s_ease-out_forwards]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={18} className="animate-[success-pop_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]" />
            <p className="font-bold text-sm tracking-wide">已定位</p>
          </div>
          <h1 className="text-slate-900 text-3xl font-black tracking-tight mt-2">签到成功！</h1>
          <p className="text-slate-500 text-base font-medium">享受你的时光</p>
        </div>

        <div className="animate-[slide-up_0.5s_ease-out_0.2s_forwards] opacity-0 w-full max-w-sm rounded-2xl bg-white shadow-2xl shadow-primary/10 overflow-hidden group border border-slate-100">
          <div className="relative h-48 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            <img alt="Activity" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdbDlaNNV3KvPSwLBL-hazfWMP0kcyPuZLH11PaSQISwyaDxJNy_w14JYq_If95uAMPYTYH4qjDAHpeEQqZBH5cVTlU-whdZQ9vh6wyIPTOWW09KRDib6FHxipyqGkJ5DloIeti5qh0eB8f19ymwpdyKhi0ALANYAwzILN-8afSTTgjZ2Mbwi28rFXHTrjXlNfMg3rcLaDv2MThrEbrQyjw7Z0x6Tz9x-O3KHfwRFuTNYowavl8IZnCSX1iVeACdW_eiyuiADrglY" />
            <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-end">
              <div className="flex flex-col text-white">
                <span className="text-xs font-medium opacity-80 mb-0.5">今天</span>
                <div className="flex items-center gap-1 font-bold">
                  <Clock size={16} />
                    17:00
                </div>
              </div>
              <div className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg shadow-primary/20">
                进行中
              </div>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-4 relative">
            <div className="absolute -top-6 right-5 z-20">
              <div className="relative flex items-center justify-center size-12 rounded-full bg-white shadow-lg ring-4 ring-slate-50">
                <span className="relative flex size-6 text-green-500 items-center justify-center">
                  <Check size={24} />
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-slate-900 text-xl font-bold leading-snug">日落城市漫步</h3>
              <div className="flex items-center gap-1.5 text-slate-500 mt-2">
                <MapPin size={18} className="text-primary" />
                <p className="text-sm font-medium">中央公园，北门集合点</p>
              </div>
            </div>
            <div className="h-px w-full bg-slate-100"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3 rtl:space-x-reverse">
                  <img alt="User 1" className="w-9 h-9 border-2 border-white rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM6Txq5633s0mvfWdSq9jE0iXLDH6vJdJ02c-JmfksTeUCtiGynKLbcUZxX3tDUfaHv9tMkMrGZWRMO2dFwriX5afWWDlrjVDGtiQ9AOorZTJtUl88kjn3CdgelrOOHO6L1MP53vWQdHUjt-l6-YjX2QNkT0h6HB22fPjmOvIyaDhYhsCASd2S_7aBJxRXsK0_Vq29dTnpZNn6oHo01ejIfkj584Lzl3Gp-cBNgusdJznwtgWTduwHEjlIDNIqo3kFCAgOp9KvJ2A" />
                  <img alt="User 2" className="w-9 h-9 border-2 border-white rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADmgSckzB-4vWEXL43ZypsKUN20YwMiz0uL2AxQZb8q33pXxTr6uBotJ4rStrKkYQkiaV16e5J9_Ktctv4stMMlZnQ5a4quofzWcTtMWS2ywNSCbR56Wv2azslNi8ClnjQOqcA-2HRavGXmFMq1F_z-Y7_x1LiLeRw9CnZXxJJuW1UglLIdFGIkxlzNWgo1BRbCAKtb7SHjniFFfyv53e5vb5axci-cCXF8CSzvTXYHqfNLmYd1sZQaWjAb6aajRhBfOC9SgtGFSM" />
                  <img alt="User 3" className="w-9 h-9 border-2 border-white rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAMaTNT1aTXOLh_uGGmQ93EGc3thqeqgEM1qlLVMpgySe4V7ZLdoPrmPdULIEK3xONoiRdXUlSCNpt7kqw4xn9BmDx2MNunkiRCzRRy3r_gbnHM1y-mLSbOWNsqRmsZto2sSWiOdPXslAMCoIJGa6j4MzoCc8ITjSqNmuR7Tc476QJgw4ecJbx5OloLmdjrvoYiEHxDDSAZmNxygAIZknBCrEMGL4-srh7bqFsYRLuLn7xvI6OcgrI6cDmcypU3hmeDHxImLFKzFA" />
                </div>
                <p className="text-xs text-slate-500 font-medium"><span className="text-slate-900 font-bold">5位</span> 好友在场</p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-12 w-full max-w-sm px-6">
          <div className="relative w-full group/btn">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-400 rounded-full blur opacity-75 group-hover/btn:opacity-100 transition duration-1000 group-hover/btn:duration-200 animate-pulse"></div>
            <button className="relative w-full bg-primary hover:bg-primary/90 text-white rounded-full py-4 px-8 flex items-center justify-between shadow-lg shadow-primary/30 transition-all active:scale-[0.95]">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Fingerprint size={24} />
                </div>
                <span className="text-lg font-bold tracking-wide">点击签到</span>
              </div>
              <ArrowRight className="animate-bounce" style={{animationDirection: 'horizontal'}} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
              验证位置以获取积分
          </p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { ArrowLeft, PlusCircle, Smile, Send, CheckCheck, Check, Footprints, Camera, Palette } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Chat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chatUser = location.state?.user || {
    name: '林雨薇 (Sarah)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZH9ZAEvqUmfr0JJxmIr5W_GREgOyRDSirdTZ2ZCM-GYhpyUuAd4BJPm_3pRoMyl7a6I0BA7mJZdn7YKWQpSntD1Gcd9p39UAEQWayXZWnFKqYn-gDf-gaibV0-LfskKA1vn72ipZLIuhWmgMYAw38086S09lkE_wpfv3Vha6SSN7aRlMoKwHAQzXFHT3fmhG8q4R-y7lU6DHlm6WXxWJ9yoDguFSeNc9k8-IWoo6jgOmxsAhORfVd8BPLZFPwkNPVzj158e3HinQ',
    online: true
  };

  const handleBack = () => {
     navigate('/chat-list');
  };

  return (
    <div className="bg-background-light h-screen flex flex-col justify-center overflow-hidden">
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden mx-auto">
        <header className="flex-none bg-white border-b border-slate-100 z-20">
          <div className="h-10 w-full bg-white"></div>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={handleBack} className="text-slate-900 flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col items-center flex-1 mx-2">
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">{chatUser.name}</h2>
              {chatUser.online && (
                  <div className="flex items-center gap-1">
                    <span className="block w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-slate-500">在线</span>
                  </div>
              )}
            </div>
            <button onClick={() => navigate('/detail')} className="text-primary hover:text-primary/80 font-bold text-sm leading-normal tracking-wide px-3 py-1.5 bg-primary/10 rounded-full transition-colors whitespace-nowrap">
                查看活动
            </button>
          </div>
          <div className="w-full overflow-x-auto pb-4 pt-1 px-4 no-scrollbar">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 mr-1">同好标签</span>
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-4 py-1.5 rounded-full bg-primary text-white shadow-sm shadow-primary/30 whitespace-nowrap">
                  <Footprints size={16} className="mr-1.5" />
                  <span className="text-xs font-bold">城市漫步</span>
                </div>
                <div className="flex items-center justify-center px-4 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">
                  <Camera size={16} className="mr-1.5 text-primary" />
                  <span className="text-xs font-bold text-slate-600">胶片摄影</span>
                </div>
                <div className="flex items-center justify-center px-4 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">
                  <Palette size={16} className="mr-1.5 text-primary" />
                  <span className="text-xs font-bold text-slate-600">艺术展</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background-light p-4 flex flex-col gap-6 scroll-smooth">
          <div className="flex justify-center my-2">
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">今天, 10:23</span>
          </div>

          <div className="flex items-end gap-3 group">
            <div className="relative shrink-0">
              <img alt={chatUser.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" src={chatUser.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAZH9ZAEvqUmfr0JJxmIr5W_GREgOyRDSirdTZ2ZCM-GYhpyUuAd4BJPm_3pRoMyl7a6I0BA7mJZdn7YKWQpSntD1Gcd9p39UAEQWayXZWnFKqYn-gDf-gaibV0-LfskKA1vn72ipZLIuhWmgMYAw38086S09lkE_wpfv3Vha6SSN7aRlMoKwHAQzXFHT3fmhG8q4R-y7lU6DHlm6WXxWJ9yoDguFSeNc9k8-IWoo6jgOmxsAhORfVd8BPLZFPwkNPVzj158e3HinQ"} />
            </div>
            <div className="flex flex-col gap-1 items-start max-w-[75%]">
              <span className="text-slate-500 text-[11px] font-medium ml-3">{chatUser.name.split(' ')[0]}</span>
              <div className="rounded-2xl rounded-bl-none px-4 py-3 bg-white text-slate-800 shadow-sm border border-slate-100">
                <p className="text-[15px] font-normal leading-relaxed">
                    嗨！这周六的手作工坊你还去吗？我发现附近有个很棒的打卡点！
                </p>
              </div>
              <div className="mt-1 rounded-2xl rounded-bl-none overflow-hidden border border-slate-100 shadow-sm w-48">
                <img alt="Location" className="w-full h-32 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGO53Qd5YeiRrIGWXRWPY17JIYJvt5mLLJN8yUXtV_fju9CkeDeAxs448j75uKqpGD0-6fsqZMOmcZq1CR4IJwcDKUWpoUbv-m9pXT78El7rwYOxGE-3adWtM9cRiX3Nqh4LjACCXlCo1z4siTjGcmypwOIX_Cl2p4wavxsMm-Xlta4PyAvHdYBVco6gnr5kH9CHZkt6gPpnbLdo2hz_Lo8ZEpZUfurRDVl0jSWu0jgnBH9cNHqUbBWjVBqdLygHWXMPgpPzUiQos" />
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 justify-end group">
            <div className="flex flex-col gap-1 items-end max-w-[75%]">
              <div className="rounded-2xl rounded-br-none px-4 py-3 bg-primary text-white shadow-md shadow-primary/20">
                <p className="text-[15px] font-normal leading-relaxed">去啊！我也超级期待的。</p>
              </div>
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[10px] text-slate-400 font-medium">10:45</span>
                <CheckCheck size={14} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 justify-end group -mt-4">
            <div className="flex flex-col gap-1 items-end max-w-[75%]">
              <div className="rounded-2xl rounded-tr-sm rounded-br-none px-4 py-3 bg-primary text-white shadow-md shadow-primary/20">
                <p className="text-[15px] font-normal leading-relaxed">我们需要自带相机吗？还是现场会提供器材？</p>
              </div>
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[10px] text-slate-400 font-medium">10:46</span>
                <Check size={14} className="text-slate-300" />
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 mt-2">
            <div className="relative shrink-0">
              <img alt={chatUser.name} className="w-6 h-6 rounded-full object-cover opacity-70" src={chatUser.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBpNmMAQCQiuf8LhSCmm2xE_F2YqMp_Q_nxIPe5kfgdkbYyayMCkYv0-XFIQ4spkMxJFiqUIIyG6nRlZOe8tbFBnFv1woW5SJ-39BzvdGhtsI2ZSwk0xhdZIjg09aDulgD76_VzpSu8kc4UabpZubS0I-eVmxSwZ2xB76o3fb2oZui6-rUVwr8wFyo6wT3oQmjtUIBCKBAYYEbr-cRYnz_74d7pjiIxCCD8tUDueeOV937oRAV2hZoIo_UWme8ykhQcY2VVUmvgd8c"} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="rounded-2xl rounded-bl-none px-4 py-3 bg-white border border-slate-100 shadow-sm flex items-center gap-1 h-10 w-16 justify-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
              <span className="text-[10px] text-slate-400 ml-1">对方正在输入...</span>
            </div>
          </div>
          <div className="h-4"></div>
        </main>

        <footer className="flex-none bg-white px-4 py-3 pb-8 border-t border-slate-100 z-20">
          <div className="flex items-end gap-2">
            <button className="flex-none p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-50 h-[48px] w-[48px] flex items-center justify-center">
              <PlusCircle size={28} />
            </button>
            <div className="flex-1 bg-slate-100 rounded-3xl flex items-center px-4 py-2 min-h-[48px] focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input className="w-full bg-transparent border-none p-0 text-slate-900 placeholder-slate-400 focus:ring-0 text-[16px]" placeholder="发消息..." type="text" />
              <button className="ml-2 text-slate-400 hover:text-primary transition-colors">
                <Smile size={24} />
              </button>
            </div>
            <button className="flex-none bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 h-[48px] w-[48px] flex items-center justify-center">
              <Send size={24} className="ml-0.5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
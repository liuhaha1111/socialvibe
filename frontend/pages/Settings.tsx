import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, User, Mail, MapPin, Check, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [email, setEmail] = useState(user.email);
  const [location, setLocation] = useState(user.location);

  const handleSave = () => {
    updateUser({ name, bio, email, location });
    navigate('/profile');
  };

  return (
    <div className="bg-background-light min-h-screen text-slate-900 pb-20 font-sans">
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">编辑个人资料</h1>
        <button 
          onClick={handleSave} 
          className="text-primary font-bold text-sm px-2"
        >
          保存
        </button>
      </div>

      <div className="flex flex-col items-center py-8">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
             <img 
               src={user.avatar} 
               alt="Avatar" 
               className="w-full h-full object-cover"
             />
          </div>
          <div className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full border-2 border-white shadow-md">
            <Camera size={16} />
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500 font-medium">点击更换头像</p>
      </div>

      <div className="px-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-primary" />
            昵称
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText size={16} className="text-primary" />
             简介
          </label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all h-24 resize-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Mail size={16} className="text-primary" />
            邮箱
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            常驻城市
          </label>
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      <div className="px-6 mt-8">
        <button 
          onClick={handleSave}
          className="w-full bg-primary text-white font-bold text-lg py-4 rounded-full shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Check size={20} />
          保存修改
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface SidebarProps {
  activeTab: 'audit' | 'guidelines' | 'history';
  setActiveTab: (tab: 'audit' | 'guidelines' | 'history') => void;
  activeProfileName: string;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeProfileName, user, onLogout }) => {
  const [connectionType, setConnectionType] = useState<'system' | 'user' | 'none'>('none');

  useEffect(() => {
    const checkConnection = async () => {
      const aistudio = (window as any).aistudio;
      
      // 1. 檢查是否有開發者預設的系統金鑰 (process.env.API_KEY)
      if (process.env.API_KEY && process.env.API_KEY !== "") {
        setConnectionType('system');
        return;
      }

      // 2. 檢查是否有使用者透過 aistudio 選取的個人金鑰
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (hasKey) {
          setConnectionType('user');
          return;
        }
      }
      
      setConnectionType('none');
    };

    checkConnection();
    const timer = setInterval(checkConnection, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = async () => {
    const aistudio = (window as any).aistudio;
    
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      try {
        await aistudio.openSelectKey();
        // 規範：呼叫後應假設成功並繼續
        setConnectionType('user');
      } catch (e) {
        console.error("Connection failed", e);
      }
    } else {
      // 在不支援 aistudio 選取器的正式瀏覽器環境下的處理
      alert(
        "【AI 核心連線指南】\n\n" +
        "目前您處於獨立瀏覽器模式。如需啟動 AI 功能，請：\n" +
        "1. 在部署平台 (如 Vercel/Netlify) 設定 API_KEY 環境變數。\n" +
        "2. 或確保在 Google AI Studio 的專屬預覽連結中開啟本網站。\n\n" +
        "本系統基於安全規範，不提供直接手打輸入金鑰的欄位。"
      );
    }
  };

  const tabs = [
    { id: 'audit', label: 'AI 審核員', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: 'guidelines', label: 'CI 規範', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: 'history', label: '素材庫', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg> },
  ];

  return (
    <div className="w-72 flex-shrink-0 bg-slate-950 h-full flex flex-col text-slate-400 z-20 border-r border-white/5 shadow-2xl">
      <div className="p-10 flex items-center space-x-4">
        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-slate-950 font-black brand-font text-2xl shadow-xl">F</div>
        <span className="text-2xl font-black text-white brand-font tracking-tighter">FOOTER</span>
      </div>
      
      <nav className="flex-1 px-8 space-y-2 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative ${
              activeTab === tab.id ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-lg -z-10 animate-in fade-in zoom-in-95 duration-500"></div>
            )}
            <span className={`transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`}>
              {tab.icon}
            </span>
            <span className="font-bold text-[15px] tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-8 space-y-6">
        {/* AI Key Status Monitoring */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">AI Connectivity</p>
            <div className={`w-2 h-2 rounded-full ${connectionType !== 'none' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
          </div>
          
          <div className="px-1">
            <p className="text-[10px] font-bold text-slate-400">
              {connectionType === 'system' ? '已連線 (系統預設)' : 
               connectionType === 'user' ? '已連線 (個人帳戶)' : '尚未偵測到金鑰'}
            </p>
          </div>

          <button 
            onClick={handleConnect}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              connectionType !== 'none' ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-white text-slate-950 hover:scale-105'
            }`}
          >
            {connectionType !== 'none' ? '管理個人金鑰' : '啟動 AI 核心'}
          </button>
          
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block text-[8px] text-center text-slate-600 hover:text-indigo-400 transition-colors uppercase tracking-widest">
            查看帳單說明
          </a>
        </div>

        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">Workspace</p>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <p className="text-[13px] font-bold text-slate-200 truncate">{activeProfileName}</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center justify-between bg-white/5 rounded-3xl p-4 border border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={user.picture} className="w-9 h-9 rounded-full border border-white/20" alt={user.name} />
              <div className="overflow-hidden">
                <p className="text-xs font-black text-white truncate">{user.name}</p>
                <button onClick={onLogout} className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

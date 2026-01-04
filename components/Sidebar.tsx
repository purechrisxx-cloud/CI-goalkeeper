
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
  const [connectionStatus, setConnectionStatus] = useState<'system' | 'user' | 'none'>('none');

  useEffect(() => {
    const checkStatus = async () => {
      // 1. 檢查是否有 Vercel/系統環境變數提供的 Key
      if (process.env.API_KEY && process.env.API_KEY !== "") {
        setConnectionStatus('system');
        return;
      }

      // 2. 檢查是否在 AI Studio 預覽環境中並已選取 Key
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (hasKey) {
          setConnectionStatus('user');
          return;
        }
      }
      
      setConnectionStatus('none');
    };

    checkStatus();
    const timer = setInterval(checkStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleConnectClick = async () => {
    const aistudio = (window as any).aistudio;
    
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      try {
        await aistudio.openSelectKey();
        setConnectionStatus('user');
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    } else if (connectionStatus === 'none') {
      // 在正式瀏覽器且無環境變數的情況下，給予明確指引
      alert(
        "【AI 核心啟動指引】\n\n" +
        "目前尚未偵測到 API 金鑰，請執行以下步驟：\n\n" +
        "1. 管理者請前往 Vercel 後台設定 Environment Variable。\n" +
        "2. 變數名稱設定為：API_KEY\n" +
        "3. 填入 Google Gemini API Key 後重新部署。\n\n" +
        "設定完成後，全體團隊成員即可直接使用 AI 審核功能。"
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
        {/* AI Key Status Monitoring Dashboard */}
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">AI Core Status</p>
            <div className={`w-2.5 h-2.5 rounded-full ${connectionStatus !== 'none' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-slate-600 animate-pulse'}`}></div>
          </div>
          
          <div className="px-1">
            <p className="text-[10px] font-bold text-slate-400 leading-tight">
              {connectionStatus === 'system' ? '連線來源：團隊共用金鑰' : 
               connectionStatus === 'user' ? '連線來源：個人開發金鑰' : '狀態：尚未偵測到金鑰'}
            </p>
          </div>

          <button 
            onClick={handleConnectClick}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              connectionStatus !== 'none' ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-white text-slate-950 hover:scale-105 active:scale-95'
            }`}
          >
            {connectionStatus !== 'none' ? '管理 AI 配置' : '立即啟動 AI 核心'}
          </button>
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

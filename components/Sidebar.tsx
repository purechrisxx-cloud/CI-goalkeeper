import React from 'react';

interface SidebarProps {
  activeTab: 'audit' | 'guidelines' | 'history';
  setActiveTab: (tab: 'audit' | 'guidelines' | 'history') => void;
  activeProfileName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeProfileName }) => {
  const tabs = [
    { id: 'audit', label: 'AI 審核員', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: 'guidelines', label: 'CI 規範', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: 'history', label: '素材庫', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg> },
  ];

  return (
    <div className="w-72 flex-shrink-0 bg-slate-950 h-full flex flex-col text-slate-400 z-20 border-r border-white/5 shadow-2xl">
      <div className="p-12 flex items-center space-x-4">
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

      <div className="p-10">
        <div className="bg-white/5 rounded-[2.5rem] p-7 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">Workspace</p>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <p className="text-[13px] font-bold text-slate-200 truncate">{activeProfileName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
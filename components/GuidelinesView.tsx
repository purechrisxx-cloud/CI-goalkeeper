
import React, { useRef, useState } from 'react';
import { BrandCI } from '../types';
import { Icons } from '../constants';

interface GuidelinesViewProps {
  profiles: BrandCI[];
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  updateProfile: (profile: BrandCI) => void;
  addProfile: () => void;
  importProfile: (profile: BrandCI) => void;
  deleteProfile: (id: string) => void;
  saveSnapshot: (id: string) => void;
  restoreSnapshot: (profileId: string, timestamp: number) => void;
}

const GuidelinesView: React.FC<GuidelinesViewProps> = ({ 
  profiles, 
  activeProfileId, 
  setActiveProfileId, 
  updateProfile,
  addProfile,
  importProfile,
  deleteProfile,
  saveSnapshot,
  restoreSnapshot
}) => {
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateProfile({ ...activeProfile, [name]: value });
  };

  const handleExport = () => {
    const { history, ...exportData } = activeProfile;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${activeProfile.name}_CI_規範.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyShareCode = () => {
    const { history, ...exportData } = activeProfile;
    const code = btoa(encodeURIComponent(JSON.stringify(exportData)));
    navigator.clipboard.writeText(code);
    alert('分享碼已複製到剪貼簿！同仁只需在不同電腦點擊「匯入」並貼上此代碼即可同步。');
  };

  const handleQuickImport = () => {
    const code = prompt('請貼上同仁分享的規範代碼 (Share Code)：');
    if (code) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(code)));
        importProfile(decoded);
        alert('規範同步成功！');
      } catch (err) {
        alert('代碼無效，請確認是否完整複製。');
      }
    }
  };

  const inputStyle = "w-full px-7 py-5 rounded-[2rem] border-2 border-slate-100 bg-white/50 hover:border-indigo-200 focus:bg-white focus:border-indigo-600 focus:ring-[12px] focus:ring-indigo-500/5 focus:shadow-2xl outline-none transition-all duration-500 text-slate-950 font-semibold placeholder:text-slate-300";

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter brand-font">
            <span className="gradient-text">品牌核心規範</span>
          </h1>
          <p className="text-slate-600 mt-5 text-xl font-medium max-w-lg leading-relaxed">定義品牌人格與受眾，為 AI 提供最精確的審核基準。</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <input type="file" ref={importInputRef} onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               const reader = new FileReader();
               reader.onload = (event) => {
                 try {
                   importProfile(JSON.parse(event.target?.result as string));
                 } catch (err) { alert('匯入失敗'); }
               };
               reader.readAsText(file);
             }
          }} accept=".json" className="hidden" />
          
          <button onClick={handleQuickImport} className="flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-4 rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest transition-all active:scale-95">
            <Icons.Import />
            <span>同步分享碼</span>
          </button>

          <button onClick={() => importInputRef.current?.click()} className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-6 py-4 rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 premium-shadow">
            <span>檔案匯入</span>
          </button>
          
          <button onClick={addProfile} className="flex items-center gap-3 bg-slate-950 hover:bg-black text-white px-8 py-4 rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest shadow-2xl transition-all active:scale-95">
            <Icons.Plus />
            <span>建立檔案</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {profiles.map(p => (
          <div key={p.id} className="relative group shrink-0">
            <button
              onClick={() => setActiveProfileId(p.id)}
              className={`px-8 py-4 rounded-[1.5rem] font-black text-[14px] border-2 transition-all flex items-center gap-4 ${
                activeProfileId === p.id 
                  ? 'bg-white border-indigo-600 text-indigo-700 shadow-xl' 
                  : 'bg-white/40 border-transparent text-slate-400 hover:bg-white hover:text-slate-600'
              }`}
            >
              {p.name}
            </button>
            {profiles.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }} className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-rose-500 w-8 h-8 rounded-full border shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
                <Icons.Trash />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="premium-card rounded-[4rem] p-16 shadow-sm space-y-12">
        <div className="flex items-center justify-between border-b pb-10 border-slate-50">
           <h2 className="text-3xl font-black text-slate-950 brand-font tracking-tight">{activeProfile.name}</h2>
           <div className="flex flex-wrap gap-4">
             <button onClick={copyShareCode} className="text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                複製分享碼
             </button>
             <button onClick={() => { saveSnapshot(activeProfile.id); alert('已儲存快照'); }} className="text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                <Icons.Check />
                儲存快照
             </button>
             <button onClick={handleExport} className="text-slate-400 hover:bg-slate-50 px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
               <Icons.Download />
               匯出 JSON
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">品牌名稱</label>
            <input name="name" value={activeProfile.name} onChange={handleChange} className={inputStyle} />
          </div>
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">核心受眾 (Target Audience)</label>
            <input 
              name="targetAudience" 
              placeholder="例如：18-25 歲、重視機能的現代人" 
              value={activeProfile.targetAudience} 
              onChange={handleChange} 
              className={inputStyle} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">品牌人格 (Persona)</label>
          <textarea name="persona" rows={3} value={activeProfile.persona} onChange={handleChange} className={inputStyle} placeholder="品牌對外溝通的性格..."></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">主色調</label>
            <div className="flex gap-5">
              <input type="color" name="primaryColor" value={activeProfile.primaryColor} onChange={handleChange} className="w-20 h-20 rounded-[1.5rem] border-2 border-white p-2 cursor-pointer bg-white shadow-lg" />
              <input type="text" name="primaryColor" value={activeProfile.primaryColor} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">CTA 行動策略</label>
            <textarea name="ctaStrategy" rows={3} value={activeProfile.ctaStrategy} onChange={handleChange} className={inputStyle}></textarea>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">創意限制與禁忌</label>
          <textarea name="additionalRules" rows={4} value={activeProfile.additionalRules} onChange={handleChange} className={inputStyle} placeholder="禁止事項或核心視覺限制..."></textarea>
        </div>
      </div>

      <div className="bg-slate-950/5 rounded-[3.5rem] p-12 border border-slate-100 shadow-inner">
        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4 brand-font">
          <Icons.Compass />
          Snapshot History
        </h3>
        {(!activeProfile.history || activeProfile.history.length === 0) ? (
          <p className="text-slate-400 text-sm font-medium italic px-4">尚無快照紀錄。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {activeProfile.history.map((h) => (
              <div key={h.timestamp} className="bg-white p-6 rounded-[2rem] flex items-center justify-between border border-white shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                <div>
                  <p className="text-sm font-black text-slate-950">{new Date(h.timestamp).toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{h.data.targetAudience?.slice(0, 20)}...</p>
                </div>
                <button 
                  onClick={() => { if(confirm('還原到此版本？')) restoreSnapshot(activeProfile.id, h.timestamp); }}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidelinesView;

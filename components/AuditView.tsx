
import React, { useState, useRef, useMemo } from 'react';
import { BrandCI, AuditResult, Asset } from '../types';
import { auditAsset } from '../services/geminiService';
import { Icons } from '../constants';

interface AuditViewProps {
  ci: BrandCI;
  onAssetSave: (url: string, name: string, result: AuditResult, snapshot: BrandCI, groupId?: string, version?: number) => void;
  assets: Asset[];
}

const AuditView: React.FC<AuditViewProps> = ({ ci, onAssetSave, assets }) => {
  const [file, setFile] = useState<string | null>(null);
  const [intent, setIntent] = useState('');
  const [campaignContext, setCampaignContext] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previousAsset = useMemo(() => {
    if (!currentGroupId) return null;
    return assets.find(a => a.groupId === currentGroupId && a.version === currentVersion - 1);
  }, [assets, currentGroupId, currentVersion]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleAudit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const auditResult = await auditAsset(file, ci, intent, campaignContext);
      setResult(auditResult);
      const compressedFile = await compressImage(file);
      const groupId = currentGroupId || Math.random().toString(36).substr(2, 9);
      if (!currentGroupId) setCurrentGroupId(groupId);
      onAssetSave(compressedFile, `FOOTER 審核 v${currentVersion}`, auditResult, ci, groupId, currentVersion);
    } catch (error) {
      alert('分析失敗。請重試。');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForReupload = () => {
    setFile(null);
    setResult(null);
    setCurrentVersion(v => v + 1); 
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleFullReset = () => {
    setFile(null);
    setResult(null);
    setIntent('');
    setCampaignContext('');
    setCurrentGroupId(null);
    setCurrentVersion(1);
  };

  const scoreDelta = result && previousAsset && previousAsset.auditResult 
    ? result.overallScore - previousAsset.auditResult.overallScore 
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-14 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-6 duration-1000">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">AI Auditor</span>
            <span className="text-slate-400 font-light">/</span>
            <span className="text-slate-600 font-bold text-[13px] tracking-wide">Studio Intelligence</span>
          </div>
          <h1 className="text-6xl font-black brand-font tracking-tighter">
            <span className="gradient-text">行銷素材審核</span>
          </h1>
          <p className="text-slate-700 mt-5 text-lg font-semibold max-w-2xl leading-relaxed">
            融合 FOOTER 品牌規範與最新社群趨勢，讓每一次迭代都具備更高的轉換力。
          </p>
        </div>
        {result && (
          <div className="flex gap-4">
            <button onClick={handleFullReset} className="px-10 py-5 text-sm font-bold text-slate-800 bg-white/60 border border-slate-200 rounded-[2rem] hover:bg-white transition-all premium-shadow active:scale-95">
              重啟專案
            </button>
            <button onClick={handleResetForReupload} className="px-10 py-5 text-sm font-bold text-white bg-indigo-600 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95">
              <Icons.Plus />
              上傳新版本 (v{currentVersion + 1})
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-14">
        <aside className="xl:col-span-4 space-y-10">
          <div className="premium-card rounded-[3.5rem] p-12 premium-shadow sticky top-14">
            <h2 className="text-xl font-black text-slate-950 mb-10 brand-font flex items-center justify-between">
              素材上傳 <span className="text-[11px] bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-black">ITERATION v{currentVersion}</span>
            </h2>
            
            <div 
              onClick={() => !loading && fileInputRef.current?.click()} 
              className={`relative aspect-square rounded-[3rem] overflow-hidden border-2 border-dashed transition-all duration-700 cursor-pointer group ${file ? 'border-indigo-600' : 'border-slate-300 hover:border-indigo-400 bg-white/40'}`}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
              {file ? (
                <div className="w-full h-full relative p-4">
                  <img src={file} alt="預覽" className="w-full h-full object-contain rounded-2xl" />
                  <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 p-10 text-center">
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 mb-2 shadow-sm group-hover:scale-110 transition-transform duration-700">
                    <Icons.Upload />
                  </div>
                  <p className="font-bold text-slate-950 brand-font uppercase tracking-[0.2em] text-[11px]">點擊或拖放素材</p>
                  <p className="text-[10px] text-slate-500 font-bold tracking-wide">SUPPORTED: JPG, PNG, WEBP</p>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div> 活動背景
                </label>
                <textarea
                  value={campaignContext}
                  onChange={(e) => setCampaignContext(e.target.value)}
                  placeholder="例如：FOOTER 品牌週、涼感機能特輯..."
                  className="w-full p-6 bg-white/40 rounded-[2rem] border border-slate-200 text-sm h-32 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all resize-none font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-indigo-500"></div> 創作目標
                </label>
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="你想達成什麼行銷目的..."
                  className="w-full p-6 bg-white/40 rounded-[2rem] border border-slate-200 text-sm h-32 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all resize-none font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {file && !loading && !result && (
              <button onClick={handleAudit} className="w-full mt-12 py-6 bg-slate-950 hover:bg-black text-white font-black brand-font rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center space-x-4 active:scale-95 group">
                <span className="group-hover:translate-x-1 transition-transform tracking-widest text-[13px] uppercase">開始深度分析</span>
                <Icons.Check />
              </button>
            )}

            {loading && (
              <div className="w-full mt-12 py-6 bg-white/90 text-slate-500 font-black brand-font rounded-[2.5rem] flex items-center justify-center space-x-5 border border-slate-200 shadow-xl">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="tracking-[0.2em] text-[12px] uppercase">AI Analyzing...</span>
              </div>
            )}
          </div>
        </aside>

        <main className="xl:col-span-8">
          {result ? (
            <div className="space-y-12 animate-in slide-in-from-right-16 duration-1000">
              
              <div className="bg-slate-950 rounded-[4rem] p-16 text-white overflow-hidden relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/5">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
                    <h3 className="text-3xl font-black brand-font tracking-tighter">Evolution Studio</h3>
                  </div>
                  {previousAsset && (
                    <div className={`px-8 py-3 rounded-full text-[11px] font-black tracking-widest uppercase border ${scoreDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                      {scoreDelta >= 0 ? `Score UP +${scoreDelta}` : `Delta ${scoreDelta}`}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-16 relative">
                  {loading && <div className="comparison-scan"></div>}
                  
                  <div className="space-y-8">
                    <div className="aspect-[4/5] bg-white/5 rounded-[3rem] overflow-hidden border border-white/10 relative group shadow-inner">
                      {previousAsset ? (
                        <img src={previousAsset.url} className="w-full h-full object-contain opacity-30 grayscale group-hover:opacity-50 transition-all duration-1000" alt="Previous" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800 font-black brand-font uppercase tracking-widest text-[11px]">No Previous Data</div>
                      )}
                      <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-xl px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">V-{currentVersion > 1 ? currentVersion - 1 : 0}</div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.3em] mb-2">Previous</p>
                      <p className="text-4xl font-black text-slate-500 brand-font">{previousAsset ? previousAsset.auditResult?.overallScore : '--'}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="aspect-[4/5] bg-indigo-500/5 rounded-[3rem] overflow-hidden border border-indigo-500/40 relative shadow-[0_0_80px_-20px_rgba(79,70,229,0.4)]">
                      <img src={file!} className="w-full h-full object-contain" alt="Current" />
                      <div className="absolute top-8 left-8 bg-indigo-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/50">Current V{currentVersion}</div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-indigo-400 uppercase font-black tracking-[0.3em] mb-2">Current</p>
                      <p className="text-4xl font-black text-white brand-font">{result.overallScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="premium-card rounded-[3.5rem] p-12 text-center flex flex-col items-center justify-center border-white/80">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Brand Score</p>
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full"></div>
                    <h3 className="relative text-8xl font-black text-slate-950 brand-font leading-none">{result.overallScore}</h3>
                  </div>
                  <p className="text-[11px] font-black mt-8 px-6 py-2 bg-slate-950 text-white rounded-full tracking-[0.2em] uppercase shadow-lg">{result.healthStatus}</p>
                </div>
                <div className="premium-card rounded-[3.5rem] p-12 md:col-span-2 space-y-10 border-white/80">
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-black text-indigo-700 uppercase tracking-[0.4em]">Resonance Analysis</p>
                    <Icons.Zap />
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">受眾契合度</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-black text-slate-950 brand-font">{result.audienceResonance}</span>
                        <span className="text-xs font-black text-slate-400">/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-[2s] ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${result.audienceResonance}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">社群趨勢感</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-black text-slate-950 brand-font">{result.trendRelevance}</span>
                        <span className="text-xs font-black text-slate-400">/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-950 transition-all duration-[2s] ease-out" style={{ width: `${result.trendRelevance}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card rounded-[3.5rem] p-16 space-y-10 shadow-sm border-white/80">
                 <div className="flex items-center gap-6 border-b border-slate-200/50 pb-10">
                    <div className="w-14 h-14 bg-indigo-100/50 text-indigo-700 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Icons.Compass /></div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-950 brand-font tracking-tight">行銷總監分析</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Director's Critique</p>
                    </div>
                 </div>
                 <p className="text-slate-800 leading-relaxed text-2xl font-bold italic opacity-95">"{result.marketingCritique}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="bg-white/80 rounded-[3.5rem] p-12 border border-white premium-shadow">
                    <h3 className="text-slate-950 font-black brand-font mb-8 flex items-center gap-4 text-xl tracking-tight">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div> CI 優化指南
                    </h3>
                    <ul className="space-y-5">
                      {result.suggestions.compliance.map((s, i) => (
                        <li key={i} className="text-[15px] text-slate-800 flex gap-5 bg-white/60 p-6 rounded-[2rem] border border-white hover:bg-white transition-all shadow-sm">
                           <span className="shrink-0 font-black text-indigo-700 brand-font text-lg">0{i+1}</span>
                           <span className="font-bold leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div className="bg-slate-950 rounded-[3.5rem] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
                    <h3 className="text-white font-black brand-font mb-8 flex items-center gap-4 text-xl tracking-tight">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]"></div> 創意突圍點
                    </h3>
                    <ul className="space-y-5">
                      {result.suggestions.creative.map((s, i) => (
                        <li key={i} className="text-[15px] text-slate-200 flex gap-5 bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors">
                           <span className="shrink-0 font-black text-indigo-400 brand-font text-lg">#</span>
                           <span className="font-bold leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>
            </div>
          ) : !loading && (
            <div className="h-full min-h-[750px] flex flex-col items-center justify-center text-center p-24 border border-white/80 rounded-[4rem] bg-white/40 backdrop-blur-2xl premium-shadow group">
              <div className="w-36 h-36 bg-white rounded-[3rem] flex items-center justify-center text-slate-200 mb-12 transition-all duration-1000 group-hover:rotate-[15deg] group-hover:scale-110 shadow-lg border border-white">
                <Icons.Shield />
              </div>
              <h3 className="text-4xl font-black text-slate-950 brand-font tracking-tight">等待素材輸入</h3>
              <p className="text-slate-600 max-w-sm mt-8 text-xl leading-relaxed font-bold">
                請在左側上傳區提供 FOOTER 廣告素材，AI 將為您分析 CI 合規性與行銷力。
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuditView;

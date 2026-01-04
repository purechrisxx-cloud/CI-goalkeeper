
import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  
  // 審核情境狀態
  const [assetIntent, setAssetIntent] = useState('');
  const [assetTargetAudience, setAssetTargetAudience] = useState(ci.targetAudience || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 取得當前專案組的前幾版紀錄
  const versionHistory = useMemo(() => {
    if (!currentGroupId) return [];
    return assets
      .filter(a => a.groupId === currentGroupId)
      .sort((a, b) => b.version - a.version)
      .slice(0, 4);
  }, [assets, currentGroupId]);

  const checkConnection = async () => {
    // 優先檢查 process.env.API_KEY
    const hasEnvKey = !!process.env.API_KEY && process.env.API_KEY !== "undefined" && process.env.API_KEY !== "";
    if (hasEnvKey) {
      setIsConnected(true);
      return;
    }

    // 備選：檢查 AI Studio Bridge
    const bridge = (window as any).aistudio;
    if (bridge?.hasSelectedApiKey) {
      try {
        const selected = await bridge.hasSelectedApiKey();
        setIsConnected(selected);
      } catch {
        setIsConnected(false);
      }
    }
  };

  useEffect(() => {
    checkConnection();
    const timer = setInterval(checkConnection, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleConnectAI = async () => {
    const bridge = (window as any).aistudio;
    if (bridge?.openSelectKey) {
      try { 
        await bridge.openSelectKey(); 
        setIsConnected(true); 
      } catch (err) { 
        console.error(err); 
      }
    } else {
      // 如果沒有 bridge 但有 ENV KEY，則直接視為已連結
      if (!!process.env.API_KEY) {
        setIsConnected(true);
      } else {
        alert("目前的環境未偵測到 API Key。系統將嘗試使用預設通道。");
        setIsConnected(true); // 嘗試讓使用者繼續，若失敗 geminiService 會拋出錯誤
      }
    }
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
      const auditResult = await auditAsset(
        file, 
        { ...ci, targetAudience: assetTargetAudience }, 
        assetIntent, 
        '團隊創意審核', 
        'gemini-3-flash-preview'
      );
      setResult(auditResult);
      
      const lastAsset = assets[0];
      const isIteration = lastAsset && (Date.now() - lastAsset.timestamp < 15 * 60 * 1000);
      const gid = isIteration ? lastAsset.groupId : Math.random().toString(36).substr(2, 9);
      setCurrentGroupId(gid);

      onAssetSave(file, `創意迭代 ${new Date().toLocaleTimeString()}`, auditResult, ci, gid);
    } catch (error: any) {
      // 處理 API Key 失效狀況
      if (error.message.includes("Requested entity was not found") || error.message.includes("403")) {
        const bridge = (window as any).aistudio;
        if (bridge?.openSelectKey) {
          alert("API 連結已失效，請點擊右上角重新連結 API Key。");
          await bridge.openSelectKey();
        } else {
          alert(`AI 服務異常：${error.message}`);
        }
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDeltaBadge = (current: number, prev: number) => {
    const diff = current - prev;
    if (diff === 0) return null;
    return (
      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${diff > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
        {diff > 0 ? '+' : ''}{diff}
      </span>
    );
  };

  const inputStyle = "w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-semibold text-slate-900";

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      <header className="relative flex flex-col items-center pt-10 pb-8">
        <div className="absolute top-0 right-0">
          {!isConnected ? (
            <button onClick={handleConnectAI} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95">
              <Icons.Zap /> 啟動 AI 輔助
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">AI Engine Active</span>
            </div>
          )}
        </div>
        <h1 className="text-5xl font-black brand-font tracking-tighter mt-12 mb-4">
          <span className="gradient-text">Creative Hub</span>
        </h1>
        <p className="text-slate-500 font-medium text-center">讓團隊在自由創意中，依然能精準對標品牌核心規範。</p>
      </header>

      {!result ? (
        <div className="flex flex-col items-center space-y-10">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 上傳與預覽 */}
            <div onClick={() => !loading && fileInputRef.current?.click()} className={`group w-full aspect-square rounded-[3rem] border-4 border-dashed transition-all duration-700 relative overflow-hidden flex items-center justify-center ${file ? 'border-indigo-400 bg-white shadow-3xl' : 'border-slate-200 bg-white/40 hover:bg-white cursor-pointer'}`}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
              {file ? (
                <div className="relative w-full h-full p-8">
                  <img src={file} className="w-full h-full object-contain" alt="Preview" />
                  <div className="comparison-scan"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6"><Icons.Upload /></div>
                  <p className="text-base font-black text-slate-900">拖曳或上傳創意素材</p>
                </div>
              )}
            </div>

            {/* 情境背景設定 */}
            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-sm space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-2">素材目的 (Asset Intent)</label>
                <textarea 
                  value={assetIntent}
                  onChange={(e) => setAssetIntent(e.target.value)}
                  placeholder="告訴 AI：這張圖是要用在什麼地方？(例如：IG 貼文、官網 Banner、新品活動...)"
                  className={`${inputStyle} h-32 resize-none`}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-2">目標受眾 (Target Audience)</label>
                <input 
                  type="text"
                  value={assetTargetAudience}
                  onChange={(e) => setAssetTargetAudience(e.target.value)}
                  placeholder="預設會對標品牌設定的受眾"
                  className={inputStyle}
                />
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-indigo-600">AI 教練提示：</strong> 設定具體的情境能讓建議更具「自由度」，AI 會判斷在該情境下，哪些 CI 規範可以被彈性調整。
                </p>
              </div>
            </div>
          </div>

          <button onClick={handleAudit} disabled={!file || loading} className={`px-16 py-5 rounded-full font-black tracking-[0.2em] transition-all flex items-center gap-4 ${!file || loading ? 'bg-slate-100 text-slate-300' : 'bg-slate-950 text-white hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 shadow-2xl'}`}>
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Icons.Zap />}
            {loading ? 'AI 教練正在閱讀品牌靈魂...' : '執行深度品牌審核'}
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-10">
          {/* 迭代歷程比對 */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-10 border border-white shadow-sm overflow-hidden">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 ml-2">Iteration Comparison</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {versionHistory.map((v, i) => (
                <div key={v.id} className={`group relative rounded-[2.5rem] overflow-hidden border-2 transition-all ${i === 0 ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-white opacity-60 hover:opacity-100'}`}>
                  <div className="aspect-[4/5] bg-slate-100">
                    <img src={v.url} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-white/60 uppercase">V{v.version}</p>
                        <p className="text-2xl font-black text-white brand-font">{v.auditResult?.overallScore}</p>
                      </div>
                      {i < versionHistory.length - 1 && v.auditResult && versionHistory[i+1].auditResult && (
                        renderDeltaBadge(v.auditResult.overallScore, versionHistory[i+1].auditResult!.overallScore)
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {versionHistory.length < 4 && Array(4 - versionHistory.length).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-slate-100/50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Wait for Iteration</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">CI Compliance</p>
                <div className="flex items-baseline gap-4 mb-10">
                  <h3 className="text-8xl font-black brand-font">{result.overallScore}</h3>
                  <span className="text-xl font-bold text-slate-500">/ 100</span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                    <span>Creative Energy</span>
                    <span className="text-indigo-400">{result.creativeEnergy}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${result.creativeEnergy}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                <h4 className="font-black text-slate-950 text-lg mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div> 品牌精神對標點評
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium italic">"{result.creativeCritique}"</p>
              </div>
            </div>

            <div className="xl:col-span-8">
              <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl h-full">
                <h3 className="text-2xl font-black text-slate-950 mb-12 brand-font">策略審核與優化路徑</h3>
                
                <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-8 items-center">
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">鎖定受眾</p>
                    <p className="text-sm font-bold text-slate-700">{assetTargetAudience || ci.targetAudience}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex-[2]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">創意目的</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{assetIntent || '通用品牌建立'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">規範符合度</h5>
                    {result.suggestions.compliance.map((s, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-[2rem] flex gap-5 border border-transparent hover:border-indigo-100 transition-all">
                        <span className="text-indigo-600 font-black brand-font text-lg">0{i+1}</span>
                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">創意迭代建議</h5>
                    {result.suggestions.creative.map((s, i) => (
                      <div key={i} className="p-6 bg-indigo-50/20 rounded-[2rem] flex gap-5 border border-transparent hover:border-indigo-200 transition-all">
                        <span className="text-indigo-500 font-black brand-font text-lg">★</span>
                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-16 pt-10 border-t border-slate-100 flex justify-between items-center">
                  <button onClick={() => { setResult(null); setFile(null); }} className="text-indigo-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-50 px-6 py-3 rounded-2xl transition-all">
                    重新開始分析
                  </button>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">FOOTER BrandGuard Laboratory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditView;

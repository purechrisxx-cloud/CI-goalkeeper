
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  
  const [assetIntent, setAssetIntent] = useState('');
  const [assetTargetAudience, setAssetTargetAudience] = useState(ci.targetAudience || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const versionHistory = useMemo(() => {
    if (!currentGroupId) return [];
    return assets
      .filter(a => a.groupId === currentGroupId)
      .sort((a, b) => b.version - a.version)
      .slice(0, 4);
  }, [assets, currentGroupId]);

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
        '團隊內部創意審核', 
        'gemini-3-flash-preview'
      );
      
      setResult(auditResult);
      
      const lastAsset = assets[0];
      const isIteration = lastAsset && (Date.now() - lastAsset.timestamp < 15 * 60 * 1000);
      const gid = isIteration ? lastAsset.groupId : Math.random().toString(36).substr(2, 9);
      setCurrentGroupId(gid);

      onAssetSave(file, `創意迭代 ${new Date().toLocaleTimeString()}`, auditResult, ci, gid);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-semibold text-slate-900";

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      <header className="relative flex flex-col items-center pt-10 pb-8">
        <div className="absolute top-0 right-0">
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">
              AI Engine Ready
            </span>
          </div>
        </div>
        <h1 className="text-5xl font-black brand-font tracking-tighter mt-12 mb-4">
          <span className="gradient-text">Creative Hub</span>
        </h1>
        <p className="text-slate-500 font-medium text-center">在此輸入創意素材，AI 教練將針對品牌規範給予深度建議。</p>
      </header>

      {!result ? (
        <div className="flex flex-col items-center space-y-10 animate-in fade-in duration-700">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div onClick={() => !loading && fileInputRef.current?.click()} className={`group w-full aspect-square rounded-[3rem] border-4 border-dashed transition-all duration-700 relative overflow-hidden flex items-center justify-center ${file ? 'border-indigo-400 bg-white shadow-2xl' : 'border-slate-200 bg-white/40 hover:bg-white cursor-pointer'}`}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
              {file ? (
                <div className="relative w-full h-full p-8">
                  <img src={file} className="w-full h-full object-contain" alt="Preview" />
                  <div className="comparison-scan"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6"><Icons.Upload /></div>
                  <p className="text-base font-black text-slate-900">點擊上傳創意素材</p>
                </div>
              )}
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-sm space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-2">素材目的與情境</label>
                <textarea 
                  value={assetIntent}
                  onChange={(e) => setAssetIntent(e.target.value)}
                  placeholder="例如：母親節專案、IG 限時動態、官網 Banner 優化..."
                  className={`${inputStyle} h-32 resize-none`}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-2">目標受眾 (預設對標 CI)</label>
                <input 
                  type="text"
                  value={assetTargetAudience}
                  onChange={(e) => setAssetTargetAudience(e.target.value)}
                  placeholder="輸入本次針對的特定族群"
                  className={inputStyle}
                />
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[11px] text-slate-400 italic leading-relaxed font-bold">
                  AI 提示：設定具體的目的能幫助 AI 提供更具建設性的建議。
                </p>
              </div>
            </div>
          </div>

          <button onClick={handleAudit} disabled={!file || loading} className={`px-16 py-5 rounded-full font-black tracking-[0.2em] transition-all flex items-center gap-4 ${!file || loading ? 'bg-slate-100 text-slate-300' : 'bg-slate-950 text-white hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 shadow-2xl'}`}>
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Icons.Zap />}
            {loading ? 'AI 教練正在審閱...' : '啟動品牌深度分析'}
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-10">
          <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-10 border border-white shadow-sm overflow-hidden">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 ml-2">Creative Evolution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {versionHistory.map((v, i) => (
                <div key={v.id} className={`group relative rounded-[2.5rem] overflow-hidden border-2 transition-all ${i === 0 ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-white opacity-60 hover:opacity-100'}`}>
                  <div className="aspect-[4/5] bg-slate-100">
                    <img src={v.url} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent flex flex-col justify-end p-6">
                    <p className="text-[10px] font-black text-white/60 uppercase">Version {v.version}</p>
                    <p className="text-2xl font-black text-white brand-font">{v.auditResult?.overallScore}</p>
                  </div>
                </div>
              ))}
              {versionHistory.length < 4 && Array(4 - versionHistory.length).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-slate-100/50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Next Iteration</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">CI Compliance Index</p>
                <div className="flex items-baseline gap-4 mb-10">
                  <h3 className="text-8xl font-black brand-font">{result.overallScore}</h3>
                  <span className="text-xl font-bold text-slate-500">/ 100</span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                    <span>Creative Potential</span>
                    <span className="text-indigo-400">{result.creativeEnergy}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${result.creativeEnergy}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                <h4 className="font-black text-slate-950 text-lg mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div> 教練式建議 (Coaching)
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium italic">"{result.creativeCritique}"</p>
              </div>
            </div>

            <div className="xl:col-span-8">
              <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl h-full">
                <h3 className="text-2xl font-black text-slate-950 mb-12 brand-font">分析報告與優化建議</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">合規性檢查</h5>
                    {result.suggestions.compliance.map((s, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-[2rem] flex gap-5 border border-transparent hover:border-indigo-100 transition-all">
                        <span className="text-indigo-600 font-black brand-font text-lg">0{i+1}</span>
                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">創意迭代方向</h5>
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
                    重新分析新素材
                  </button>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">BrandGuard Laboratory</p>
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

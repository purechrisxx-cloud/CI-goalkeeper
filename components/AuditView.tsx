
import React, { useState, useRef, useEffect } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const hasEnvKey = !!process.env.API_KEY && process.env.API_KEY !== "undefined";
      const bridge = (window as any).aistudio;
      if (bridge?.hasSelectedApiKey) {
        const selected = await bridge.hasSelectedApiKey();
        setIsConnected(hasEnvKey || selected);
      } else {
        setIsConnected(hasEnvKey);
      }
    };
    checkConnection();
  }, []);

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
      const auditResult = await auditAsset(file, ci, '', '', 'gemini-3-flash-preview');
      setResult(auditResult);
      onAssetSave(file, `創意審核 ${new Date().toLocaleTimeString()}`, auditResult, ci);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black brand-font tracking-tighter">
          <span className="gradient-text">Creative Hub</span>
        </h1>
        <p className="text-slate-500 font-medium text-lg">讓 AI 成為您的創意夥伴，在守護品牌核心的同時釋放靈感。</p>
      </header>

      {!result ? (
        <div className="flex flex-col items-center">
          <div 
            onClick={() => !loading && fileInputRef.current?.click()} 
            className={`w-full max-w-2xl aspect-[16/9] rounded-[3rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${file ? 'border-indigo-400 bg-white shadow-2xl scale-105' : 'border-slate-200 hover:border-indigo-300 bg-white/50'}`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
            {file ? (
              <img src={file} className="w-full h-full object-contain p-8 animate-in fade-in duration-500" alt="Preview" />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><Icons.Upload /></div>
                <p className="text-lg font-black text-slate-900 tracking-tight">拖曳或點擊上傳創意素材</p>
                <p className="text-slate-400 text-sm mt-2 font-medium">支援 JPG, PNG, WebP</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAudit} 
            disabled={!file || loading}
            className={`mt-10 px-12 py-5 rounded-full font-black text-lg tracking-widest transition-all flex items-center gap-4 ${!file || loading ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-950 text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95'}`}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Icons.Zap />}
            {loading ? 'AI 分析中...' : '開始創意審核'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* 左側：分析儀表板 */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Overall Score</p>
                  <h3 className="text-6xl font-black brand-font">{result.overallScore}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Status</p>
                  <span className="px-4 py-1.5 rounded-full bg-white/10 text-[11px] font-black uppercase tracking-wider">{result.healthStatus}</span>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                    <span>創意能量 Creative Energy</span>
                    <span className="text-indigo-400">{result.creativeEnergy}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-right from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${result.creativeEnergy}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                    <span>視覺衝擊 Visual Impact</span>
                    <span className="text-purple-400">{result.visualImpact}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-right from-purple-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${result.visualImpact}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-6">
              <h4 className="font-black text-slate-900 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> 教練總結
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">"{result.creativeCritique}"</p>
            </div>
          </div>

          {/* 右側：詳細建議 */}
          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl">
               <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3"><Icons.Check /></div>
                  <h3 className="text-3xl font-black brand-font tracking-tight text-slate-900">審核報告與優化路徑</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">品牌契合度調整 (CI Compliance)</h5>
                    <div className="space-y-3">
                      {result.suggestions.compliance.map((s, i) => (
                        <div key={i} className="group p-5 bg-slate-50 rounded-2xl border border-slate-50 hover:bg-white hover:shadow-lg transition-all flex gap-5">
                          <span className="text-indigo-600 font-black brand-font">0{i+1}</span>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-2">創意爆發力建議 (Creative Spark)</h5>
                    <div className="space-y-3">
                      {result.suggestions.creative.map((s, i) => (
                        <div key={i} className="group p-5 bg-indigo-50/30 rounded-2xl border border-indigo-50/20 hover:bg-white hover:shadow-lg transition-all flex gap-5">
                          <span className="text-indigo-500 font-black brand-font">#</span>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-center">
                  <button onClick={() => setResult(null)} className="text-slate-400 hover:text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Icons.Plus /> 重新開始審核
                  </button>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Powered by Gemini 3 Pro</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditView;

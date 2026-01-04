
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { BrandCI, AuditResult, Asset } from '../types';
import { auditAsset } from '../services/geminiService';
import { Icons } from '../constants';

interface AuditViewProps {
  ci: BrandCI;
  onAssetSave: (url: string, name: string, result: AuditResult, snapshot: BrandCI, groupId?: string, version?: number) => void;
  assets: Asset[];
}

const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Flash', desc: '適合免費版：極速、高配額', status: 'Recommended' },
  { id: 'gemini-3-pro-preview', name: 'Pro', desc: '深度推理：較精準但配額有限', status: 'Expert' },
  { id: 'gemini-flash-lite-latest', name: 'Lite', desc: '節能模式：基礎檢查', status: 'Economical' }
];

const AuditView: React.FC<AuditViewProps> = ({ ci, onAssetSave, assets }) => {
  const [file, setFile] = useState<string | null>(null);
  const [intent, setIntent] = useState('');
  const [campaignContext, setCampaignContext] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isConnected, setIsConnected] = useState(false);
  const [hasBridge, setHasBridge] = useState(false);
  
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化時檢查金鑰狀態
  useEffect(() => {
    const checkConnection = async () => {
      // 1. 檢查是否有環境變數金鑰 (Vercel 設定)
      const hasEnvKey = !!process.env.API_KEY && process.env.API_KEY !== "undefined";
      
      // 2. 檢查是否有 Google AI Studio 橋接器
      const bridge = (window as any).aistudio;
      const hasBridgeAvailable = !!bridge?.hasSelectedApiKey;
      setHasBridge(hasBridgeAvailable);

      if (hasBridgeAvailable) {
        const selected = await bridge.hasSelectedApiKey();
        setIsConnected(hasEnvKey || selected);
      } else {
        setIsConnected(hasEnvKey);
      }
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    if (hasBridge) {
      await (window as any).aistudio.openSelectKey();
      setIsConnected(true);
    } else {
      // 如果沒有橋接器，說明是標準 Vercel 環境，提示使用者金鑰已由系統代管
      if (isConnected) {
        alert("系統目前使用預設 API 金鑰運作中。");
      } else {
        alert("未偵測到 API 金鑰。請在 Vercel Settings 中設定 API_KEY 環境變數。");
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
    if (!isConnected) {
      alert("尚未建立 AI 連線，請檢查 API 設定。");
      return;
    }
    
    setLoading(true);
    try {
      const auditResult = await auditAsset(file, ci, intent, campaignContext, selectedModel);
      setResult(auditResult);
      
      const groupId = currentGroupId || Math.random().toString(36).substr(2, 9);
      if (!currentGroupId) setCurrentGroupId(groupId);
      onAssetSave(file, `素材 v${currentVersion}`, auditResult, ci, groupId, currentVersion);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${isConnected ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-200 text-slate-500'}`}>
              {isConnected ? '系統已就緒' : '未連線'}
            </span>
            <span className="text-[11px] font-bold text-slate-400">/ 支援 Gemini 2.5 & 3 Pro 模型</span>
          </div>
          <h1 className="text-4xl font-black brand-font tracking-tight">AI 創意實驗室</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`px-5 py-2.5 rounded-lg text-[11px] font-black transition-all ${selectedModel === m.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {m.name}
              </button>
            ))}
          </div>
          
          {/* 只有在支援橋接器的環境下才顯示切換按鈕，否則顯示狀態標籤 */}
          {hasBridge ? (
            <button 
              onClick={handleConnect}
              className="px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
            >
              <Icons.Shield />
              切換 AI 帳戶
            </button>
          ) : (
            <div className="px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest bg-slate-900 text-white flex items-center gap-2">
              <Icons.Check />
              Cloud API 已啟動
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <aside className="xl:col-span-4">
          <div className="premium-card rounded-[2.5rem] p-8 space-y-8 premium-shadow">
            <div 
              onClick={() => !loading && fileInputRef.current?.click()} 
              className={`relative aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300 bg-white/50'}`}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} disabled={loading} />
              {file ? (
                <img src={file} className="w-full h-full object-contain p-4 rounded-[2rem]" alt="Preview" />
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm"><Icons.Upload /></div>
                  <p className="text-[11px] font-black uppercase text-slate-900 tracking-widest">點擊上傳素材</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">模型特性</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{MODELS.find(m => m.id === selectedModel)?.desc}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">活動背景 (可選)</label>
                <textarea 
                  value={campaignContext} 
                  onChange={e => setCampaignContext(e.target.value)}
                  className="w-full p-4 bg-white rounded-xl border border-slate-200 text-xs h-24 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                  placeholder="例如：夏季涼感週廣告..."
                />
              </div>
            </div>

            <button 
              onClick={handleAudit} 
              disabled={!file || loading}
              className={`w-full py-5 rounded-2xl font-black text-[13px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 ${!file || loading ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white shadow-xl hover:bg-black'}`}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> 正在思考中...</>
              ) : (
                <><Icons.Check /> 開始 AI 審核</>
              )}
            </button>
          </div>
        </aside>

        <main className="xl:col-span-8">
          {result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black brand-font tracking-tight">AI 審核報告</h3>
                  <div className="bg-white/10 px-4 py-2 rounded-lg text-lg font-black brand-font">{result.overallScore} / 100</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-video bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                    <img src={file!} className="w-full h-full object-contain" alt="Current" />
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    <p className="text-2xl font-black brand-font text-indigo-400">{result.healthStatus}</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">"{result.marketingCritique}"</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> CI 優化建議</h4>
                  <div className="space-y-3">
                    {result.suggestions.compliance.map((s, i) => (
                      <div key={i} className="text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-50 flex gap-3">
                        <span className="text-indigo-600">0{i+1}</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> 創意加分點</h4>
                  <div className="space-y-3">
                    {result.suggestions.creative.map((s, i) => (
                      <div key={i} className="text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-50 flex gap-3">
                        <span className="text-indigo-600">#</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 bg-white/30">
              <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-100 mb-6 shadow-sm"><Icons.Compass /></div>
              <h3 className="text-2xl font-black text-slate-900 brand-font">等待分析指令</h3>
              <p className="text-slate-400 text-sm font-bold mt-4 max-w-xs">請上傳圖片並點擊按鈕啟動審核功能。</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuditView;

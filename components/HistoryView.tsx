
import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { Icons } from '../constants';

interface HistoryViewProps {
  assets: Asset[];
  onDeleteAsset: (id: string) => void;
  onClearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ assets, onDeleteAsset, onClearHistory }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [versionIndex, setVersionIndex] = useState<number>(0);

  const groupedAssets = useMemo(() => {
    const groups: Record<string, Asset[]> = {};
    assets.forEach(asset => {
      if (!groups[asset.groupId]) groups[asset.groupId] = [];
      groups[asset.groupId].push(asset);
    });
    Object.values(groups).forEach(group => group.sort((a, b) => a.version - b.version));
    return Object.values(groups).sort((a, b) => b[b.length - 1].timestamp - a[a.length - 1].timestamp);
  }, [assets]);

  const currentGroup = useMemo(() => {
    return groupedAssets.find(g => g[0].groupId === selectedGroupId) || null;
  }, [groupedAssets, selectedGroupId]);

  const activeAsset = currentGroup ? currentGroup[versionIndex] : null;

  return (
    <div className="max-w-6xl mx-auto pb-32">
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10 animate-in fade-in duration-1000">
        <div>
          <h1 className="text-6xl font-black brand-font tracking-tighter">
            <span className="gradient-text">Archive Studio</span>
          </h1>
          <p className="text-slate-600 mt-5 text-xl font-medium max-w-lg">
            管理與檢視 FOOTER 所有素材的迭代歷程。
          </p>
        </div>
        <div className="flex items-center gap-10 border-l border-slate-200 pl-10">
          <div className="text-right">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total Collections</p>
            <p className="text-5xl font-black text-indigo-600 brand-font">{groupedAssets.length}</p>
          </div>
          <button onClick={onClearHistory} className="text-slate-400 hover:text-rose-500 text-[11px] font-black uppercase tracking-[0.2em] transition-colors py-3 border-b border-transparent hover:border-rose-200">Clear All</button>
        </div>
      </header>

      {groupedAssets.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] p-40 text-center border border-white/50 premium-shadow">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-10 shadow-sm"><Icons.Compass /></div>
          <p className="text-slate-400 text-2xl font-black brand-font tracking-tight uppercase opacity-50">Library Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {groupedAssets.map((group) => {
            const lastVersion = group[group.length - 1];
            return (
              <div key={group[0].groupId} className="group premium-card rounded-[3.5rem] overflow-hidden flex flex-col premium-shadow border-none">
                <div className="aspect-[4/5] bg-slate-100 overflow-hidden relative">
                  <img src={lastVersion.url} alt={lastVersion.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out" />
                  
                  <div className="absolute top-8 left-8 flex gap-3">
                    <span className="bg-slate-950 text-white text-[10px] font-black px-5 py-2 rounded-full shadow-2xl uppercase tracking-widest">
                      V{lastVersion.version}
                    </span>
                    {group.length > 1 && (
                      <span className="bg-white text-slate-950 text-[10px] font-black px-5 py-2 rounded-full shadow-xl border border-slate-50 uppercase tracking-widest">
                        {group.length} Iterations
                      </span>
                    )}
                  </div>

                  {lastVersion.auditResult && (
                    <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-[1.25rem] shadow-xl border border-white">
                      <span className="text-xl font-black brand-font text-slate-950">{lastVersion.auditResult.overallScore}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col items-center justify-center gap-6 px-12 text-center">
                    <p className="text-white font-black brand-font text-xl tracking-tight translate-y-6 group-hover:translate-y-0 transition-transform duration-700">{lastVersion.name}</p>
                    <button 
                      onClick={() => { setSelectedGroupId(group[0].groupId); setVersionIndex(group.length - 1); }}
                      className="bg-white text-slate-950 px-10 py-4 rounded-full text-[11px] font-black shadow-2xl hover:scale-105 transition-all translate-y-6 group-hover:translate-y-0 transition-transform duration-700 delay-100 uppercase tracking-widest"
                    >
                      Inspect Data
                    </button>
                    <button 
                      onClick={() => { if(confirm('移除此系列？')) group.forEach(a => onDeleteAsset(a.id)); }}
                      className="text-white/40 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-colors mt-6"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeAsset && currentGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 md:p-14 bg-slate-950/40 backdrop-blur-2xl animate-in fade-in duration-700">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative border border-white/20">
            
            <div className="px-14 py-12 border-b border-slate-50 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-slate-950 text-white rounded-[1.75rem] flex items-center justify-center text-2xl font-black shadow-2xl brand-font">
                  V{activeAsset.version}
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-950 brand-font tracking-tighter">Project Evolution</h2>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Archive Intelligence / {currentGroup.length} Snapshots</p>
                </div>
              </div>
              <button onClick={() => setSelectedGroupId(null)} className="text-slate-300 hover:text-slate-950 transition-all p-4 hover:bg-slate-50 rounded-full">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-14 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-10">
                  <div className="aspect-[4/5] bg-slate-50 rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-100">
                    <img src={activeAsset.url} className="w-full h-full object-contain" alt={`Version ${activeAsset.version}`} />
                  </div>
                  
                  <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-8 px-2">Navigation</p>
                    <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
                      {currentGroup.map((g, idx) => (
                        <button
                          key={g.id}
                          onClick={() => setVersionIndex(idx)}
                          className={`shrink-0 w-16 h-16 rounded-[1.5rem] font-black transition-all duration-500 flex items-center justify-center brand-font text-lg ${
                            versionIndex === idx 
                              ? 'bg-indigo-600 text-white scale-110 shadow-[0_10px_30px_rgba(79,70,229,0.4)]' 
                              : 'bg-white/5 text-slate-600 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          V{g.version}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="bg-slate-50/50 p-10 rounded-[3rem] text-center border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">CI Index</p>
                      <p className="text-6xl font-black text-slate-950 brand-font">{activeAsset.auditResult?.overallScore}</p>
                    </div>
                    <div className="bg-indigo-50/30 p-10 rounded-[3rem] text-center border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Market</p>
                      <p className="text-6xl font-black text-indigo-600 brand-font">{activeAsset.auditResult?.audienceResonance}</p>
                    </div>
                    <div className="bg-slate-950 p-10 rounded-[3rem] text-center shadow-xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Trend</p>
                      <p className="text-6xl font-black text-white brand-font">{activeAsset.auditResult?.trendRelevance}</p>
                    </div>
                  </div>

                  <div className="space-y-8 bg-slate-50/50 p-12 rounded-[3.5rem] border border-slate-100">
                     <h4 className="font-black text-slate-950 flex items-center gap-4 text-xl brand-font tracking-tight">
                       <div className="w-2.5 h-8 bg-indigo-600 rounded-full"></div> Analysis Result
                     </h4>
                     <p className="text-slate-700 leading-relaxed italic text-xl font-medium opacity-80">"{activeAsset.auditResult?.marketingCritique}"</p>
                  </div>

                  <div className="space-y-6">
                     <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-4">Strategic Steps</h5>
                     <div className="grid grid-cols-1 gap-5">
                        {activeAsset.auditResult?.suggestions.compliance.concat(activeAsset.auditResult?.suggestions.creative).slice(0, 3).map((s, i) => (
                          <div key={i} className="text-[15px] text-slate-600 bg-white p-7 rounded-[2rem] border border-slate-100 flex gap-6 shadow-sm hover:shadow-md transition-all">
                            <span className="text-indigo-600 font-black brand-font text-lg">0{i+1}</span>
                            <span className="font-semibold leading-relaxed">{s}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;

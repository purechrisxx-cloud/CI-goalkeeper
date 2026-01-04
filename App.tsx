import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AuditView from './components/AuditView';
import GuidelinesView from './components/GuidelinesView';
import HistoryView from './components/HistoryView';
import { BrandCI, Asset, AuditResult } from './types';
import { DEFAULT_CI } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'guidelines' | 'history'>('audit');
  const [profiles, setProfiles] = useState<BrandCI[]>([DEFAULT_CI]);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_CI.id);
  const [assets, setAssets] = useState<Asset[]>([]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    try {
      const savedProfiles = localStorage.getItem('brand_profiles_v2');
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
      const savedActiveId = localStorage.getItem('brand_active_id');
      if (savedActiveId) setActiveProfileId(savedActiveId);
      const savedAssets = localStorage.getItem('brand_assets_v2');
      if (savedAssets) setAssets(JSON.parse(savedAssets));
    } catch (e) {
      console.error('Failed to load storage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('brand_profiles_v2', JSON.stringify(profiles));
    } catch (e) {}
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem('brand_active_id', activeProfileId);
    } catch (e) {}
  }, [activeProfileId]);

  useEffect(() => {
    try {
      const limitedAssets = assets.slice(0, 30);
      localStorage.setItem('brand_assets_v2', JSON.stringify(limitedAssets));
    } catch (e) {
      const emergencyCleanup = assets.slice(0, 10);
      setAssets(emergencyCleanup);
    }
  }, [assets]);

  const handleAssetSave = (url: string, name: string, result: AuditResult, snapshot: BrandCI, groupId?: string, version?: number) => {
    const { history, ...cleanSnapshot } = snapshot;
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      groupId: groupId || Math.random().toString(36).substr(2, 9),
      version: version || 1,
      url,
      name,
      timestamp: Date.now(),
      auditResult: result,
      ciSnapshot: cleanSnapshot
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const handleUpdateActiveProfile = (updated: BrandCI) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleSaveSnapshot = (id: string) => {
    setProfiles(prev => prev.map(p => {
      if (p.id !== id) return p;
      const { history = [], ...currentData } = p;
      const newHistoryItem = {
        timestamp: Date.now(),
        data: { ...currentData, updatedAt: Date.now() }
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 5);
      return { ...p, history: updatedHistory };
    }));
  };

  const handleRestoreSnapshot = (profileId: string, timestamp: number) => {
    setProfiles(prev => prev.map(p => {
      if (p.id !== profileId || !p.history) return p;
      const snapshot = p.history.find(h => h.timestamp === timestamp);
      if (!snapshot) return p;
      return { ...p, ...snapshot.data, history: p.history };
    }));
  };

  const handleAddProfile = () => {
    const newProfile: BrandCI = {
      ...DEFAULT_CI,
      id: Math.random().toString(36).substr(2, 9),
      name: `新品牌檔案 ${profiles.length + 1}`,
      history: []
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleImportProfile = (importedProfile: BrandCI) => {
    const newProfile = { ...importedProfile, id: Math.random().toString(36).substr(2, 9), history: [] };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    if (activeProfileId === id) setActiveProfileId(newProfiles[0].id);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm('確定要清空所有紀錄嗎？')) {
      setAssets([]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} activeProfileName={activeProfile.name} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-14 relative selection:bg-indigo-100 selection:text-indigo-900 content-gradient-bg">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'audit' && <AuditView ci={activeProfile} onAssetSave={handleAssetSave} assets={assets} />}
          {activeTab === 'guidelines' && (
            <GuidelinesView 
              profiles={profiles} activeProfileId={activeProfileId} setActiveProfileId={setActiveProfileId}
              updateProfile={handleUpdateActiveProfile} addProfile={handleAddProfile} importProfile={handleImportProfile}
              deleteProfile={handleDeleteProfile} saveSnapshot={handleSaveSnapshot} restoreSnapshot={handleRestoreSnapshot}
            />
          )}
          {activeTab === 'history' && <HistoryView assets={assets} onDeleteAsset={handleDeleteAsset} onClearHistory={handleClearHistory} />}
        </div>
      </main>
    </div>
  );
};

export default App;
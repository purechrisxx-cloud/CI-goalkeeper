
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AuditView from './components/AuditView';
import GuidelinesView from './components/GuidelinesView';
import HistoryView from './components/HistoryView';
import LoginView from './components/LoginView';
import { BrandCI, Asset, AuditResult, User } from './types';
import { DEFAULT_CI } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'guidelines' | 'history'>('audit');
  const [profiles, setProfiles] = useState<BrandCI[]>([DEFAULT_CI]);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_CI.id);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const handleLogin = (response: any) => {
    const base64Url = response.credential.split('.')[1];
    const payload = JSON.parse(atob(base64Url));
    const userData = { id: payload.sub, name: payload.name, email: payload.email, picture: payload.picture };
    setUser(userData);
    localStorage.setItem('footer_user', JSON.stringify(userData));
  };

  const handleGuestLogin = () => {
    const guestUser: User = { id: 'guest-' + Date.now(), name: 'FOOTER Team Member', email: 'team@footer.com', picture: 'https://ui-avatars.com/api/?name=F&background=4f46e5&color=fff' };
    setUser(guestUser);
    localStorage.setItem('footer_user', JSON.stringify(guestUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('footer_user');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('footer_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    try {
      const savedProfiles = localStorage.getItem('brand_profiles_v2');
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
      
      const savedAssets = localStorage.getItem('brand_assets_v2');
      if (savedAssets) setAssets(JSON.parse(savedAssets));
    } catch (e) {
      console.warn('載入歷史紀錄失敗，可能資料已損壞。');
    }
  }, []);

  // 專門處理存儲的 Effect，包含 Quota 檢查
  useEffect(() => {
    if (!user) return;

    const saveToLocalStorage = () => {
      try {
        localStorage.setItem('brand_profiles_v2', JSON.stringify(profiles));
        
        // 為了避免 QuotaExceededError，我們限制儲存的資產數量
        // 由於圖片是 Base64，體積龐大，localStorage 只有 5MB
        // 我們優先保留最新的 10-15 個資產
        const maxAssetsToStore = 12; 
        const limitedAssets = assets.slice(0, maxAssetsToStore);
        localStorage.setItem('brand_assets_v2', JSON.stringify(limitedAssets));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('LocalStorage 空間不足，自動清理舊資產。');
          // 如果還是爆掉，嘗試只存 5 個
          if (assets.length > 5) {
            setAssets(prev => prev.slice(0, 5));
          }
        }
      }
    };

    saveToLocalStorage();
  }, [profiles, assets, user]);

  const handleAssetSave = (url: string, name: string, result: AuditResult, snapshot: BrandCI, groupId?: string) => {
    const { history, ...cleanSnapshot } = snapshot;
    
    // 找出同一個 Group 的最後一個資產來決定版本號
    const assetsInGroup = assets.filter(a => a.groupId === groupId);
    const version = assetsInGroup.length > 0 
      ? Math.max(...assetsInGroup.map(a => a.version)) + 1 
      : 1;

    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      groupId: groupId || Math.random().toString(36).substr(2, 9),
      version,
      url,
      name: assetsInGroup.length > 0 ? `${name.split(' (V')[0]} (V${version})` : name,
      timestamp: Date.now(),
      auditResult: result,
      ciSnapshot: cleanSnapshot
    };

    setAssets(prev => [newAsset, ...prev]);
  };

  const handleUpdateActiveProfile = (updated: BrandCI) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-700 bg-slate-50">
      {!user ? (
        <LoginView onLogin={handleLogin} onGuestLogin={handleGuestLogin} />
      ) : (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} activeProfileName={activeProfile.name} user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-8 lg:p-14 content-gradient-bg">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'audit' && <AuditView ci={activeProfile} onAssetSave={handleAssetSave} assets={assets} />}
              {activeTab === 'guidelines' && (
                <GuidelinesView 
                  profiles={profiles} activeProfileId={activeProfileId} setActiveProfileId={setActiveProfileId}
                  updateProfile={handleUpdateActiveProfile} 
                  addProfile={() => {
                    const newProfile = { ...DEFAULT_CI, id: Math.random().toString(36).substr(2, 9), name: `新品牌檔案 ${profiles.length + 1}` };
                    setProfiles([...profiles, newProfile]);
                    setActiveProfileId(newProfile.id);
                  }} 
                  importProfile={(p) => {
                    const newP = { ...p, id: Math.random().toString(36).substr(2, 9) };
                    setProfiles([...profiles, newP]);
                    setActiveProfileId(newP.id);
                  }}
                  deleteProfile={(id) => {
                    if (profiles.length > 1) {
                      const filtered = profiles.filter(p => p.id !== id);
                      setProfiles(filtered);
                      if (activeProfileId === id) setActiveProfileId(filtered[0].id);
                    }
                  }} 
                  saveSnapshot={(id) => {
                    setProfiles(prev => prev.map(p => {
                      if (p.id !== id) return p;
                      const { history = [], ...data } = p;
                      return { ...p, history: [{ timestamp: Date.now(), data }, ...history].slice(0, 5) };
                    }));
                  }} 
                  restoreSnapshot={(id, ts) => {
                    setProfiles(prev => prev.map(p => {
                      if (p.id !== id) return p;
                      const snap = p.history?.find(h => h.timestamp === ts);
                      return snap ? { ...p, ...snap.data, history: p.history } : p;
                    }));
                  }}
                />
              )}
              {activeTab === 'history' && <HistoryView assets={assets} onDeleteAsset={(id) => setAssets(prev => prev.filter(a => a.id !== id))} onClearHistory={() => setAssets([])} />}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;

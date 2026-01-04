
import React, { useEffect, useRef, useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (response: any) => void;
  onGuestLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuestLogin }) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    const interval = setInterval(() => {
      if ((window as any).google) {
        clearInterval(interval);
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: onLogin,
            auto_select: true
          });
          (window as any).google.accounts.id.renderButton(
            googleBtnRef.current,
            { theme: 'outline', size: 'large', shape: 'pill', width: 280 }
          );
        } catch (e) {
          console.error("Google Auth Init Error:", e);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onLogin]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-8 overflow-hidden">
      {/* 背景裝飾光影 */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-md w-full text-center relative z-10 space-y-12 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-950 font-black brand-font text-4xl shadow-2xl mx-auto">F</div>
          <h1 className="text-4xl font-black text-white brand-font tracking-tighter">FOOTER <span className="text-indigo-500">BrandGuard</span></h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            專為 FOOTER 創意團隊打造的 AI 品牌守護系統。
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 bg-white/5 p-10 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div ref={googleBtnRef} className="min-h-[44px]"></div>
          
          <div className="relative w-full flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <button 
            onClick={onGuestLogin}
            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-black transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            團隊快速存取
          </button>

          <div className="pt-2">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold underline decoration-dotted"
            >
              為什麼 Google 登入出現錯誤？
            </button>
            {showHelp && (
              <div className="mt-4 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[10px] text-slate-300 text-left leading-relaxed animate-in slide-in-from-top-2">
                <strong>解決方案：</strong><br/>
                1. 這是因為目前的網址尚未在 Google Cloud 控制台獲授權。<br/>
                2. 請至 Google Cloud Console 您的專案中。<br/>
                3. 在「API 和服務 > 憑證」將此網址加入「已授權的 JavaScript 來源」。<br/>
                4. 或是在 Vercel 設定 <code>GOOGLE_CLIENT_ID</code> 環境變數。
              </div>
            )}
          </div>
        </div>

        <div className="pt-8">
            <p className="text-slate-600 text-[11px] font-bold">© 2025 FOOTER. Creative & Functional Wear.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

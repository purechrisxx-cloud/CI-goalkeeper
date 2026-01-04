
import React, { useEffect, useRef, useState } from 'react';

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
            { theme: 'outline', size: 'large', shape: 'pill', width: 320 }
          );
        } catch (e) { console.error("Google Auth Error", e); }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onLogin]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-8 overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-lg w-full text-center relative z-10 space-y-12 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-950 font-black brand-font text-5xl shadow-2xl mx-auto rotate-3">F</div>
          <h1 className="text-5xl font-black text-white brand-font tracking-tighter">FOOTER <span className="text-indigo-500">BrandGuard</span></h1>
          <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto leading-relaxed">
            AI 品牌守護與創意實驗室
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div ref={googleBtnRef} className="min-h-[50px]"></div>
            
            <div className="flex items-center gap-4 w-full px-10">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-[10px] font-black text-slate-500 tracking-[0.3em]">OR</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <button 
              onClick={onGuestLogin}
              className="w-full max-w-[320px] py-5 bg-white text-slate-950 hover:bg-indigo-50 rounded-full text-sm font-black transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              團隊快速存取 (Instant Access)
            </button>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-[11px] text-slate-500 hover:text-indigo-400 font-bold transition-colors"
            >
              遇到「授權錯誤」嗎？點擊查看解決方法
            </button>
            {showHelp && (
              <div className="mt-6 p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-[11px] text-slate-300 text-left leading-relaxed space-y-3 animate-in slide-in-from-top-4">
                <p><strong>原因：</strong> 您的 Vercel 網址尚未在 Google Cloud 控制台完成授權。</p>
                <p><strong>快速解決：</strong></p>
                <ul className="list-disc ml-5 space-y-2 text-slate-400">
                  <li>請直接使用「團隊快速存取」按鈕進入系統。</li>
                  <li>若您是管理員，請將目前網址加入 Google Cloud Console 的「已授權的 JavaScript 來源」。</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-600 text-xs font-bold tracking-widest uppercase opacity-50">© 2025 FOOTER Creative Wear.</p>
      </div>
    </div>
  );
};

export default LoginView;

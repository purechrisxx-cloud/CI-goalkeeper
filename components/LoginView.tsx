
import React, { useEffect, useRef, useState } from 'react';

interface LoginViewProps {
  onLogin: (response: any) => void;
  onGuestLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuestLogin }) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [googleInitError, setGoogleInitError] = useState(false);

  useEffect(() => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === "") {
        setGoogleInitError(true);
        return;
    }

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
        } catch (e) { 
            console.error("Google Auth Error", e); 
            setGoogleInitError(true);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onLogin]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-8 overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-lg w-full text-center relative z-10 space-y-12 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-950 font-black brand-font text-5xl shadow-[0_20px_50px_rgba(255,255,255,0.2)] mx-auto rotate-3">F</div>
          <h1 className="text-6xl font-black text-white brand-font tracking-tighter">
            FOOTER <span className="text-indigo-500">BrandGuard</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto leading-relaxed opacity-80">
            跨設備同步、AI 審核、創意加乘
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10">
          <div className="flex flex-col items-center gap-8">
            <button 
              onClick={onGuestLogin}
              className="group relative w-full max-w-[340px] py-5 bg-white text-slate-950 rounded-full text-base font-black transition-all flex items-center justify-center gap-4 shadow-[0_15px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              團隊快速進入系統
            </button>
            
            <p className="text-[11px] text-slate-500 font-bold px-8">
              ※ 使用不同電腦時，請點擊「同步分享碼」以載入規範。
            </p>

            <div className="flex items-center gap-6 w-full px-12">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] font-black text-slate-600 tracking-[0.4em] uppercase">或使用官方帳號</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="relative min-h-[50px] flex flex-col items-center w-full">
              {!googleInitError ? (
                <div ref={googleBtnRef} className="animate-in fade-in duration-700"></div>
              ) : (
                <div className="text-[13px] font-bold text-slate-500 bg-white/5 px-8 py-4 rounded-2xl border border-white/5 italic">
                  Google 登入服務目前僅限受邀管理員使用
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-[11px] text-slate-500 hover:text-indigo-400 font-bold transition-colors underline decoration-dotted underline-offset-4"
            >
              關於跨電腦使用與授權錯誤
            </button>
            {showHelp && (
              <div className="mt-8 p-8 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20 text-[12px] text-slate-300 text-left leading-relaxed space-y-4 animate-in slide-in-from-top-4">
                <p className="flex items-start gap-3">
                    <span className="bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-black text-[10px]">!</span>
                    <span><strong>不同電腦：</strong>資料儲存於瀏覽器。若換電腦，請在「CI 規範」頁面點擊「複製分享碼」傳給同仁貼上，即可同步所有設定。</span>
                </p>
                <p className="flex items-start gap-3">
                    <span className="bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-black text-[10px]">!</span>
                    <span><strong>授權錯誤：</strong>這代表目前網址未在 Google 控制台白名單中。請直接使用「快速進入」按鈕，功能完全相同。</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-600 text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Powered by FOOTER AI Laboratory</p>
      </div>
    </div>
  );
};

export default LoginView;

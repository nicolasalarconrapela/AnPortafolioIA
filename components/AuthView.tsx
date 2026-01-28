import React, { useState } from 'react';
import { ViewState } from '../types';

interface AuthViewProps {
  userType: 'candidate' | 'recruiter';
  onNavigate: (state: ViewState) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ userType, onNavigate }) => {
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up based on image

  const handleToggle = () => setIsLogin(!isLogin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'recruiter') {
        onNavigate('recruiter-flow');
    } else {
        onNavigate('candidate-onboarding');
    }
  };

  const isRecruiter = userType === 'recruiter';
  const accentColor = isRecruiter ? 'indigo' : 'cyan';
  const glowColor = isRecruiter ? 'rgba(99,102,241,0.5)' : 'rgba(34,211,238,0.5)';

  return (
    <div className="relative z-20 flex w-full h-screen bg-[#020408]">
        {/* Left Side - Marketing / Visuals */}
        <div className="hidden lg:flex flex-col justify-center w-5/12 p-12 xl:p-20 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-b from-${accentColor}-900/20 to-[#020408] z-0`}></div>
            
            {/* Abstract Lines */}
            <div className="absolute top-0 right-0 w-full h-full z-0 opacity-40 pointer-events-none">
                <div className="absolute top-[10%] right-[-10%] w-[300px] h-[600px] border border-cyan-500/30 rounded-[100px] rotate-[30deg]"></div>
                <div className="absolute top-[20%] right-[0%] w-[300px] h-[600px] border border-indigo-500/30 rounded-[100px] rotate-[30deg]"></div>
                <div className={`absolute top-[40%] right-[20%] w-[2px] h-[200px] bg-${accentColor}-400 blur-sm rotate-[30deg]`}></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                     <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${isRecruiter ? 'indigo-500' : 'cyan-400'} to-${isRecruiter ? 'purple-600' : 'indigo-600'} flex items-center justify-center shadow-[0_0_20px_${glowColor}]`}>
                        <span className="material-symbols-outlined text-white text-xl">deployed_code</span>
                     </div>
                     <h1 className="text-2xl font-bold text-white tracking-tight">AnPortafolioIA</h1>
                </div>

                <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 neon-text-glow">
                    {isRecruiter ? 'Discover Top' : 'Future of'} <br/>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${isRecruiter ? 'indigo-400' : 'white'} to-${isRecruiter ? 'purple-400' : 'white'}`}>
                        {isRecruiter ? 'Global Talent' : 'Hiring is Here'}
                    </span>
                </h2>
                
                <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-8 font-light">
                    {isRecruiter 
                        ? "Automate your screening process with AI avatars and find the perfect match for your team instantly."
                        : "Practice interviews with lifelike AI avatars, build a showcase portfolio, and get discovered by top tech companies."
                    }
                </p>

                <div className="glass-panel inline-flex items-center gap-4 p-3 rounded-2xl pr-8 border border-slate-700/50">
                    <div className="flex -space-x-3">
                         {[1,2,3].map(i => (
                             <img key={i} src={`https://picsum.photos/40/40?random=${i+10}`} className="w-10 h-10 rounded-full border-2 border-[#020408]" alt="User" />
                         ))}
                    </div>
                    <div>
                        <p className="text-white font-bold">{isRecruiter ? '500+ Companies' : '10k+ Candidates'}</p>
                        <p className={`${isRecruiter ? 'text-indigo-400' : 'text-slate-400'} text-xs`}>{isRecruiter ? 'Hiring now' : 'Hired this month'}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 relative">
            <button 
                onClick={() => onNavigate('landing')} 
                className="absolute top-8 right-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-50"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="w-full max-w-[420px]">
                <div className="glass-panel p-8 md:p-10 rounded-3xl w-full border border-slate-700/50 shadow-2xl relative overflow-hidden">
                    {/* Inner Glow */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-${accentColor}-500/10 blur-[80px] rounded-full pointer-events-none`}></div>

                    <h2 className="text-3xl font-bold text-white mb-2 relative z-10">{isLogin ? 'Welcome Back' : 'Create an account'}</h2>
                    <p className="text-slate-400 mb-8 relative z-10 text-sm">
                        {isLogin 
                            ? "Log in to continue your journey." 
                            : "Join the AI-powered recruitment revolution."}
                    </p>

                    <button 
                        type="button"
                        className={`w-full h-12 rounded-xl bg-transparent border border-${accentColor}-500/50 text-white font-medium flex items-center justify-center gap-3 transition-all group mb-6 hover:bg-${accentColor}-500/10 shadow-[0_0_15px_${glowColor}_inset] relative overflow-hidden`}
                    >
                        <span className="font-bold text-white text-xl z-10 flex items-center gap-2">
                             <span className="bg-white text-[#0a101f] rounded px-1 text-sm font-bold">in</span>
                             <span className="text-sm font-normal">Continue with LinkedIn</span>
                        </span>
                        <div className={`absolute inset-0 bg-${accentColor}-500/20 blur-md opacity-50`}></div>
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700/50"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] tracking-widest font-bold">
                            <span className="px-2 bg-[#0f1522] text-slate-500 uppercase">OR WITH EMAIL</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">Email</label>
                            <input 
                                type="email" 
                                defaultValue="test@test.com"
                                className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 transition-all text-sm`}
                                placeholder="name@work-email.com"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 transition-all text-sm`}
                                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                                />
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg cursor-pointer hover:text-white">visibility</span>
                            </div>
                            {!isLogin && <p className="text-[10px] text-slate-500 mt-1 ml-1">Min. 8 characters</p>}
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full h-12 mt-6 rounded-xl border border-${accentColor}-500/50 text-white font-bold shadow-[0_0_20px_${glowColor}] hover:shadow-[0_0_30px_${glowColor}] transition-all transform active:scale-95 bg-[#0a101f] relative overflow-hidden group`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r from-${accentColor}-500/20 to-purple-500/20 opacity-100 group-hover:opacity-80 transition-opacity`}></div>
                            <span className="relative z-10">{isLogin ? 'Log In' : 'Sign Up'}</span>
                        </button>
                    </form>

                    <p className="text-center mt-6 text-slate-500 text-xs">
                        by signing up, you agree to our <a href="#" className="text-slate-400 hover:text-white underline">Terms</a> and <a href="#" className="text-slate-400 hover:text-white underline">Privacy Policy</a>.
                    </p>
                </div>
                
                <p className="text-center mt-8 text-slate-500 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={handleToggle} className={`text-${accentColor}-400 hover:text-${accentColor}-300 font-bold ml-1`}>
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};
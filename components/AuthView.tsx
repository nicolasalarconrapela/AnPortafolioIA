import React, { useState } from 'react';
import { ViewState } from '../types';

interface AuthViewProps {
  userType: 'candidate' | 'recruiter';
  onNavigate: (state: ViewState) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ userType, onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);

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

  return (
    <div className="relative z-20 flex w-full h-screen bg-[#020408]">
        {/* Left Side - Marketing / Visuals */}
        <div className="hidden lg:flex flex-col justify-center w-5/12 p-12 xl:p-20 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-b from-${accentColor}-900/20 to-[#020408] z-0`}></div>
            
            {/* Abstract Lines */}
            <div className="absolute top-0 right-0 w-full h-full z-0 opacity-40">
                <div className="absolute top-[10%] right-[-10%] w-[300px] h-[600px] border border-cyan-500/30 rounded-[100px] rotate-[30deg]"></div>
                <div className="absolute top-[20%] right-[0%] w-[300px] h-[600px] border border-indigo-500/30 rounded-[100px] rotate-[30deg]"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                     <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${isRecruiter ? 'indigo-500' : 'cyan-400'} to-${isRecruiter ? 'purple-600' : 'indigo-600'} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-white text-xl">deployed_code</span>
                     </div>
                     <h1 className="text-2xl font-bold text-white tracking-tight">RecruitAI</h1>
                </div>

                <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 neon-text-glow">
                    {isRecruiter ? 'Discover Top' : 'Future of'} <br/>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${isRecruiter ? 'indigo-400' : 'cyan-400'} to-${isRecruiter ? 'purple-400' : 'indigo-400'}`}>
                        {isRecruiter ? 'Global Talent' : 'Hiring is Here'}
                    </span>
                </h2>
                
                <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-8">
                    {isRecruiter 
                        ? "Automate your screening process with AI avatars and find the perfect match for your team instantly."
                        : "Practice interviews with lifelike AI avatars, build a showcase portfolio, and get discovered by top tech companies."
                    }
                </p>

                <div className="glass-panel inline-flex items-center gap-4 p-3 rounded-2xl pr-8">
                    <div className="flex -space-x-3">
                         {[1,2,3].map(i => (
                             <img key={i} src={`https://picsum.photos/40/40?random=${i}`} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="User" />
                         ))}
                    </div>
                    <div>
                        <p className="text-white font-bold">{isRecruiter ? '500+ Companies' : '10k+ Candidates'}</p>
                        <p className={`${isRecruiter ? 'text-indigo-400' : 'text-cyan-400'} text-xs`}>{isRecruiter ? 'Hiring now' : 'Hired this month'}</p>
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
                <span className="text-sm font-medium">Close</span>
            </button>
            
            <div className="w-full max-w-md">
                <div className="glass-panel p-8 md:p-10 rounded-3xl w-full border border-slate-700/50 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                    <p className="text-slate-400 mb-8">
                        {isLogin 
                            ? `Log in as ${isRecruiter ? 'Recruiter' : 'Candidate'} to continue.` 
                            : `Join as ${isRecruiter ? 'Recruiter' : 'Candidate'} today.`}
                    </p>

                    <button className="w-full h-12 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-medium flex items-center justify-center gap-3 transition-all group mb-6">
                        <span className="font-bold text-[#0077b5] text-xl">in</span>
                        <span>Continue with LinkedIn</span>
                        <div className={`absolute inset-0 rounded-xl border border-${accentColor}-500/20 group-hover:border-${accentColor}-400/50 pointer-events-none transition-colors`}></div>
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#0d1522] text-slate-500">OR WITH EMAIL</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                            <input 
                                type="email" 
                                className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 transition-all`}
                                placeholder="name@work-email.com"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                            <input 
                                type="password" 
                                className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 transition-all`}
                                placeholder="Create a strong password"
                            />
                        </div>

                        <button type="submit" className={`w-full h-12 mt-4 bg-gradient-to-r from-${isRecruiter ? 'indigo-600 to-purple-600' : 'cyan-600 to-indigo-600'} hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95`}>
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-slate-400 text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={handleToggle} className={`text-${accentColor}-400 hover:text-${accentColor}-300 font-medium`}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};
import React, { useState } from 'react';
import { ViewState } from '../types';
import { signInWithGoogle, signInGuest, signInWithEmailAndPassword, createUserWithEmailAndPassword, auth } from '../services/firebaseClient';

interface AuthViewProps {
    onNavigate: (state: ViewState) => void;
    userType?: 'candidate' | 'recruiter';
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, userType = 'candidate' }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = () => {
        setIsLogin(!isLogin);
        setError(null);
    };

    const onSuccess = (user: any) => {
        // 1. Persist ID for existing components that use localStorage
        localStorage.setItem("anportafolio_user_id", user.uid);

        // 2. Navigate
        if (userType === 'recruiter') {
            onNavigate('recruiter-flow');
        } else {
            onNavigate('candidate-onboarding');
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = await signInWithGoogle();
            onSuccess(user);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Google Sign In Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = await signInGuest();
            onSuccess(user);
        } catch (err: any) {
            setError(err.message || 'Guest Login Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result;
            if (isLogin) {
                result = await signInWithEmailAndPassword(auth, email, password);
            } else {
                result = await createUserWithEmailAndPassword(auth, email, password);
            }
            onSuccess(result.user);
        } catch (err: any) {
            console.error(err);
            let msg = "Authentication failed";
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
            if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            if (err.code === 'auth/wrong-password') msg = "Invalid password.";
            if (err.code === 'auth/user-not-found') msg = "User not found.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const isRecruiter = userType === 'recruiter';
    const primaryColor = isRecruiter ? 'indigo' : 'cyan';
    const secondaryColor = isRecruiter ? 'cyan' : 'purple';
    const glowClass = isRecruiter ? 'shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]';

    return (
        <div className="relative z-20 flex w-full h-screen bg-[#020408]">
            {/* Left Side - Marketing / Visuals */}
            <div className="hidden lg:flex flex-col justify-center w-5/12 p-12 xl:p-20 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-b ${isRecruiter ? 'from-indigo-900/20' : 'from-cyan-900/20'} to-[#020408] z-0`}></div>

                {/* Abstract Lines */}
                <div className="absolute top-0 right-0 w-full h-full z-0 opacity-40 pointer-events-none">
                    <div className={`absolute top-[10%] right-[-10%] w-[300px] h-[600px] border ${isRecruiter ? 'border-indigo-500/30' : 'border-cyan-500/30'} rounded-[100px] rotate-[30deg]`}></div>
                    <div className={`absolute top-[20%] right-[0%] w-[300px] h-[600px] border ${isRecruiter ? 'border-cyan-500/30' : 'border-indigo-500/30'} rounded-[100px] rotate-[30deg]`}></div>
                    <div className={`absolute top-[40%] right-[20%] w-[2px] h-[200px] ${isRecruiter ? 'bg-indigo-400' : 'bg-cyan-400'} blur-sm rotate-[30deg]`}></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isRecruiter ? 'from-indigo-500 to-cyan-400' : 'from-cyan-400 to-indigo-600'} flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]`}>
                            <span className="material-symbols-outlined text-white text-xl">deployed_code</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">AnPortafolioIA</h1>
                    </div>

                    <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 neon-text-glow">
                        {isRecruiter ? 'Discover Top' : 'Future of'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white">
                            {isRecruiter ? 'Talent Instantly' : 'Hiring is Here'}
                        </span>
                    </h2>

                    <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-8 font-light">
                        {isRecruiter
                            ? "AI-powered candidate screening, immersive portfolio matching, and automated interview simulations."
                            : "Practice interviews with lifelike AI avatars, build a showcase portfolio, and get discovered by top tech companies."}
                    </p>

                    <div className="glass-panel inline-flex items-center gap-4 p-3 rounded-2xl pr-8 border border-slate-700/50">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <img key={i} src={`https://picsum.photos/40/40?random=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-[#020408]" alt="User" />
                            ))}
                        </div>
                        <div>
                            <p className="text-white font-bold">{isRecruiter ? '500+ Companies' : '10k+ Candidates'}</p>
                            <p className="text-slate-400 text-xs">{isRecruiter ? 'Hiring now' : 'Hired this month'}</p>
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
                        <div className={`absolute top-0 right-0 w-64 h-64 ${isRecruiter ? 'bg-indigo-500/10' : 'bg-cyan-500/10'} blur-[80px] rounded-full pointer-events-none`}></div>

                        <div className="relative z-10 flex items-center gap-2 mb-2">
                            {isRecruiter && <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">Recruiter Access</span>}
                            {userType === 'candidate' && <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">Candidate Access</span>}
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-slate-400 mb-6 relative z-10 text-sm">
                            {isLogin
                                ? "Log in to continue."
                                : (isRecruiter ? "Join the AI recruitment revolution." : "Join the AI-powered recruitment revolution.")}
                        </p>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 animate-fade-in relative z-10">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">{isRecruiter ? 'Work Email' : 'Email'}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-${primaryColor}-500 focus:ring-1 focus:ring-${primaryColor}-500 transition-all text-sm`}
                                    placeholder="name@work-email.com"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-${primaryColor}-500 focus:ring-1 focus:ring-${primaryColor}-500 transition-all text-sm`}
                                        placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                                        disabled={loading}
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg cursor-pointer hover:text-white">visibility</span>
                                </div>
                                {!isLogin && <p className="text-[10px] text-slate-500 mt-1 ml-1">Min. 6 characters</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full h-12 mt-2 rounded-xl border border-${primaryColor}-500/50 text-white font-bold ${glowClass} transition-all transform active:scale-95 bg-[#0a101f] relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r from-${primaryColor}-500/20 to-${secondaryColor}-500/20 opacity-100 group-hover:opacity-80 transition-opacity`}></div>
                                <span className="relative z-10">{loading ? 'Processing...' : (isLogin ? 'Log In' : (isRecruiter ? 'Start Hiring' : 'Sign Up'))}</span>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative z-10 flex items-center gap-4 my-6">
                            <div className="h-px bg-slate-800 flex-1"></div>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Or continue with</span>
                            <div className="h-px bg-slate-800 flex-1"></div>
                        </div>

                        {/* Social Login */}
                        <div className="relative z-10 grid grid-cols-2 gap-3">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-white text-xs font-bold">Google</span>
                            </button>
                            <button
                                onClick={handleGuestLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all"
                            >
                                <span className="material-symbols-outlined text-slate-400 text-lg">person_off</span>
                                <span className="text-white text-xs font-bold">Guest</span>
                            </button>
                        </div>

                        <p className="text-center mt-6 text-slate-500 text-xs">
                            by signing up, you agree to our <a href="#" className="text-slate-400 hover:text-white underline">Terms</a> and <a href="#" className="text-slate-400 hover:text-white underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <p className="text-center mt-8 text-slate-500 text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={handleToggle} className={`text-${primaryColor}-400 hover:text-${primaryColor}-300 font-bold ml-1`}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
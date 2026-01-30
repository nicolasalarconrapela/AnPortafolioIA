import React, { useState } from 'react';
import { ViewState } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Icon } from './ui/Icon';
import { Card } from './ui/Card';

interface AuthViewProps {
  onNavigate: (state: ViewState) => void;
  userType?: 'candidate' | 'recruiter';
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, userType = 'candidate' }) => {
  const isRecruiter = userType === 'recruiter';
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState(isRecruiter ? "recruiter@techcorp.com" : "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});
  
  const handleToggle = () => {
      setIsLogin(!isLogin);
      setErrors({});
  };

  const validate = () => {
      const newErrors: any = {};
      if (!email) newErrors.email = "Email is required";
      if (!password) newErrors.password = "Password is required";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // --- ADMIN BYPASS LOGIC ---
    if (email === 'Admin' && password === 'Admin') {
        await new Promise(resolve => setTimeout(resolve, 200));
        setIsLoading(false);
        
        if (userType === 'recruiter') {
            onNavigate('recruiter-flow');
        } else {
            onNavigate('candidate-dashboard');
        }
        return;
    }
    // --------------------------

    // Simular delay de red estándar
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    
    if (userType === 'recruiter') {
        onNavigate('recruiter-flow');
    } else {
        onNavigate('candidate-onboarding'); 
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);
    if (userType === 'recruiter') {
        onNavigate('recruiter-flow');
    } else {
        onNavigate('candidate-dashboard'); 
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface-variant dark:bg-surface-darkVariant">
      
      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-container relative overflow-hidden flex-col justify-between p-12 transition-colors duration-500">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
                <Icon name="diversity_3" className="text-primary text-4xl" />
                <span className="font-display font-medium text-2xl tracking-tight text-primary-onContainer">PortafolioIA</span>
            </div>
            <h2 className="text-4xl font-display font-normal text-primary-onContainer max-w-md leading-tight animate-fade-in">
                {isRecruiter 
                    ? "Find the perfect match with AI-driven insights." 
                    : "Showcase your potential, not just your resume."}
            </h2>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex gap-4 mb-4">
                <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface flex items-center justify-center overflow-hidden">
                             <img src={`https://i.pravatar.cc/150?u=${i+10 + (isRecruiter ? 50 : 0)}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-sm font-bold text-primary-onContainer">2k+ {isRecruiter ? 'Candidates' : 'Professionals'}</span>
                    <span className="text-xs text-primary-onContainer/70">Joined this week</span>
                </div>
            </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <Card variant="elevated" className="w-full max-w-[420px] bg-[var(--md-sys-color-background)] animate-fade-scale">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                <Icon name="diversity_3" className="text-primary text-3xl" />
                <span className="font-display font-medium text-xl tracking-tight">PortafolioIA</span>
            </div>

            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary-onContainer text-xs font-bold mb-3">
                    <Icon name={isRecruiter ? 'business_center' : 'person'} size="sm" />
                    {isRecruiter ? 'Recruiter Portal' : 'Candidate Portal'}
                </div>
                <h1 className="font-display text-3xl font-normal text-[var(--md-sys-color-on-background)] mb-2">
                    {isLogin ? 'Welcome back' : 'Get started'}
                </h1>
                <p className="text-outline text-base">
                    {isLogin 
                        ? `Sign in to your ${isRecruiter ? 'company' : 'professional'} account` 
                        : `Create your ${isRecruiter ? 'company' : 'professional'} profile`
                    }
                </p>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Button variant="outlined" fullWidth className="gap-2">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    Google
                </Button>
                <Button variant="outlined" fullWidth className="gap-2">
                    <img src="https://www.svgrepo.com/show/448234/linkedin.svg" className="w-5 h-5" alt="LinkedIn" />
                    LinkedIn
                </Button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--md-sys-color-background)] px-2 text-outline">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input 
                    id="email"
                    label="Email or Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    startIcon="mail"
                />

                <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    startIcon="lock"
                    endIcon={showPassword ? "visibility_off" : "visibility"}
                    onEndIconClick={() => setShowPassword(!showPassword)}
                />

                {isLogin && (
                    <div className="flex justify-end">
                        <Button variant="text" size="sm" type="button" className="px-0">
                            Forgot password?
                        </Button>
                    </div>
                )}

                <Button 
                    type="submit" 
                    variant="filled"
                    fullWidth
                    loading={isLoading}
                    className="mt-2"
                >
                    {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-8 text-center">
                <p className="text-sm text-outline">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={handleToggle}
                        className="ml-2 text-primary font-medium hover:underline focus:outline-none"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>

            {/* Demo Bypass - Para desarrollo y pruebas rápidas */}
            <div className="mt-8 pt-6 border-t border-outline-variant/50">
                <Button 
                    variant="text" 
                    fullWidth 
                    onClick={handleDemoLogin}
                    icon="play_circle"
                    className="uppercase tracking-wider font-bold"
                >
                    Skip Login (Demo Mode)
                </Button>
            </div>

            <Button 
                variant="text" 
                fullWidth 
                onClick={() => onNavigate('landing')}
                icon="arrow_back"
                size="sm"
                className="mt-2 text-outline"
            >
                Back to Home
            </Button>

        </Card>
      </div>
    </div>
  );
};
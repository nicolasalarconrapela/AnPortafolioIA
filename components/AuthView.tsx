
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
  
  // Validation State
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});

  const handleToggle = () => {
      setIsLogin(!isLogin);
      setErrors({});
      // Reset fields if switching context, optional depending on UX preference
      if (!isRecruiter) setEmail(""); 
      setPassword("");
  };

  // Validation Logic - Human friendly, pure JS
  const validateField = (field: string, value: string) => {
      if (field === 'email') {
          if (!value.trim()) return "El correo es obligatorio";
          // Robust email regex that allows standard formats
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Introduce un email válido";
      }
      if (field === 'password') {
          if (!value) return "La contraseña es obligatoria";
          if (!isLogin && value.length < 6) return "Mínimo 6 caracteres";
      }
      return undefined;
  };

  // Trigger validation only when user leaves the field
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      const error = validateField(id, value);
      // Only set error if there is one, to avoid clearing existing errors unnecessarily if logic gets complex
      setErrors(prev => ({ ...prev, [id]: error }));
  };

  // Clear error immediately when user starts typing to fix it
  const handleChange = (field: 'email' | 'password', value: string) => {
      if (field === 'email') setEmail(value);
      if (field === 'password') setPassword(value);

      if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: undefined }));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields on submit
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);

    setErrors({
        email: emailError,
        password: passwordError
    });

    if (emailError || passwordError) return;

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

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    // Simular creación de sesión temporal
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    
    if (userType === 'recruiter') {
        onNavigate('recruiter-flow'); 
    } else {
        onNavigate('candidate-onboarding');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--md-sys-color-background)]">
      
      {/* Left Panel - Minimalist Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-variant/30 relative flex-col justify-center px-20 border-r border-outline-variant/10">
        <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-8 opacity-80">
                <Icon name="diversity_3" className="text-primary text-3xl" />
                <span className="font-display font-medium text-xl tracking-tight text-[var(--md-sys-color-on-background)]">PortafolioIA</span>
            </div>
            
            <h2 className="text-5xl font-display font-light text-[var(--md-sys-color-on-background)] leading-[1.1] mb-6">
                {isRecruiter 
                    ? "Intelligent matching." 
                    : "Your work, simply showcased."}
            </h2>
            <p className="text-xl text-outline font-light leading-relaxed">
                {isRecruiter 
                    ? "Recruitment stripped of the noise. Just talent and fit." 
                    : "The portfolio platform that focuses on what matters: you."}
            </p>
        </div>
      </div>

      {/* Right Panel - Clean Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        
        {/* Unified Top Header - Flex Row for perfect alignment */}
        <div className="absolute top-0 left-0 w-full p-6 sm:p-8 flex items-center justify-between z-20">
             {/* Left: Home Button */}
             <button 
                onClick={() => onNavigate('landing')}
                className="text-sm text-outline hover:text-primary flex items-center gap-2 transition-colors px-2 py-1 rounded-md hover:bg-surface-variant/50"
            >
                <Icon name="arrow_back" size={18} />
                <span className="font-medium">Home</span>
            </button>

            {/* Right: Branding (Visible ONLY on Mobile) */}
            <div className="lg:hidden flex items-center gap-2 opacity-90">
                <Icon name="diversity_3" className="text-primary text-xl" />
                <span className="font-display font-medium text-lg text-[var(--md-sys-color-on-background)]">PortafolioIA</span>
            </div>
        </div>

        {/* Content Container - Centered */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 mt-16 lg:mt-0">
            <div className="w-full max-w-[400px]">
                
                <div className="mb-10">
                    <h1 className="font-display text-3xl font-normal text-[var(--md-sys-color-on-background)] mb-2">
                        {isLogin ? 'Sign in' : 'Create account'}
                    </h1>
                    <p className="text-outline text-sm">
                        {isLogin 
                            ? `Access the ${isRecruiter ? 'recruiter' : 'candidate'} portal.`
                            : "Join the platform today."
                        }
                    </p>
                </div>

                {/* Social Login - Linear Minimal */}
                <div className="flex flex-col gap-3 mb-8">
                    <Button variant="outlined" fullWidth className="justify-center gap-3 relative border-outline-variant/60 hover:border-outline-variant h-12" aria-label="Sign in with Google">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 absolute left-4" alt="" aria-hidden="true" />
                        <span className="font-normal text-[var(--md-sys-color-on-background)]">Continue with Google</span>
                    </Button>
                    <Button 
                        variant="outlined" 
                        fullWidth 
                        className="justify-center gap-3 relative border-outline-variant/60 hover:border-outline-variant h-12" 
                        aria-label="Continue as anonymous user"
                        onClick={handleAnonymousLogin}
                    >
                        <div className="absolute left-4 flex items-center justify-center text-[var(--md-sys-color-on-background)]">
                            <Icon name="no_accounts" size={20} />
                        </div>
                        <span className="font-normal text-[var(--md-sys-color-on-background)]">Continue Anonymously</span>
                    </Button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-outline-variant/30"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-medium">
                        <span className="bg-[var(--md-sys-color-background)] px-2 text-outline/50">Or</span>
                    </div>
                </div>

                {/* 
                    Form Refactor: 
                    1. noValidate to disable browser bubbles.
                    2. Handled inputs with onBlur validation.
                */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    <Input 
                        id="email"
                        // Using 'text' type with 'email' inputMode prevents some browser validation triggers
                        // while keeping the correct mobile keyboard.
                        type="text"
                        inputMode="email"
                        autoComplete="email"
                        label="Email"
                        value={email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={handleBlur}
                        error={errors.email}
                    />

                    <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        label="Password"
                        value={password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onBlur={handleBlur}
                        error={errors.password}
                        endIcon={showPassword ? "visibility_off" : "visibility"}
                        onEndIconClick={() => setShowPassword(!showPassword)}
                    />

                    {isLogin && (
                        <div className="flex justify-end">
                            <Button 
                                variant="text" 
                                size="sm" 
                                type="button" 
                                className="px-0 text-outline hover:text-primary font-normal text-xs"
                                tabIndex={0}
                            >
                                Forgot password?
                            </Button>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        variant="filled" 
                        fullWidth
                        loading={isLoading}
                        className="mt-2 h-12"
                    >
                        {isLogin ? 'Continue' : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-outline">
                        {isLogin ? "New here?" : "Have an account?"}
                        <button 
                            onClick={handleToggle}
                            className="ml-2 text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                            {isLogin ? 'Create account' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Subtle Footer for Dev Tools */}
                <div className="mt-12 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <button 
                        onClick={handleDemoLogin}
                        className="text-[10px] text-outline/50 hover:text-primary font-mono"
                    >
                        DEV_SKIP
                    </button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

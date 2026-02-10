import React, { useMemo, useState } from "react";
import { ViewState } from "../types";

import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Icon } from "./ui/Icon";

import { authService } from "../services/authService";
import { loggingService } from "../utils/loggingService";
import { getWorkspaceByUserFromFirestore } from "../services/firestoreWorkspaces";
import { APP_VERSION } from "../version";

interface AuthViewProps {
  onNavigate: (state: ViewState) => void;
  onLoginSuccess: (user: any) => void;
  initialMode?: "login" | "register";
}

type FieldErrors = { email?: string; password?: string };
type UserType = 'candidate' | 'company';

export const AuthView: React.FC<AuthViewProps> = ({
  onNavigate,
  onLoginSuccess,
  initialMode = "login",
}) => {
  // UI State
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [userType, setUserType] = useState<UserType>('candidate');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation/UI Errors
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const copy = useMemo(() => {
    if (userType === 'candidate') {
      return {
        title: isLogin ? "Welcome back" : "Join as Talent",
        subtitle: isLogin ? "Access your portfolio workspace." : "Create your AI-powered portfolio.",
        heroTitle: "Your career, intelligently showcased.",
        heroText: "The portfolio platform that focuses on what matters: your skills and potential.",
        cta: isLogin ? "Continue" : "Start Building"
      };
    } else {
      return {
        title: isLogin ? "Business Login" : "Register Company",
        subtitle: isLogin ? "Manage job postings and candidates." : "Start hiring the best talent.",
        heroTitle: "Find the perfect match, faster.",
        heroText: "Use AI to discover candidates that fit your culture and technical needs instantly.",
        cta: isLogin ? "Login to Dashboard" : "Create Business Account"
      };
    }
  }, [isLogin, userType]);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setErrors({});
    setGeneralError(null);
  };

  // --- Validation Logic (HEAD) ---
  const validateField = (field: "email" | "password", value: string) => {
    if (field === "email") {
      if (!value.trim()) return "El correo es obligatorio";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Introduce un email válido";
    }
    if (field === "password") {
      if (!value) return "La contraseña es obligatoria";
      if (!isLogin && value.length < 6) return "Mínimo 6 caracteres";
    }
    return undefined;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target as HTMLInputElement;
    if (id !== "email" && id !== "password") return;
    const err = validateField(id, value);
    setErrors((prev) => ({ ...prev, [id]: err }));
  };

  const handleChange = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  // --- feature/firebase-add: success handling ---
  const onAuthSuccess = async (user: any) => {
    const uid = user?.uid || user?.localId || "";
    // localStorage.setItem("anportafolio_user_id", uid); // Removed localStorage
    onLoginSuccess(user);

    try {
      // Check if user has already completed onboarding
      const workspace = await getWorkspaceByUserFromFirestore(uid);
      if (workspace?.profile?.onboardingCompleted) {
        onNavigate("candidate-dashboard");
      } else {
        onNavigate("candidate-onboarding");
      }
    } catch (error) {
      loggingService.warn("Could not check onboarding status, defaulting to onboarding", error);
      onNavigate("candidate-onboarding");
    }
  };

  // --- Firebase Auth actions ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      const user = await authService.loginGoogle();
      onAuthSuccess(user);
    } catch (err: any) {
      loggingService.error("Google Sign In Failed", { error: err });
      setGeneralError(err?.message || "Google Sign In Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      // feature/firebase-add lo llama "Guest"
      const user = await authService.loginGuest();
      onAuthSuccess(user);
    } catch (err: any) {
      loggingService.error("Guest Login Failed", { error: err });
      setGeneralError(err?.message || "Guest Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields on submit
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) return;

    setIsLoading(true);
    setGeneralError(null);

    try {
      let user;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        // Pass userType (candidate/company) during registration
        user = await authService.register(email, password, userType);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      loggingService.error("Authentication failed", { error: err });
      // Tu backend/servicio suele devolver message, o { error: "..." }
      setGeneralError(err?.message || err?.error || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--md-sys-color-background)]">
      {/* Left Panel - Minimalist Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-variant/30 relative flex-col justify-center px-20 border-r border-outline-variant/10 overflow-hidden">
        {/* Background Decor */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/4 transition-colors duration-700 ${userType === 'candidate' ? 'from-primary to-secondary' : 'from-purple-500 to-indigo-500'}`}></div>
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr rounded-full blur-[80px] opacity-20 translate-y-1/3 -translate-x-1/4 transition-colors duration-700 ${userType === 'candidate' ? 'from-secondary to-tertiary' : 'from-indigo-500 to-blue-500'}`}></div>

        <div className="max-w-lg relative z-10">
          <div className="flex items-center gap-3 mb-8 opacity-80">
            <Icon name={userType === 'candidate' ? "person_check" : "business_center"} className="text-primary text-3xl" />
            <span className="font-display font-medium text-xl tracking-tight text-[var(--md-sys-color-on-background)]">
              AnPortafolioIA <span className="opacity-50 mx-2">|</span> <span className="text-sm font-normal uppercase tracking-widest">{userType === 'candidate' ? 'Talent' : 'Business'}</span>
            </span>
          </div>

          <h2 className="text-5xl font-display font-light text-[var(--md-sys-color-on-background)] leading-[1.1] mb-6">
            {copy.heroTitle}
          </h2>

          <p className="text-xl text-outline font-light leading-relaxed">{copy.heroText}</p>
        </div>
      </div>

      {/* Right Panel - Clean Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        {/* Unified Top Header */}
        <div className="absolute top-0 left-0 w-full p-6 sm:p-8 flex items-center justify-between z-20">
          <button
            onClick={() => onNavigate("landing")}
            className="text-sm text-outline hover:text-primary flex items-center gap-2 transition-colors px-2 py-1 rounded-md hover:bg-surface-variant/50"
            type="button"
          >
            <Icon name="arrow_back" size={18} />
            <span className="font-medium">Home</span>
          </button>

          <div className="lg:hidden flex items-center gap-2 opacity-90">
            <Icon name="diversity_3" className="text-primary text-xl" />
            <span className="font-display font-medium text-lg text-[var(--md-sys-color-on-background)]">
              AnPortafolioIA
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 mt-16 lg:mt-0">
          <div className="w-full max-w-[420px]">
            
            {/* Persona Switcher */}
            <div className="flex bg-surface-variant/50 p-1 rounded-full mb-8 relative border border-outline-variant/30">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-full shadow-sm transition-all duration-300 ease-out border border-outline-variant/10 ${userType === 'company' ? 'left-[calc(50%+2px)]' : 'left-1'}`} 
              />
              <button 
                onClick={() => setUserType('candidate')} 
                className={`flex-1 relative z-10 text-sm font-medium py-2.5 text-center transition-colors rounded-full flex items-center justify-center gap-2 ${userType === 'candidate' ? 'text-primary font-bold' : 'text-outline hover:text-slate-600'}`}
                type="button"
              >
                <Icon name="person" size={18} />
                Talent
              </button>
              <button 
                onClick={() => setUserType('company')} 
                className={`flex-1 relative z-10 text-sm font-medium py-2.5 text-center transition-colors rounded-full flex items-center justify-center gap-2 ${userType === 'company' ? 'text-indigo-600 font-bold' : 'text-outline hover:text-slate-600'}`}
                type="button"
              >
                <Icon name="domain" size={18} />
                Business
              </button>
            </div>

            <div className="mb-8">
              <h1 className="font-display text-3xl font-normal text-[var(--md-sys-color-on-background)] mb-2">
                {copy.title}
              </h1>
              <p className="text-outline text-sm">{copy.subtitle}</p>
            </div>

            {/* General error (Firebase/back) */}
            {generalError && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
                <Icon name="error" className="mt-0.5 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Social Login */}
            <div className="flex flex-col gap-3 mb-8">
              <Button
                variant="outlined"
                fullWidth
                className="justify-center gap-3 relative border-outline-variant/60 hover:border-outline-variant h-12 bg-white dark:bg-transparent"
                aria-label="Sign in with Google"
                onClick={handleGoogleLogin}
                loading={isLoading}
                type="button"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5 absolute left-4"
                  alt=""
                  aria-hidden="true"
                />
                <span className="font-medium text-[var(--md-sys-color-on-background)]">
                  Continue with Google
                </span>
              </Button>

              {userType === 'candidate' && (
                <Button
                  variant="outlined"
                  fullWidth
                  className="justify-center gap-3 relative border-outline-variant/60 hover:border-outline-variant h-12 bg-white dark:bg-transparent"
                  aria-label="Continue as anonymous user"
                  onClick={handleAnonymousLogin}
                  loading={isLoading}
                  type="button"
                >
                  <div className="absolute left-4 flex items-center justify-center text-outline">
                    <Icon name="visibility_off" size={20} />
                  </div>
                  <span className="font-medium text-[var(--md-sys-color-on-background)]">
                    Try as Guest
                  </span>
                </Button>
              )}
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-outline/40">
                <span className="bg-[var(--md-sys-color-background)] px-3">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <Input
                id="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                label={userType === 'company' ? "Work Email" : "Email Address"}
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={handleBlur}
                error={errors.email}
                disabled={isLoading}
                startIcon="mail"
              />

              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                label="Password"
                value={password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={handleBlur}
                error={errors.password}
                endIcon={showPassword ? "visibility_off" : "visibility"}
                onEndIconClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                startIcon="lock"
              />

              {isLogin && (
                <div className="flex justify-end">
                  <Button
                    variant="text"
                    size="sm"
                    type="button"
                    className="px-0 text-outline hover:text-primary font-normal text-xs"
                    tabIndex={0}
                    disabled={isLoading}
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
                className={`mt-2 h-12 text-base ${userType === 'company' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
              >
                {copy.cta}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-outline">
                {isLogin ? "New to AnPortafolio?" : "Already have an account?"}
                <button
                  onClick={handleToggle}
                  className={`ml-2 font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded ${userType === 'company' ? 'text-indigo-600 focus-visible:ring-indigo-500' : 'text-primary focus-visible:ring-primary'}`}
                  type="button"
                  disabled={isLoading}
                >
                  {isLogin ? "Create account" : "Sign in"}
                </button>
              </p>
            </div>

          </div>
          <div className="mt-auto py-6 text-center opacity-40">
            <p className="font-mono text-[10px] text-outline">v{APP_VERSION}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

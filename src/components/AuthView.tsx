import React, { useMemo, useState } from "react";
import { ViewState } from "../types";

import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Icon } from "./ui/Icon";

import { authService } from "../services/authService";
import { loggingService } from "../utils/loggingService";

interface AuthViewProps {
  onNavigate: (state: ViewState) => void;
  userType?: "candidate" | "recruiter";
  initialMode?: "login" | "register";
}

type FieldErrors = { email?: string; password?: string };

export const AuthView: React.FC<AuthViewProps> = ({
  onNavigate,
  userType = "candidate",
  initialMode = "login",
}) => {
  const isRecruiter = userType === "recruiter";

  // UI State
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState(isRecruiter ? "recruiter@techcorp.com" : "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation/UI Errors
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const copy = useMemo(() => {
    return {
      title: isLogin ? "Sign in" : "Create account",
      subtitle: isLogin
        ? `Access the ${isRecruiter ? "recruiter" : "candidate"} portal.`
        : "Join the platform today.",
      heroTitle: isRecruiter ? "Intelligent matching." : "Your work, simply showcased.",
      heroText: isRecruiter
        ? "Recruitment stripped of the noise. Just talent and fit."
        : "The portfolio platform that focuses on what matters: you.",
    };
  }, [isLogin, isRecruiter]);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setErrors({});
    setGeneralError(null);
    // Reset fields (igual que tu HEAD)
    if (!isRecruiter) setEmail("");
    setPassword("");
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
  const onAuthSuccess = (user: any) => {
    // Persistencia compatible con lo que ya uses (feature/firebase-add)
    localStorage.setItem("anportafolio_user_id", user?.uid || user?.localId || "");

    // Navegación consistente
    if (userType === "recruiter") {
      onNavigate("recruiter-flow");
    } else {
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
        user = await authService.register(email, password);
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

  // Mantengo tu DEV_SKIP del HEAD (si quieres que vaya a dashboard directo)
  const handleDevSkip = async () => {
    setIsLoading(true);
    setGeneralError(null);
    try {
      await new Promise((r) => setTimeout(r, 250));
      if (userType === "recruiter") onNavigate("recruiter-flow");
      else onNavigate("candidate-dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--md-sys-color-background)]">
      {/* Left Panel - Minimalist Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-variant/30 relative flex-col justify-center px-20 border-r border-outline-variant/10">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8 opacity-80">
            <Icon name="diversity_3" className="text-primary text-3xl" />
            <span className="font-display font-medium text-xl tracking-tight text-[var(--md-sys-color-on-background)]">
              PortafolioIA
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
              PortafolioIA
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 mt-16 lg:mt-0">
          <div className="w-full max-w-[400px]">
            <div className="mb-10">
              <h1 className="font-display text-3xl font-normal text-[var(--md-sys-color-on-background)] mb-2">
                {copy.title}
              </h1>
              <p className="text-outline text-sm">{copy.subtitle}</p>
            </div>

            {/* General error (Firebase/back) */}
            {generalError && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {generalError}
              </div>
            )}

            {/* Social Login */}
            <div className="flex flex-col gap-3 mb-8">
              <Button
                variant="outlined"
                fullWidth
                className="justify-center gap-3 relative border-outline-variant/60 hover:border-outline-variant h-12"
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
                <span className="font-normal text-[var(--md-sys-color-on-background)]">
                  Continue with Google
                </span>
              </Button>

              <Button
                variant="outlined"
                fullWidth
                className="justify-center gap-3 relative border-outline-variant/60 hover:border-outline-variant h-12"
                aria-label="Continue as anonymous user"
                onClick={handleAnonymousLogin}
                loading={isLoading}
                type="button"
              >
                <div className="absolute left-4 flex items-center justify-center text-[var(--md-sys-color-on-background)]">
                  <Icon name="no_accounts" size={20} />
                </div>
                <span className="font-normal text-[var(--md-sys-color-on-background)]">
                  Continue Anonymously
                </span>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <Input
                id="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                label="Email"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={handleBlur}
                error={errors.email}
                disabled={isLoading}
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

              <Button type="submit" variant="filled" fullWidth loading={isLoading} className="mt-2 h-12">
                {isLogin ? "Continue" : "Sign Up"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-outline">
                {isLogin ? "New here?" : "Have an account?"}
                <button
                  onClick={handleToggle}
                  className="ml-2 text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  type="button"
                  disabled={isLoading}
                >
                  {isLogin ? "Create account" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Subtle Footer for Dev Tools */}
            <div className="mt-12 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
              <button onClick={handleDevSkip} className="text-[10px] text-outline/50 hover:text-primary font-mono" type="button">
                DEV_SKIP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

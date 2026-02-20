import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Feature cards data ──────────────────────────────────────────────
interface Feature {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  accentBg: string;
  tag: string;
}

const features: Feature[] = [
  {
    icon: 'auto_fix_high',
    title: 'Mejora tu CV con IA',
    description: 'Nuestra inteligencia artificial analiza tu currículum y te sugiere mejoras concretas para destacar ante reclutadores.',
    accentColor: '#0B57D0',
    accentBg: 'rgba(11, 87, 208, 0.10)',
    tag: 'Inteligencia Artificial',
  },
  {
    icon: 'send',
    title: 'Comparte tu Currículum Optimizado',
    description: 'Genera un enlace profesional único y compártelo con empresas y reclutadores en un solo clic.',
    accentColor: '#0842A0',
    accentBg: 'rgba(8, 66, 160, 0.10)',
    tag: 'Compartir',
  },
  {
    icon: 'smart_toy',
    title: 'Donna, tu Asistente Profesional',
    description: 'Habla con Donna, tu asistente IA personal que responde preguntas sobre tu perfil y te ayuda a prepararte.',
    accentColor: '#146C2E',
    accentBg: 'rgba(20, 108, 46, 0.10)',
    tag: 'Asistente IA',
  },
  {
    icon: 'edit_document',
    title: 'Editor Inteligente de Perfil',
    description: 'Edita tu experiencia, educación, proyectos y habilidades técnicas con un wizard guiado paso a paso.',
    accentColor: '#8430CE',
    accentBg: 'rgba(132, 48, 206, 0.10)',
    tag: 'Edición',
  },
  {
    icon: 'download',
    title: 'Exporta en Múltiples Formatos',
    description: 'Descarga tu currículum como JSON o compártelo como un perfil público profesional listo para reclutadores.',
    accentColor: '#B5641A',
    accentBg: 'rgba(181, 100, 26, 0.10)',
    tag: 'Exportar',
  },
  {
    icon: 'shield',
    title: 'Tu Privacidad, Tu Control',
    description: 'Tú decides qué información compartes. Tus datos están protegidos y nunca se venden a terceros.',
    accentColor: '#BA1A1A',
    accentBg: 'rgba(186, 26, 26, 0.10)',
    tag: 'Seguridad',
  },
];

const INTERVAL_MS = 3000;

// ─── Main SplashScreen Component ─────────────────────────────────────
export const SplashScreen: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mount animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Progress bar animation
  useEffect(() => {
    const t = setTimeout(() => setProgressWidth(90), 300);
    return () => clearTimeout(t);
  }, []);

  // Navigate to a specific card
  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 350);
  }, []);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % features.length);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + features.length) % features.length);
  }, [activeIndex, goTo]);

  // Auto-advance with reset on manual nav
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo((activeIndex + 1) % features.length);
    }, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeIndex, goTo]);

  const current = features[activeIndex];

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--md-sys-color-background)] flex flex-col overflow-hidden">
      {/* ─── Keyframes ─────────────────────────────────────────── */}
      <style>{`
        @keyframes splashFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes splashGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes splashGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(11,87,208,0.25); }
          50% { box-shadow: 0 0 14px rgba(11,87,208,0.45); }
        }
        @keyframes splashCardProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes splashIconPop {
          0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes splashGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(11,87,208,0.25); }
          50% { box-shadow: 0 0 14px rgba(11,87,208,0.45); }
        }
        @keyframes splashDotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* ─── Header ────────────────────────────────────────────── */}
      <header className="px-4 py-3 sm:px-6 md:px-8 flex items-center justify-center border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center"
            style={{ animation: 'splashFloat 3s ease-in-out infinite' }}
          >
            <span className="material-symbols-outlined text-primary text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              diversity_3
            </span>
          </div>
          <span className="font-display font-medium text-base sm:text-lg tracking-tight text-[var(--md-sys-color-on-background)]/75">
            AnPortafolioIA
          </span>
        </div>
      </header>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-hidden">

        {/* Title */}
        <div
          className="text-center mb-6 sm:mb-8 md:mb-10 max-w-lg"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h1
            className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
            style={{
              background: 'linear-gradient(135deg, #0B57D0, #A8C7FA, #0842A0)',
              backgroundSize: '200% 200%',
              animation: 'splashGradient 5s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tu Currículum Potenciado con IA
          </h1>
        </div>

        {/* ── Card + Navigation Arrows ────────────────────────── */}
        <div
          className="w-full max-w-sm sm:max-w-md md:max-w-lg flex items-center gap-2 sm:gap-4"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          {/* ← Prev Arrow */}
          <button
            onClick={goPrev}
            className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
              bg-surface-variant/60 dark:bg-surface-darkVariant/60
              hover:bg-surface-variant dark:hover:bg-surface-darkVariant
              text-outline hover:text-primary
              border border-outline-variant/20 hover:border-primary/30
              transition-all duration-200 active:scale-90
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Anterior"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>

          {/* Card */}
          <div className="flex-1 min-w-0">
            <div
              className="relative rounded-2xl sm:rounded-3xl border border-outline-variant/20 bg-[var(--md-sys-color-background)] dark:bg-surface-dark shadow-elevation-2 overflow-hidden h-[280px] sm:h-[300px] md:h-[320px]"
            >
              {/* Card content */}
              <div
                className="p-5 sm:p-6 md:p-8 h-full flex flex-col items-center justify-center text-center"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateY(10px) scale(0.98)' : 'translateY(0) scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Tag */}
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium mb-3 sm:mb-4"
                  style={{ backgroundColor: current.accentBg, color: current.accentColor }}
                >
                  {current.tag}
                </div>

                {/* Icon */}
                <div
                  key={`icon-${activeIndex}`}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
                  style={{
                    backgroundColor: current.accentBg,
                    animation: 'splashIconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                  }}
                >
                  <span
                    className="material-symbols-outlined text-3xl sm:text-4xl"
                    style={{ color: current.accentColor, fontVariationSettings: "'FILL' 1" }}
                  >
                    {current.icon}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display font-semibold text-base sm:text-xl md:text-2xl text-[var(--md-sys-color-on-background)] mb-1.5 sm:mb-2 leading-tight">
                  {current.title}
                </h2>

                {/* Description */}
                <p className="text-xs sm:text-sm md:text-base text-outline leading-relaxed max-w-xs sm:max-w-sm">
                  {current.description}
                </p>

                {/* Counter */}
                <span className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-outline/40 font-mono">
                  {activeIndex + 1} / {features.length}
                </span>
              </div>
            </div>
          </div>

          {/* → Next Arrow */}
          <button
            onClick={goNext}
            className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
              bg-surface-variant/60 dark:bg-surface-darkVariant/60
              hover:bg-surface-variant dark:hover:bg-surface-darkVariant
              text-outline hover:text-primary
              border border-outline-variant/20 hover:border-primary/30
              transition-all duration-200 active:scale-90
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Siguiente"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>

        {/* ── Dot Indicators ──────────────────────────────────── */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 mt-5 sm:mt-6"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.5s ease 0.6s',
          }}
        >
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => { if (i !== activeIndex) goTo(i); }}
              className="transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                width: i === activeIndex ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === activeIndex ? current.accentColor : 'rgba(116, 119, 117, 0.25)',
              }}
              aria-label={`Ir a: ${f.title}`}
            />
          ))}
        </div>

      </main>

      {/* ─── Progress Bar ─────────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-6 md:px-8 pb-4 sm:pb-5">
        <div className="max-w-xs sm:max-w-sm mx-auto">
          <div className="h-1 w-full bg-outline-variant/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressWidth}%`,
                transition: 'width 4s ease-out',
                background: 'linear-gradient(90deg, #0B57D0, #A8C7FA)',
                animation: 'splashGlow 2.5s ease-in-out infinite',
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-1 mt-2.5">
            <span className="text-outline/35 text-xs">Cargando</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-outline/40 inline-block"
                style={{ animation: `splashDotBounce 1.2s ease-in-out infinite ${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

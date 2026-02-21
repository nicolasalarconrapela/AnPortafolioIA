import React, { useState, useEffect } from 'react';

/**
 * AppSkeleton — minimal loading indicator shown while
 * the backend session is being verified.
 *
 * Shows a clean "Cargando perfil…" message with a subtle
 * animation. Only the text becomes visible after a short
 * delay (400ms) to avoid flash on fast connections.
 */
export const AppSkeleton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  // Small delay so fast connections see nothing at all
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--md-sys-color-background)] flex items-center justify-center">
      <div
        className="flex flex-col items-center gap-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.4s ease-out',
        }}
      >
        {/* Spinner */}
        <div
          className="w-8 h-8 rounded-full border-[2.5px] border-outline-variant/20"
          style={{
            borderTopColor: 'var(--md-sys-color-primary, #0B57D0)',
            animation: 'skSpin 0.8s linear infinite',
          }}
        />

        {/* Text */}
        <p className="text-sm text-outline/60 font-medium tracking-wide">
          Cargando perfil…
        </p>
      </div>

      <style>{`
        @keyframes skSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

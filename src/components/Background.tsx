import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] bg-[var(--md-sys-color-background)] transition-colors duration-300">
      {/* Subtle organic pattern can be added here if needed, but keeping it clean for M3 */}
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DesignSystemView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8">
      <button
        onClick={() => navigate('/')}
        className="btn btn--outline mb-8"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Design System</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex gap-4">
          <button className="btn btn--primary btn--sm">Primary Small</button>
          <button className="btn btn--primary btn--md">Primary Medium</button>
          <button className="btn btn--primary btn--lg">Primary Large</button>
        </div>
        <div className="flex gap-4 mt-4">
          <button className="btn btn--secondary btn--md">Secondary</button>
          <button className="btn btn--outline btn--md">Outline</button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Colors</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 rounded-lg" style={{ background: 'var(--color-primary)' }}></div>
          <div className="h-24 rounded-lg" style={{ background: 'var(--color-secondary)' }}></div>
          <div className="h-24 rounded-lg" style={{ background: 'var(--color-error)' }}></div>
          <div className="h-24 rounded-lg" style={{ background: 'var(--color-success)' }}></div>
        </div>
      </section>
    </div>
  );
}

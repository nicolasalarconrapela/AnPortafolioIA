import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="btn btn--outline mb-8"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg">
        <p className="mb-4">
          This is a placeholder for the privacy policy content.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Collection</h2>
        <p className="mb-4">
          Information about what data we collect...
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Usage</h2>
        <p className="mb-4">
          How we use your data...
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { useConsent } from './ConsentContext';

export function ConsentUI() {
  const { isModalOpen, consent, savePreferences, closeModal } = useConsent();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold mb-4">Cookie Settings</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We use cookies to improve your experience. Please select your preferences.
        </p>

        <div className="space-y-4 mb-6">
          <label className="flex items-center justify-between">
            <span>Necessary (always on)</span>
            <input type="checkbox" checked disabled className="ml-2" />
          </label>

          <label className="flex items-center justify-between">
            <span>Analytics</span>
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(e) => savePreferences({ analytics: e.target.checked })}
              className="ml-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Marketing</span>
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(e) => savePreferences({ marketing: e.target.checked })}
              className="ml-2"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => savePreferences({ analytics: false, marketing: false })}
            className="btn btn--outline flex-1"
          >
            Reject All
          </button>
          <button
            onClick={() => savePreferences({ analytics: true, marketing: true })}
            className="btn btn--primary flex-1"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

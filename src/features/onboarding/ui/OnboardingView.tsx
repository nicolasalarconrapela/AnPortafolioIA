import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingView() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold mb-6 text-center">Welcome! Let's set up your profile</h1>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Step 1: Basic Information</h2>
                        <p className="text-gray-600">Tell us about yourself...</p>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/candidate')}
                        className="btn btn--primary w-full btn--lg"
                    >
                        Complete Onboarding
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="btn btn--outline w-full"
                    >
                        Exit to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecruiterFlow() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn--outline"
                    >
                        Exit
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-6">Manage Candidates</h2>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                    <p className="text-gray-600">Recruiter tools will be implemented here...</p>
                </div>
            </main>
        </div>
    );
}

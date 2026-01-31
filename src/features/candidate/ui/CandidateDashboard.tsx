import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CandidateDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: Implementar logout real
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Candidate Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="btn btn--outline"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">My Profile</h2>
                        <p className="text-gray-600">Manage your information</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">Applications</h2>
                        <p className="text-gray-600">Track your job applications</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">Interviews</h2>
                        <p className="text-gray-600">Upcoming interviews</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

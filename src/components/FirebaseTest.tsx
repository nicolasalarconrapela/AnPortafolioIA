import React, { useState } from 'react';
import { loggingService } from '../utils/loggingService';

interface FirebaseTestProps {
    backendUrl?: string;
}

export const FirebaseTest: React.FC<FirebaseTestProps> = ({
    backendUrl = 'http://localhost:3001'
}) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runHelloWorldTest = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${backendUrl}/api/test/hello-world`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Hello from AnPortafolioIA UI! 🚀'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
            loggingService.info('Firebase Hello World test successful!', data);
        } catch (err: any) {
            const errorMsg = err.message || 'Unknown error';
            setError(errorMsg);
            loggingService.error('Firebase Hello World test failed', { error: err });
        } finally {
            setLoading(false);
        }
    };

    const runComprehensiveTest = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${backendUrl}/api/test/comprehensive`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
            loggingService.info('Firebase comprehensive test completed!', data);
        } catch (err: any) {
            const errorMsg = err.message || 'Unknown error';
            setError(errorMsg);
            loggingService.error('Firebase comprehensive test failed', { error: err });
        } finally {
            setLoading(false);
        }
    };

    const listTestDocuments = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${backendUrl}/api/test/hello-world`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
            loggingService.info('Retrieved test documents', data);
        } catch (err: any) {
            const errorMsg = err.message || 'Unknown error';
            setError(errorMsg);
            loggingService.error('Failed to list test documents', { error: err });
        } finally {
            setLoading(false);
        }
    };

    const cleanupTestDocuments = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${backendUrl}/api/test/hello-world`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
            loggingService.info('Test documents cleaned up', data);
        } catch (err: any) {
            const errorMsg = err.message || 'Unknown error';
            setError(errorMsg);
            loggingService.error('Cleanup failed', { error: err });
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        // Render summary for comprehensive test
        if (result.summary) {
            return (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
                        {result.summary.overall}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {result.summary.passed}/{result.summary.total} tests passed ({result.summary.percentage}%)
                    </p>

                    <div className="space-y-2">
                        {Object.entries(result.tests).map(([testName, testResult]: [string, any]) => (
                            <div
                                key={testName}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                            >
                                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                    {testName}
                                </span>
                                <span className="text-lg">
                                    {testResult.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Render for hello world or list
        return (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    🔥 Firebase Connection Tester
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quick tests to validate Firebase/Firestore connection
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                    Backend: {backendUrl}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <button
                    onClick={runHelloWorldTest}
                    disabled={loading}
                    className="px-4 py-3 text-sm font-medium rounded-lg border-2 border-green-500 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? '⏳ Testing...' : '✨ Hello World Test'}
                </button>

                <button
                    onClick={runComprehensiveTest}
                    disabled={loading}
                    className="px-4 py-3 text-sm font-medium rounded-lg border-2 border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? '⏳ Testing...' : '🔬 Comprehensive Test'}
                </button>

                <button
                    onClick={listTestDocuments}
                    disabled={loading}
                    className="px-4 py-3 text-sm font-medium rounded-lg border-2 border-purple-500 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? '⏳ Loading...' : '📋 List Test Docs'}
                </button>

                <button
                    onClick={cleanupTestDocuments}
                    disabled={loading}
                    className="px-4 py-3 text-sm font-medium rounded-lg border-2 border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-800/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? '⏳ Cleaning...' : '🧹 Clean Up'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                    <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                        ❌ Error
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                        {error}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                        Tip: Make sure the backend is running on {backendUrl}
                    </p>
                </div>
            )}

            {result && !error && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                    <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-1">
                        ✅ {result.message || 'Operation successful'}
                    </h4>
                </div>
            )}

            {renderResult()}

            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-600">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    💡 Tips
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>Run "Hello World Test" first to verify basic connectivity</li>
                    <li>"Comprehensive Test" validates all CRUD operations</li>
                    <li>Check Firebase Console → Firestore to see created documents</li>
                    <li>Use "Clean Up" to remove test documents after testing</li>
                    <li>See FIREBASE_SETUP.md for detailed configuration instructions</li>
                </ul>
            </div>
        </div>
    );
};

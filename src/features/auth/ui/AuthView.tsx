import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthViewProps {
  userType?: 'candidate' | 'recruiter';
  initialMode?: 'login' | 'register';
}

export default function AuthView({ userType = 'candidate', initialMode = 'login' }: AuthViewProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleAuth = () => {
    // TODO: Implementar lógica de autenticación real
    if (userType === 'candidate') {
      if (mode === 'login') {
        navigate('/dashboard/candidate');
      } else {
        navigate('/onboarding');
      }
    } else {
      navigate('/dashboard/recruiter');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {mode === 'login' ? 'Sign In' : 'Sign Up'} as {userType === 'candidate' ? 'Candidate' : 'Recruiter'}
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary w-full btn--lg"
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-gray-600 hover:text-gray-800 w-full"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

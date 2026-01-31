import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Spinner } from '@/shared/ui/Spinner';

// Lazy imports
const LandingView = lazy(() => import('@/features/landing/ui/LandingView'));
const AuthView = lazy(() => import('@/features/auth/ui/AuthView'));
const OnboardingView = lazy(() => import('@/features/onboarding/ui/OnboardingView'));
const CandidateDashboard = lazy(() => import('@/features/candidate/ui/CandidateDashboard'));
const RecruiterFlow = lazy(() => import('@/features/recruiter/ui/RecruiterFlow'));
const DesignSystemView = lazy(() => import('@/features/design-system/ui/DesignSystemView'));
const PrivacyPolicyView = lazy(() => import('@/features/legal/ui/PrivacyPolicyView'));

// Layouts con Error Boundaries
function PublicLayout() {
    return (
        <ErrorBoundary fallback={<div className="error-container">Error en rutas públicas</div>}>
            <Suspense fallback={<Spinner />}>
                <Outlet />
            </Suspense>
        </ErrorBoundary>
    );
}

function AuthenticatedLayout() {
    return (
        <ErrorBoundary fallback={<div className="error-container">Error en rutas autenticadas</div>}>
            <Suspense fallback={<Spinner />}>
                <Outlet />
            </Suspense>
        </ErrorBoundary>
    );
}

const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            { path: '/', element: <LandingView /> },
            { path: '/auth/candidate', element: <AuthView userType="candidate" initialMode="login" /> },
            { path: '/auth/candidate/register', element: <AuthView userType="candidate" initialMode="register" /> },
            { path: '/auth/recruiter', element: <AuthView userType="recruiter" initialMode="login" /> },
            { path: '/design-system', element: <DesignSystemView /> },
            { path: '/privacy-policy', element: <PrivacyPolicyView /> },
        ],
    },
    {
        element: <AuthenticatedLayout />,
        children: [
            { path: '/onboarding', element: <OnboardingView /> },
            { path: '/dashboard/candidate', element: <CandidateDashboard /> },
            { path: '/dashboard/recruiter', element: <RecruiterFlow /> },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}

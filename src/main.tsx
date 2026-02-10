import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loggingService } from './utils/loggingService';

loggingService.info("Main entry point loaded");

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// Fix: Use React.Component explicitly from named import to ensure 'this.props' and 'this.state' are correctly typed via generic usage
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        loggingService.error("Uncaught error", { error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red' }}>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error?.toString()}</pre>
                </div>
            );
        }
        // Fix: children is now correctly available on this.props via Component inheritance
        return this.props.children;
    }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

loggingService.info("Mounting React root...");

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);

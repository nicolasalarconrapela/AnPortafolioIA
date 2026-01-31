import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/shared/api/queryClient';
import { AppRouter } from './router';
import { ConsentProvider } from '@/shared/consent/ConsentContext';
import { ConsentUI } from '@/shared/consent/ConsentUI';
import { Background } from '@/shared/ui/Background';

export function AppProviders() {
    return (
        <QueryClientProvider client={queryClient}>
            <ConsentProvider>
                <Background />
                <ConsentUI />
                <AppRouter />
                <ReactQueryDevtools initialIsOpen={false} />
            </ConsentProvider>
        </QueryClientProvider>
    );
}

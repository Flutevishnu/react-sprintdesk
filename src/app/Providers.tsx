import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from '../shared/lib/queryClient.ts';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = createQueryClient();

export default function AppProviders({children} : {children: React.ReactNode}) { 
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
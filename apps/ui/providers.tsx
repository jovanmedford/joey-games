'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { SocketProvider } from './src/app/socket-context';

export function Providers({ children }: { children: any }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        {children}
        <ReactQueryDevtools />
      </SocketProvider>
    </QueryClientProvider>
  );
}

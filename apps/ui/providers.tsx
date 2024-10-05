'use client';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { JoeyGamesError } from '@joey-games/lib';
import { useToast } from '@chakra-ui/react';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: JoeyGamesError;
  }
}

export function Providers({ children }: { children: any }) {
  const toast = useToast();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            switch (error.status) {
              case 403:
              case 401:
                if (window.location.href !== '/') {
                  window.location.href = '/';
                }
                break;
              default:
                toast({
                  title: 'Error',
                  description: error.message,
                  status: 'error',
                  duration: 9000,
                  isClosable: true,
                });
            }
          },
        }),
        queryCache: new QueryCache({
          onError: (error) => {
            switch (error.status) {
              case 403:
              case 401:
                // window.location.href = '/';
                break;
              default:
                toast({
                  title: 'Error',
                  description: error.message,
                  status: 'error',
                  duration: 9000,
                  isClosable: true,
                });
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error.status && error.status >= 500) {
                return true;
              }
              return false;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

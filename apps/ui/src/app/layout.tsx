import './global.css';
import { ChakraProvider } from '@chakra-ui/react';
import { Providers } from 'apps/ui/providers';

export const metadata = {
  title: 'Welcome to ui',
  description: 'Generated by create-nx-workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ChakraProvider>{children}</ChakraProvider>
        </Providers>
      </body>
    </html>
  );
}

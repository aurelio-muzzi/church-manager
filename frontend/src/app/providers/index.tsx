import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthProvider } from '@/modules/authentication/AuthProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="churchmanager-theme">
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

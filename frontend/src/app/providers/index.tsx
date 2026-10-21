import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/feedback/ToastProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="churchmanager-theme">
      <QueryProvider>
        <ToastProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

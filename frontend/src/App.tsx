import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { FoundationPage } from './pages/FoundationPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <FoundationPage />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { FoundationPage } from './pages/FoundationPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="app-container">
        <Header />
        <FoundationPage />
      </div>
    </ThemeProvider>
  );
};

export default App;

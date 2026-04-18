import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './lib/theme';
import { I18nProvider } from './lib/i18n';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <Toaster position="top-right" />
          <App />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

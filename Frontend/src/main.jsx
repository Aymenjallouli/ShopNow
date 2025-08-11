
import { createRoot } from 'react-dom/client';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import './i18n';
import store from './app/store';
import { PerformanceProvider } from './context/PerformanceContext';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

// Initialiser le monitoring des Web Vitals en développement
if (import.meta.env.DEV) {
  import('./utils/webVitalsMonitor.js').then(({ default: WebVitalsMonitor }) => {
    new WebVitalsMonitor();
  });
}

// Enregistrer le Service Worker pour les performances
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🚀 Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PerformanceProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </Provider>
    </PerformanceProvider>
  </React.StrictMode>
);

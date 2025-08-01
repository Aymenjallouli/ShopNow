// Configuration Vite optimisée pour les performances
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Optimisations React
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          // Plugin pour optimiser les re-renders
          ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
        ]
      }
    })
  ],
  
  // Optimisations de build
  build: {
    // Optimiser pour les performances
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'] // Fonctions pures à supprimer
      }
    },
    
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['lucide-react'],
          maps: ['mapbox-gl']
        }
      }
    },
    
    // Optimisations de bundle
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Désactiver les sourcemaps en production
  },
  
  // Optimisations du serveur de développement
  server: {
    // Préchargement des modules
    hmr: {
      overlay: false // Désactiver l'overlay d'erreur pour de meilleures performances
    }
  },
  
  // Optimisations de dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux'
    ],
    exclude: [
      // Exclure les modules qui causent des problèmes de performance
    ]
  },
  
  // Définir les variables d'environnement pour les optimisations
  define: {
    __PERFORMANCE_MODE__: JSON.stringify(process.env.VITE_MODE === 'performance'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  
  // Résolution des chemins
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks')
    }
  }
});

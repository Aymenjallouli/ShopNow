import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Optimiser React avec SWC
      babel: {
        plugins: [
          // Optimiser les re-renders
          ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }]
        ]
      }
    })
  ],
  
  // Configuration optimale de build
  build: {
    // Optimiser les chunks
    rollupOptions: {
      output: {
        // Split vendor chunks pour un meilleur caching
        manualChunks: {
          // Bibliothèques React core
          'react-vendor': ['react', 'react-dom'],
          
          // Redux et state management
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          
          // UI Libraries
          'ui-vendor': ['@heroicons/react', '@headlessui/react'],
          
          // Router
          'router-vendor': ['react-router-dom'],
          
          // Utilities
          'utils-vendor': ['axios', 'react-toastify'],
          
          // Payment et Maps
          'external-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js', 'mapbox-gl']
        },
        
        // Optimiser les noms de fichiers pour le caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Optimisations de minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Supprimer les console.log en production
        drop_console: true,
        drop_debugger: true,
        // Optimisations agressives
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // Supprimer le code mort
        dead_code: true,
        // Optimiser les conditions
        conditionals: true,
        // Optimiser les boucles
        loops: true
      },
      mangle: {
        // Optimiser les noms de variables
        safari10: true
      }
    },
    
    // Optimiser la taille des chunks
    chunkSizeWarningLimit: 800,
    
    // Optimiser les assets
    assetsInlineLimit: 4096,
    
    // Source maps conditionnels
    sourcemap: process.env.NODE_ENV === 'development'
  },
  
  // Optimisations pour le développement
  server: {
    // Hot Module Replacement optimisé
    hmr: {
      overlay: true
    },
    // Pré-bundling des dépendances
    force: true,
    // Headers pour Mapbox workers
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  },
  
  // Pre-bundling des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      '@headlessui/react',
      'axios',
      'react-toastify',
      'mapbox-gl'
    ],
    // Exclure les modules lourds du pre-bundling
    exclude: ['@stripe/stripe-js']
  },
  
  // Configuration des alias pour de meilleurs imports
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@context': '/src/context',
      '@features': '/src/features',
      '@services': '/src/services'
    }
  },
  
  // Variables d'environnement optimisées
  define: {
    // Optimiser les conditions de production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    // Configuration pour Mapbox
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  
  // Configuration CSS optimisée
  css: {
    // PostCSS optimisé
    postcss: {
      plugins: [
        // Optimiser Tailwind
        require('tailwindcss'),
        require('autoprefixer'),
        // Purger le CSS inutilisé en production
        ...(process.env.NODE_ENV === 'production' 
          ? [require('cssnano')({ preset: 'default' })]
          : []
        )
      ]
    },
    // Code splitting pour CSS
    codeSplit: true
  },
  
  // Configuration pour PWA
  ...(process.env.NODE_ENV === 'production' && {
    build: {
      ...this.build,
      rollupOptions: {
        ...this.build?.rollupOptions,
        external: ['@stripe/stripe-js'],
        output: {
          ...this.build?.rollupOptions?.output,
          // Service Worker
          manualChunks: {
            ...this.build?.rollupOptions?.output?.manualChunks,
            'sw-runtime': ['workbox-runtime-caching']
          }
        }
      }
    }
  })
});

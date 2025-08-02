#!/usr/bin/env node

/**
 * 🚀 Script d'optimisation des performances ShopNow
 * 
 * Ce script analyse et optimise automatiquement le projet pour:
 * - Bundle size optimization
 * - Image optimization
 * - Code splitting
 * - Dead code elimination
 * - Performance monitoring
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceOptimizer {
  constructor() {
    this.srcPath = path.join(__dirname, '../src');
    this.publicPath = path.join(__dirname, '../public');
    this.issues = [];
    this.fixes = [];
  }

  // Analyser les imports non utilisés
  analyzeUnusedImports() {
    console.log('🔍 Analyzing unused imports...');
    
    const getAllFiles = (dir, fileList = []) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          getAllFiles(filePath, fileList);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
          fileList.push(filePath);
        }
      });
      return fileList;
    };

    const jsFiles = getAllFiles(this.srcPath);
    const importAnalysis = {};

    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const imports = content.match(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/g) || [];
      
      imports.forEach(importLine => {
        const matches = importLine.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
        if (matches) {
          const [, importedItems, fromModule] = matches;
          const items = importedItems.split(',').map(item => item.trim());
          
          items.forEach(item => {
            const regex = new RegExp(`\\b${item}\\b`, 'g');
            const usage = (content.match(regex) || []).length;
            
            if (usage <= 1) { // Seulement l'import, pas d'utilisation
              this.issues.push({
                type: 'unused-import',
                file: file.replace(this.srcPath, ''),
                item,
                module: fromModule
              });
            }
          });
        }
      });
    });

    console.log(`❌ Found ${this.issues.filter(i => i.type === 'unused-import').length} unused imports`);
  }

  // Analyser la taille des composants
  analyzeComponentSize() {
    console.log('📏 Analyzing component sizes...');
    
    const componentPath = path.join(this.srcPath, 'components');
    if (!fs.existsSync(componentPath)) return;

    const components = fs.readdirSync(componentPath);
    
    components.forEach(component => {
      const componentFullPath = path.join(componentPath, component);
      if (fs.statSync(componentFullPath).isDirectory()) {
        const files = fs.readdirSync(componentFullPath);
        let totalSize = 0;
        
        files.forEach(file => {
          const filePath = path.join(componentFullPath, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        });
        
        if (totalSize > 10000) { // Plus de 10KB
          this.issues.push({
            type: 'large-component',
            component,
            size: totalSize,
            path: componentFullPath
          });
        }
      }
    });

    console.log(`📊 Found ${this.issues.filter(i => i.type === 'large-component').length} large components`);
  }

  // Analyser les images non optimisées
  analyzeImages() {
    console.log('🖼️ Analyzing images...');
    
    const findImages = (dir) => {
      const images = [];
      if (!fs.existsSync(dir)) return images;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          images.push(...findImages(filePath));
        } else if (/\.(jpg|jpeg|png|gif|svg)$/i.test(file)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 500000) { // Plus de 500KB
            images.push({
              path: filePath,
              size: stats.size,
              name: file
            });
          }
        }
      });
      return images;
    };

    const largeImages = findImages(this.publicPath);
    largeImages.forEach(img => {
      this.issues.push({
        type: 'large-image',
        ...img
      });
    });

    console.log(`🖼️ Found ${largeImages.length} large images`);
  }

  // Générer les optimisations automatiques
  generateOptimizations() {
    console.log('⚡ Generating optimization suggestions...');

    // Créer un rapport d'optimisation
    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      suggestions: []
    };

    // Suggestions basées sur les problèmes trouvés
    const unusedImports = this.issues.filter(i => i.type === 'unused-import');
    if (unusedImports.length > 0) {
      report.suggestions.push({
        type: 'remove-unused-imports',
        priority: 'high',
        description: `Remove ${unusedImports.length} unused imports to reduce bundle size`,
        impact: 'Bundle size reduction'
      });
    }

    const largeComponents = this.issues.filter(i => i.type === 'large-component');
    if (largeComponents.length > 0) {
      report.suggestions.push({
        type: 'split-large-components',
        priority: 'medium',
        description: `Split ${largeComponents.length} large components for better performance`,
        impact: 'Faster initial load, better code splitting'
      });
    }

    const largeImages = this.issues.filter(i => i.type === 'large-image');
    if (largeImages.length > 0) {
      report.suggestions.push({
        type: 'optimize-images',
        priority: 'high',
        description: `Optimize ${largeImages.length} large images`,
        impact: 'Faster page load, reduced bandwidth usage'
      });
    }

    // Suggestions générales
    report.suggestions.push(
      {
        type: 'implement-code-splitting',
        priority: 'high',
        description: 'Implement React.lazy and Suspense for route-based code splitting',
        impact: 'Reduced initial bundle size'
      },
      {
        type: 'add-service-worker',
        priority: 'medium',
        description: 'Add service worker for caching and offline support',
        impact: 'Better user experience, faster repeat visits'
      },
      {
        type: 'optimize-redux',
        priority: 'medium',
        description: 'Use RTK Query for better caching and data fetching',
        impact: 'Reduced unnecessary re-renders'
      }
    );

    // Sauvegarder le rapport
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Performance report saved to: ${reportPath}`);
    return report;
  }

  // Appliquer les corrections automatiques
  applyAutomaticFixes() {
    console.log('🔧 Applying automatic fixes...');

    // Créer un fichier d'optimisation Vite
    const viteOptimizations = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['@heroicons/react', '@headlessui/react'],
          router: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux']
  }
});
`;

    const viteConfigPath = path.join(__dirname, '../vite.config.optimized.js');
    fs.writeFileSync(viteConfigPath, viteOptimizations);
    
    console.log('✅ Created optimized Vite config');

    // Créer un composant LazyRoute pour le code splitting
    const lazyRouteComponent = `
import React, { Suspense, lazy } from 'react';
import Loader from './Loader';

const LazyRoute = ({ component: Component, ...props }) => {
  const LazyComponent = lazy(() => import(Component));
  
  return (
    <Suspense fallback={<Loader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyRoute;
`;

    const lazyRoutePath = path.join(this.srcPath, 'components/LazyRoute.jsx');
    fs.writeFileSync(lazyRoutePath, lazyRouteComponent);
    
    console.log('✅ Created LazyRoute component');
  }

  // Exécuter l'analyse complète
  run() {
    console.log('🚀 Starting performance optimization analysis...\n');
    
    this.analyzeUnusedImports();
    this.analyzeComponentSize();
    this.analyzeImages();
    
    const report = this.generateOptimizations();
    this.applyAutomaticFixes();
    
    console.log('\n📊 OPTIMIZATION SUMMARY:');
    console.log(`❌ Issues found: ${this.issues.length}`);
    console.log(`💡 Suggestions: ${report.suggestions.length}`);
    console.log(`🔧 Automatic fixes applied: 2`);
    
    console.log('\n🏆 NEXT STEPS:');
    report.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.description}`);
      console.log(`   Impact: ${suggestion.impact}\n`);
    });
    
    console.log('✅ Performance optimization analysis complete!');
  }
}

// Exécuter l'optimiseur
const optimizer = new PerformanceOptimizer();
optimizer.run();

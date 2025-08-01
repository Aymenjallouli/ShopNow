#!/usr/bin/env node

/**
 * Script de démarrage optimisé pour les performances
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du mode performance optimisé...\n');

// Variables d'environnement pour les optimisations
const env = {
  ...process.env,
  NODE_ENV: 'development',
  VITE_MODE: 'performance',
  VITE_PERFORMANCE_MONITORING: 'true',
  VITE_LAZY_LOADING: 'true',
  VITE_PRELOAD_CRITICAL: 'true'
};

// Lancer Vite avec la configuration optimisée
const viteProcess = spawn('npx', [
  'vite',
  '--config',
  'vite.config.performance.js',
  '--host',
  '--port',
  '3000'
], {
  env,
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Processus terminé avec le code ${code}`);
    process.exit(code);
  }
});

// Afficher les métriques de performance après le démarrage
setTimeout(() => {
  console.log('\n📊 Conseils pour tester les performances:');
  console.log('1. Ouvrez http://localhost:3000/checkout');
  console.log('2. Ouvrez les DevTools (F12)');
  console.log('3. Allez dans l\'onglet Performance ou Lighthouse');
  console.log('4. Surveillez la console pour les métriques temps réel');
  console.log('5. Utilisez Ctrl+Shift+P puis "Show Coverage" pour analyser le code');
  console.log('\n🎯 Métriques cibles:');
  console.log('- LCP < 2.5s');
  console.log('- CLS < 0.1');
  console.log('- INP < 200ms');
  console.log('- Pas de boucles infinites dans les calculs de livraison\n');
}, 3000);

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  viteProcess.kill('SIGTERM');
});

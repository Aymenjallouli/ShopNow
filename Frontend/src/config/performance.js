// Configuration d'optimisation des performances
export const PERFORMANCE_CONFIG = {
  // Debounce delays (en millisecondes)
  DELIVERY_CALCULATION_DELAY: 1000, // 1 seconde
  PAYMENT_INTENT_DELAY: 500, // 0.5 seconde
  
  // Cache des requêtes
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Réduction des appels API
  MAX_RETRY_ATTEMPTS: 2,
  
  // Optimisation React
  MEMO_DEPENDENCIES_CHECK: true,
};

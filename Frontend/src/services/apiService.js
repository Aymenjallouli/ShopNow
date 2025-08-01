// Service de gestion des requêtes API optimisées
class ApiService {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
    this.defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // Méthode générique pour les requêtes avec cache
  async request(key, requestFn, cacheDuration = this.defaultCacheDuration) {
    // Vérifier le cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }

    // Vérifier si la requête est en cours
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    // Exécuter la requête
    const promise = requestFn()
      .then(data => {
        // Mettre en cache
        this.cache.set(key, {
          data,
          timestamp: Date.now()
        });
        // Supprimer des requêtes en cours
        this.pending.delete(key);
        return data;
      })
      .catch(error => {
        // Supprimer des requêtes en cours même en cas d'erreur
        this.pending.delete(key);
        throw error;
      });

    // Ajouter aux requêtes en cours
    this.pending.set(key, promise);
    return promise;
  }

  // Vider le cache
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Nettoyer le cache expiré
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.defaultCacheDuration) {
        this.cache.delete(key);
      }
    }
  }
}

// Instance singleton
const apiService = new ApiService();

// Nettoyer le cache expiré toutes les 5 minutes
setInterval(() => {
  apiService.cleanExpiredCache();
}, 5 * 60 * 1000);

export default apiService;

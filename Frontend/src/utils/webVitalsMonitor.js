/**
 * Script de test pour mesurer les Core Web Vitals
 * Utilise l'API Performance Observer pour surveiller LCP, CLS, et INP
 */

class WebVitalsMonitor {
  constructor() {
    this.metrics = {
      lcp: null,
      cls: null,
      inp: null,
      fcp: null,
      ttfb: null
    };
    
    this.thresholds = {
      lcp: { good: 2.5, needsImprovement: 4.0 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      inp: { good: 200, needsImprovement: 500 },
      fcp: { good: 1.8, needsImprovement: 3.0 },
      ttfb: { good: 800, needsImprovement: 1800 }
    };

    this.observers = [];
    this.init();
  }

  init() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('Performance Observer not supported');
      return;
    }

    this.measureLCP();
    this.measureCLS();
    this.measureINP();
    this.measureFCP();
    this.measureTTFB();
    this.setupReporting();
  }

  measureLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.lcp = {
          value: lastEntry.startTime,
          entries: lastEntry,
          element: lastEntry.element,
          timestamp: Date.now()
        };

        this.logMetric('LCP', this.metrics.lcp.value, 'ms');
        this.checkLCPOptimization(lastEntry);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP measurement failed:', error);
    }
  }

  measureCLS() {
    let clsValue = 0;
    let clsSources = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsSources.push(...(entry.sources || []));
            
            this.metrics.cls = {
              value: clsValue,
              sources: clsSources,
              timestamp: Date.now()
            };

            this.logMetric('CLS', clsValue);
            this.analyzeCLS(entry);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS measurement failed:', error);
    }
  }

  measureINP() {
    let interactions = [];
    
    try {
      // Mesurer les interactions au clic
      document.addEventListener('click', (event) => {
        const startTime = performance.now();
        
        requestIdleCallback(() => {
          const duration = performance.now() - startTime;
          interactions.push({
            type: 'click',
            target: event.target,
            duration,
            timestamp: Date.now()
          });

          // Garder seulement les 10 dernières interactions
          if (interactions.length > 10) {
            interactions = interactions.slice(-10);
          }

          // Calculer INP (percentile 98 des interactions)
          const sortedDurations = interactions.map(i => i.duration).sort((a, b) => b - a);
          const inp = sortedDurations[Math.floor(sortedDurations.length * 0.98)] || 0;

          this.metrics.inp = {
            value: inp,
            interactions,
            timestamp: Date.now()
          };

          this.logMetric('INP', inp, 'ms');
        });
      });

      // Observer les événements de performance pour INP natif si disponible
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            this.metrics.inp = {
              value: entry.processingStart - entry.startTime,
              entry,
              timestamp: Date.now()
            };
            this.logMetric('FID (Fallback for INP)', this.metrics.inp.value, 'ms');
          }
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('INP measurement failed:', error);
    }
  }

  measureFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = {
              value: entry.startTime,
              entry,
              timestamp: Date.now()
            };
            this.logMetric('FCP', this.metrics.fcp.value, 'ms');
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP measurement failed:', error);
    }
  }

  measureTTFB() {
    try {
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        this.metrics.ttfb = {
          value: ttfb,
          entry: navEntry,
          timestamp: Date.now()
        };
        this.logMetric('TTFB', ttfb, 'ms');
      }
    } catch (error) {
      console.warn('TTFB measurement failed:', error);
    }
  }

  logMetric(name, value, unit = '') {
    const threshold = this.thresholds[name.toLowerCase()];
    let status = '❓';
    
    if (threshold) {
      if (value <= threshold.good) {
        status = '✅ Good';
      } else if (value <= threshold.needsImprovement) {
        status = '⚠️ Needs Improvement';
      } else {
        status = '❌ Poor';
      }
    }

    console.log(`%c${name}: ${value.toFixed(2)}${unit} ${status}`, 
      'font-weight: bold; color: #059669;');
  }

  checkLCPOptimization(entry) {
    const element = entry.element;
    if (!element) return;

    const suggestions = [];

    // Vérifier si l'élément LCP est une image
    if (element.tagName === 'IMG') {
      if (!element.loading || element.loading !== 'eager') {
        suggestions.push('Ajouter loading="eager" à l\'image LCP');
      }
      if (!element.fetchPriority || element.fetchPriority !== 'high') {
        suggestions.push('Ajouter fetchpriority="high" à l\'image LCP');
      }
      if (!element.width || !element.height) {
        suggestions.push('Définir width et height pour éviter CLS');
      }
    }

    // Vérifier si l'élément est visible immédiatement
    const rect = element.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      suggestions.push('L\'élément LCP n\'est pas dans le viewport initial');
    }

    if (suggestions.length > 0) {
      console.group('💡 Suggestions d\'optimisation LCP:');
      suggestions.forEach(suggestion => console.log(`• ${suggestion}`));
      console.groupEnd();
    }
  }

  analyzeCLS(entry) {
    if (entry.value > 0.1) {
      console.group(`🚨 Layout Shift Important (${entry.value.toFixed(4)}):`);
      
      entry.sources?.forEach((source, index) => {
        const element = source?.node || null;
        // Some layout shift sources can reference removed nodes or text nodes.
        const isElement = element && element.nodeType === 1; // ELEMENT_NODE

        console.log(`Source ${index + 1}:`, {
          node: element,
          previousRect: source.previousRect,
            currentRect: source.currentRect,
            nodeType: element?.nodeType,
            tag: isElement ? element.tagName : null
        });

        if (!isElement) {
          // Skip suggestions if not a valid element
          return;
        }

        // Defensive try/catch in case the DOM mutates during logging
        try {
          if (element.tagName === 'IMG' && (!element.getAttribute('width') || !element.getAttribute('height')) && !(element.style.aspectRatio || element.style.width && element.style.height)) {
            console.log('💡 Suggestion: Définir width/height ou aspect-ratio pour cette image (prévenir CLS)');
          }
          if (element.tagName === 'DIV' && !element.style.minHeight && (source.previousRect?.height !== source.currentRect?.height)) {
            console.log('💡 Suggestion: Réserver l\'espace (min-height) pour ce conteneur');
          }
        } catch(e) {
          console.debug('Analyse CLS élément ignorée (mutation concurrente):', e);
        }
      });
      
      console.groupEnd();
    }
  }

  setupReporting() {
    // Rapport périodique
    setInterval(() => {
      this.generateReport();
    }, 10000); // Toutes les 10 secondes

    // Rapport final à la fermeture de la page
    window.addEventListener('beforeunload', () => {
      this.generateReport(true);
    });
  }

  generateReport(final = false) {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: {},
      final
    };

    // Compiler les métriques
    Object.keys(this.metrics).forEach(key => {
      const metric = this.metrics[key];
      if (metric) {
        const threshold = this.thresholds[key];
        let rating = 'unknown';
        
        if (threshold && metric.value !== null) {
          if (metric.value <= threshold.good) {
            rating = 'good';
          } else if (metric.value <= threshold.needsImprovement) {
            rating = 'needs-improvement';
          } else {
            rating = 'poor';
          }
        }

        report.metrics[key] = {
          value: metric.value,
          rating,
          timestamp: metric.timestamp
        };
      }
    });

    // Afficher le rapport
    console.group(`📊 Web Vitals Report ${final ? '(Final)' : ''}`);
    console.table(report.metrics);
    console.groupEnd();

    // Envoyer à un service d'analyse si configuré
    if (window.webVitalsEndpoint) {
      fetch(window.webVitalsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      }).catch(err => console.warn('Failed to send Web Vitals report:', err));
    }

    return report;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Initialiser le monitoring automatiquement
if (typeof window !== 'undefined') {
  window.webVitalsMonitor = new WebVitalsMonitor();
  
  // API publique
  window.getWebVitals = () => window.webVitalsMonitor.getMetrics();
  window.reportWebVitals = () => window.webVitalsMonitor.generateReport();
}

export default WebVitalsMonitor;

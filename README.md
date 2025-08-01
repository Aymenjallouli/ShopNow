# 🛒 ShopNow - E-commerce Platform

Une plateforme e-commerce moderne et performante construite avec **Django REST Framework** et **React**, optimisée pour les performances et l'expérience utilisateur.

![ShopNow](https://img.shields.io/badge/Status-Active-brightgreen)
![Django](https://img.shields.io/badge/Django-4.2+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![Performance](https://img.shields.io/badge/LCP-<2.5s-green)

## 🚧 État du Projet

> **⚠️ Projet en Développement Actif**
> 
> ShopNow est actuellement en phase de développement avancé. Bien que les fonctionnalités principales soient opérationnelles, le projet continue d'évoluer avec de nouvelles améliorations régulières.

### 🆕 Dernières Mises à Jour (Août 2025)

#### ✅ Récemment Ajouté
- 🎨 **Refonte UI complète** avec design glassmorphism moderne
- 💳 **Intégration Flousi** - Nouveau système de paiement mobile tunisien
- 💳 **Intégration d17** - Support paiement mobile étendu
- 🗺️ **Mapbox avancé** - Géocodage automatique et calcul de routes
- ⚡ **Optimisations performance** - LCP réduit de 323s à <2.5s
- 🚚 **Système de livraison intelligent** - Support 24 gouvernorats tunisiens
- 📱 **Interface responsive** optimisée mobile-first
- 🔄 **Suivi commandes en temps réel** avec historique détaillé
- 🛒 **Panier & Wishlist** avec persistance avancée
- 🔐 **Sécurité renforcée** - JWT, CSRF, validation stricte

#### 🔄 En Cours de Développement
- 📊 **Dashboard analytics** avancé pour vendeurs
- 🤖 **Chatbot IA** pour support client
- 📱 **PWA** avec notifications push
- 🌍 **Support multi-langues** étendu (AR/EN/FR)
- 🎯 **Système de recommandations** basé sur l'IA

#### 📋 À Venir
- 🏪 **Marketplace multi-vendeurs**
- 📱 **Application mobile** React Native
- 🚁 **Livraison par drone** (zones pilotes)
- 💰 **Crypto payments** support
- 🎮 **Gamification** et programme de fidélité

## � Technologies Utilisées

### Backend
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Services Externes
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)

### Dépendances Principales

#### Backend
- **Django REST Framework** - API REST robuste
- **Django CORS Headers** - Gestion CORS
- **Pillow** - Traitement d'images
- **python-decouple** - Configuration environnement
- **djangorestframework-simplejwt** - Authentification JWT

#### Frontend
- **@reduxjs/toolkit** - Gestion d'état moderne
- **react-router-dom** - Navigation
- **@stripe/react-stripe-js** - Intégration Stripe
- **mapbox-gl** - Cartes interactives
- **lucide-react** - Icônes modernes
- **framer-motion** - Animations (optionnel)

## �🚀 Fonctionnalités Principales

### 🛍️ Commerce & Paiement
- **Gestion complète des produits** avec images multiples et catégories
- **Panier et wishlist** avec persistance et synchronisation temps réel
- **Système de checkout sécurisé** avec Stripe et d17 (paiement mobile tunisien)
- **Calcul automatique des frais de livraison** pour les 24 gouvernorats tunisiens
- **Suivi des commandes** en temps réel avec historique détaillé

### 🗺️ Système de Livraison Avancé
- **Intégration Mapbox** avec géocodage automatique des adresses
- **Carte interactive** avec marqueurs et calcul de distances
- **Zones de livraison optimisées** pour toute la Tunisie
- **Estimation des délais** basée sur la localisation
- **Fallback intelligent** si Mapbox n'est pas disponible

### 🎨 Interface Utilisateur
- **Design moderne** avec Tailwind CSS et glassmorphism
- **Interface responsive** optimisée mobile/desktop
- **Animations fluides** et micro-interactions
- **Mode sombre/clair** adaptatif
- **Composants réutilisables** et modulaires

### ⚡ Optimisations Performance
- **LCP < 2.5s** grâce aux optimisations critiques
- **Lazy loading intelligent** des images et composants
- **Cache API avancé** avec invalidation automatique
- **Debounce et throttling** pour les actions utilisateur
- **Code splitting** et préchargement des routes
- **Surveillance Web Vitals** en temps réel

## 🏗️ Architecture Technique

### Backend (Django)
```
Backend/
├── accounts/          # Gestion utilisateurs et authentification
├── api/              # API endpoints et serializers
├── cart/             # Gestion du panier
├── orders/           # Commandes et livraisons
├── payments/         # Intégration Stripe/d17
├── products/         # Catalogue produits
├── reviews/          # Système d'avis
└── shopnow/          # Configuration Django
```

### Frontend (React)
```
Frontend/src/
├── components/       # Composants réutilisables
├── pages/           # Pages principales
├── features/        # Redux slices
├── hooks/           # Hooks personnalisés
├── utils/           # Utilitaires et helpers
├── services/        # Services API
└── styles/          # Styles globaux
```

## ⚡ Démarrage Rapide

### Option 1: Installation Complète
```bash
# 1. Cloner le projet
git clone https://github.com/Aymenjallouli/ShopNow.git
cd ShopNow

# 2. Backend
cd Backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 3. Frontend (nouveau terminal)
cd ../Frontend
npm install
npm run dev
```

### Option 2: Démarrage Rapide avec Scripts
```bash
# Utiliser les scripts de démarrage automatique
npm run setup:full    # Setup complet
npm run dev:all       # Lancer backend + frontend
```

## 🛠️ Installation et Configuration

### Prérequis
- **Python 3.9+**
- **Node.js 18+**
- **MySQL/MariaDB**
- **Redis** (optionnel, pour le cache)

### 1. Backend (Django)

```bash
cd Backend/

# Créer un environnement virtuel
python -m venv shopnow_env
source shopnow_env/bin/activate  # Linux/Mac
# ou
shopnow_env\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configuration de la base de données
cp .env.example .env
# Configurer les variables dans .env

# Migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 2. Frontend (React)

```bash
cd Frontend/

# Installer les dépendances
npm install

# Configuration
cp .env.example .env
# Configurer les variables dans .env

# Lancer en mode développement
npm run dev

# Ou avec optimisations performance
node scripts/start-performance.js
```

### 3. Variables d'Environnement

#### Backend (.env)
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=mysql://user:password@localhost/shopnow
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
D17_API_KEY=your_d17_api_key
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token
VITE_SHOW_D17=true
VITE_PERFORMANCE_MONITORING=true
```

## 🎯 Optimisations Performance Implémentées

### 🚀 Frontend
- **CSS critique inline** pour éliminer le FOUC
- **Lazy loading avancé** avec intersection observer
- **Debounce intelligent** sur les calculs de livraison
- **Cache API** avec invalidation automatique
- **Composants mémorisés** avec React.memo
- **Code splitting** par routes et fonctionnalités
- **Préchargement des ressources critiques**

### 📊 Métriques Cibles
- **LCP**: < 2.5 secondes
- **CLS**: < 0.1
- **INP**: < 200ms
- **Taille du bundle**: < 500KB (gzippé)

### 🔧 Surveillance
```javascript
// Hooks de surveillance intégrés
const { markFeature } = usePerformanceMonitor();
const { renderCount } = useRenderOptimization('ComponentName');
```

## 🗺️ Intégration Mapbox

### Configuration
1. Créer un compte sur [Mapbox](https://mapbox.com)
2. Obtenir un token d'accès public
3. L'ajouter dans `VITE_MAPBOX_ACCESS_TOKEN`

### Fonctionnalités
- **Géocodage automatique** des adresses de livraison
- **Calcul de distances** et de routes optimales
- **Marqueurs interactifs** avec popup d'informations
- **Fallback gracieux** si le service n'est pas disponible

## 💳 Intégration Paiements

### Stripe (International)
- Configuration dans `STRIPE_SECRET_KEY` et `STRIPE_PUBLISHABLE_KEY`
- Support des cartes Visa, Mastercard, Amex
- Webhooks pour la confirmation des paiements

### d17 (Tunisie)
- Paiement mobile spécifique à la Tunisie
- Configuration dans `D17_API_KEY`
- Vérification automatique du statut

## 📱 Responsive Design

Le design s'adapte automatiquement :
- **Mobile First** avec breakpoints optimisés
- **Touch-friendly** avec zones de tap appropriées
- **Gestures** pour les interactions mobiles
- **PWA-ready** avec service workers (optionnel)

## 🧪 Tests et Qualité

### Tests Frontend
```bash
npm run test          # Tests unitaires
npm run test:e2e      # Tests end-to-end
npm run lighthouse    # Audit performance
```

### Tests Backend
```bash
python manage.py test
coverage run --source='.' manage.py test
coverage report
```

## 🚀 Déploiement

### Production Frontend
```bash
npm run build
npm run preview  # Test de production locale
```

### Production Backend
```bash
python manage.py collectstatic
python manage.py migrate --settings=shopnow.settings.production
gunicorn shopnow.wsgi:application
```

### Docker (Optionnel)
```bash
docker-compose up -d
```

## 📈 Monitoring et Analytics

- **Web Vitals** surveillés en temps réel
- **Erreurs JavaScript** trackées automatiquement
- **Performance API** pour les métriques détaillées
- **Redux DevTools** pour le débogage state

## 🔒 Sécurité

- **CSRF Protection** activée
- **CORS** configuré correctement
- **JWT Authentication** avec refresh tokens
- **Sanitisation** des inputs utilisateur
- **Rate limiting** sur les APIs critiques

## 🌐 Internationalisation

- Support **Français/Arabe** pour la Tunisie
- **RTL** support pour l'arabe
- **Formatage** des devises et dates locales
- **Validation** des numéros de téléphone tunisiens

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code
- **ESLint** + **Prettier** pour JavaScript
- **Black** + **isort** pour Python
- **Conventional Commits** pour les messages
- **Tests** requis pour les nouvelles fonctionnalités

## 📊 Métriques du Projet

- **Components React**: 25+
- **API Endpoints**: 30+
- **Gouvernorats supportés**: 24
- **Méthodes de paiement**: 2
- **Langues supportées**: 2
- **Performance Score**: 95+

## 🎨 Screenshots

### Page d'Accueil
![Homepage](docs/screenshots/homepage.png)

### Checkout avec Mapbox
![Checkout](docs/screenshots/checkout.png)

### Dashboard Admin
![Admin](docs/screenshots/admin-dashboard.png)

### Mobile Responsive
![Mobile](docs/screenshots/mobile-view.png)

## 🔮 Roadmap

### Version 2.0
- [ ] **Application mobile** avec React Native
- [ ] **Marketplace multi-vendeurs**
- [ ] **IA pour recommandations** personnalisées
- [ ] **Chatbot** support client
- [ ] **Livraison par drone** (zones pilotes)

### Version 1.5
- [ ] **PWA** avec notifications push
- [ ] **Mode hors-ligne** basique
- [ ] **Social login** (Google, Facebook)
- [ ] **Programme de fidélité**
- [ ] **Reviews avec photos**

## 👥 Équipe

- **[Aymen Jallouli]** - Full Stack Developer
- Contributeurs bienvenus !

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

- **Email**: [aymen.jallouli@esprit.tn]
- **Issues**: [GitHub Issues](https://github.com/Aymenjallouli/ShopNow/issues)

---

<div align="center">
  <p>Fait avec ❤️ en Tunisie 🇹🇳</p>
  <p>
    <a href="#top">⬆️ Retour en haut</a>
  </p>
</div>

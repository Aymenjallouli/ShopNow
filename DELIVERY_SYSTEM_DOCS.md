# 🚚 Système de Livraison ShopNow - Documentation

## 📋 Vue d'ensemble

Le système de livraison ShopNow a été entièrement implémenté avec une intégration Mapbox pour la géolocalisation, le calcul des frais, et le suivi des livraisons en temps réel.

## 🎯 Fonctionnalités Implémentées

### Backend (Django)

#### 1. Modèles de données
- **DeliveryZone** : Zones de livraison avec tarification personnalisée
  - `name` : Nom de la zone (ex: "Tunis Centre")
  - `base_price` : Prix de base en TND
  - `price_per_km` : Prix par kilomètre
  - `max_distance_km` : Distance maximale de livraison
  - `is_active` : Zone active/inactive

- **Delivery** : Informations de livraison pour chaque commande
  - Référence à la commande et l'utilisateur
  - Adresse complète de livraison avec coordonnées GPS
  - Zone de livraison et calcul automatique des frais
  - Statut de livraison avec historique
  - Numéro de suivi unique auto-généré
  - Temps estimé et réel de livraison

#### 2. API Endpoints
- `POST /orders/delivery/calculate/` : Calcul des frais de livraison
- `GET /orders/delivery/track/{tracking_number}/` : Suivi de livraison
- `GET /orders/delivery/map/{tracking_number}/` : Données pour la carte

#### 3. Zones de livraison pré-configurées
- **Tunis Centre** : 3 TND + 0.50 TND/km
- **Grand Tunis** : 5 TND + 0.75 TND/km
- **Sfax et région** : 7 TND + 1.00 TND/km
- **Sousse et région** : 6 TND + 0.80 TND/km
- **Nord de la Tunisie** : 8 TND + 1.20 TND/km
- **Sud de la Tunisie** : 12 TND + 1.50 TND/km

### Frontend (React)

#### 1. Composants de livraison

**DeliveryCalculator** (`src/components/DeliveryCalculator.jsx`)
- Calcul automatique des frais de livraison
- Affichage des zones disponibles
- Estimation du temps de livraison
- Interface utilisateur moderne avec animations

**MapboxDeliveryMap** (`src/components/MapboxDeliveryMap.jsx`)
- Carte interactive avec Mapbox GL JS
- Recherche d'adresses avec géocodage
- Affichage de l'entrepôt et des points de livraison
- Route de livraison en temps réel
- Contrôles de navigation intégrés

**DeliveryTracking** (`src/components/DeliveryTracking.jsx`)
- Suivi en temps réel des livraisons
- Historique détaillé des statuts
- Informations de contact
- Actions rapides (chat, signalement)

#### 2. Pages

**TrackingPage** (`src/pages/TrackingPage.jsx`)
- Page dédiée au suivi de livraison
- URL : `/tracking` et `/tracking/:trackingNumber`
- Intégration carte + suivi
- FAQ et support client

**Checkout amélioré** (`src/pages/Checkout.jsx`)
- Intégration du calculateur de livraison
- Carte Mapbox pour sélection d'adresse
- Calcul automatique du total avec livraison
- Validation des données de livraison

#### 3. Utilitaires

**priceUtils.js** (`src/utils/priceUtils.js`)
- Fonctions de formatage des prix
- Calculs sécurisés (évite NaN/undefined)
- Support multi-devises
- Validation des montants

## 🔧 Configuration

### Variables d'environnement

**Frontend (.env)**
```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYXltZW5qYWxsb3VsaWlpIiwiYSI6ImNtZHN3ODlrcTAyZmkyanNpZmxhdmRkMjIifQ.5FjnHnl3tNxvzDjdIBmSUg
VITE_API_URL=http://localhost:8000/api
```

### Dépendances installées
- `mapbox-gl` : Cartes interactives
- Intégration Django REST Framework existante

## 📱 Interface Utilisateur

### Design System unifié
- Couleurs cohérentes (emerald/slate palette)
- Animations fluides et transitions
- Cards avec backdrop-blur et transparence
- Icons contextuels et informatifs
- Layout responsive mobile-first

### Expérience utilisateur
- Calcul automatique lors de la saisie d'adresse
- Feedback visuel immédiat
- Gestion d'erreurs gracieuse
- Interface multilingue (français/anglais)

## 🚀 Commandes de gestion

### Backend
```bash
# Créer les migrations
python manage.py makemigrations orders

# Appliquer les migrations
python manage.py migrate orders

# Créer les zones de livraison par défaut
python manage.py create_delivery_zones

# Démarrer le serveur
python manage.py runserver
```

### Frontend
```bash
# Installer les dépendances
npm install mapbox-gl

# Démarrer le serveur de développement
npm run dev
```

## 🔄 Flux de livraison

1. **Commande** : L'utilisateur saisit son adresse dans le checkout
2. **Calcul** : Le système calcule automatiquement les frais via l'API
3. **Affichage** : La carte montre la route et les informations
4. **Paiement** : Le total inclut les frais de livraison
5. **Création** : Une entrée Delivery est créée avec numéro de suivi
6. **Suivi** : L'utilisateur peut suivre sa livraison en temps réel

## 🔮 Fonctionnalités futures

- [ ] Intégration avec transporteurs réels (API Colissimo, etc.)
- [ ] Notifications push pour les mises à jour de statut
- [ ] Planification de créneaux de livraison
- [ ] Points de relais et casiers automatiques
- [ ] Livraison express en 2h
- [ ] Éco-livraison (vélo, transport vert)
- [ ] Signature électronique à la livraison
- [ ] Photos de preuve de livraison

## 🛠️ Notes techniques

- Le système utilise des coordonnées simulées pour le moment
- L'intégration Mapbox est prête pour le géocodage réel
- Les calculs de distance utilisent la formule de Haversine
- Les frais sont calculés en temps réel selon la zone
- Support complet de l'internationalisation

## 📞 Support

Pour toute question technique :
- Email : support@shopnow.tn
- Téléphone : +216 XX XXX XXX
- Chat en direct intégré dans l'interface

---

*Système développé avec ❤️ pour ShopNow - E-commerce moderne pour la Tunisie*

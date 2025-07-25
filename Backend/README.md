# ShopNow - Backend E-commerce Django REST API

## Description
ShopNow est une API REST développée avec Django REST Framework pour une plateforme e-commerce. Cette API fournit toutes les fonctionnalités nécessaires pour gérer un site e-commerce, notamment la gestion des utilisateurs, des produits, du panier, des commandes, des paiements et des avis.

## Fonctionnalités
- Authentification JWT
- Gestion des utilisateurs personnalisés
- Catalogue de produits avec catégories
- Gestion du panier d'achat
- Processus de commande
- Intégration avec Stripe pour les paiements
- Système d'avis et de notation
- Gestion du stock
- API RESTful complète

## Prérequis
- Python 3.8+
- MySQL
- Stripe Account (pour les paiements)

## Installation

1. Cloner le dépôt :
```
git clone <repo-url>
cd ShopNow/Backend
```

2. Créer un environnement virtuel et l'activer :
```
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate
```

3. Installer les dépendances :
```
pip install -r requirements.txt
```

4. Configurer la base de données MySQL :
- Créer une base de données MySQL nommée `shopnow`
- Configurer les informations de connexion dans `settings.py`

5. Configurer les variables d'environnement :
- Créer un fichier `.env` à la racine du projet avec les variables suivantes :
```
SECRET_KEY=your_secret_key
DEBUG=True
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

6. Appliquer les migrations :
```
python manage.py makemigrations
python manage.py migrate
```

7. Créer un superutilisateur :
```
python manage.py createsuperuser
```

8. Lancer le serveur de développement :
```
python manage.py runserver
```

## Structure du projet
- `accounts` : Gestion des utilisateurs personnalisés
- `products` : Gestion des produits et catégories
- `cart` : Gestion du panier d'achat
- `orders` : Gestion des commandes
- `payments` : Gestion des paiements (intégration Stripe)
- `reviews` : Système d'avis et de notation
- `api` : Configuration des endpoints RESTful

## API Endpoints

### Authentification
- `POST /api/register/` : Inscription d'un nouvel utilisateur
- `POST /api/token/` : Obtention d'un token JWT
- `POST /api/token/refresh/` : Rafraîchissement d'un token JWT
- `POST /api/token/verify/` : Vérification d'un token JWT

### Utilisateurs
- `GET /api/users/me/` : Informations sur l'utilisateur connecté
- `PUT /api/users/update_profile/` : Mise à jour du profil utilisateur

### Produits
- `GET /api/categories/` : Liste des catégories
- `GET /api/products/` : Liste des produits
- `GET /api/products/{id}/` : Détails d'un produit
- `GET /api/products/featured/` : Liste des produits mis en avant
- `POST /api/products/{id}/review/` : Ajouter un avis sur un produit

### Panier
- `GET /api/cart/` : Afficher le panier
- `POST /api/cart/` : Ajouter un produit au panier
- `PUT /api/cart/{id}/` : Mettre à jour la quantité d'un article
- `DELETE /api/cart/{id}/` : Supprimer un article du panier
- `DELETE /api/cart/clear/` : Vider le panier
- `GET /api/cart/total/` : Total du panier

### Commandes
- `GET /api/orders/` : Liste des commandes de l'utilisateur
- `POST /api/orders/` : Créer une nouvelle commande
- `GET /api/orders/{id}/` : Détails d'une commande
- `POST /api/orders/{id}/cancel/` : Annuler une commande

### Paiements
- `POST /api/payments/create_payment_intent/` : Créer une intention de paiement Stripe
- `POST /api/payments/confirm_payment/` : Confirmer un paiement

## Documentation
Une documentation complète de l'API est disponible à l'adresse `/api/docs/` après le lancement du serveur.

## Technologies utilisées
- Django
- Django REST Framework
- JWT Authentication
- MySQL
- Stripe API
- CORS Headers

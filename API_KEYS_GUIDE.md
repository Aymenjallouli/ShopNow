# Guide d'obtention des clés API - Stripe et d17

## 🔐 Clés Stripe API

### Étape 1: Créer un compte Stripe

1. **Rendez-vous sur** [https://stripe.com](https://stripe.com)
2. **Cliquez sur "Start now"** ou "Commencer maintenant"
3. **Créez votre compte** avec votre email professionnel
4. **Vérifiez votre email** et complétez l'inscription

### Étape 2: Accéder au Dashboard

1. **Connectez-vous** à votre dashboard Stripe
2. **Activez le mode Test** (switch en haut à droite) pour commencer
3. **Allez dans "Developers" > "API keys"**

### Étape 3: Récupérer vos clés

#### Clés de Test (pour développement) :
- **Publishable key** : `pk_test_...` (utilisée côté frontend)
- **Secret key** : `sk_test_...` (utilisée côté backend)

#### Clés de Production (pour le site en live) :
- **Publishable key** : `pk_live_...` 
- **Secret key** : `sk_live_...`

### Étape 4: Configuration dans votre projet

#### Frontend (.env) :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
```

#### Backend (.env) :
```env
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

---

## 📱 Intégration d17 (Tunisie)

### À propos de d17

d17 est une solution de paiement mobile populaire en Tunisie qui permet aux utilisateurs de payer directement depuis leur téléphone mobile.

### Étape 1: Contacter d17

#### Options de contact :

1. **Site web officiel** : [https://www.d17.tn](https://www.d17.tn)
2. **Email commercial** : business@d17.tn
3. **Téléphone** : +216 XX XXX XXX (vérifiez sur leur site)

### Étape 2: Documentation technique

Demandez à d17 :
- 📋 **Documentation API complète**
- 🔑 **Clés API de test et production**
- 🔄 **URLs des endpoints**
- 📞 **Support technique**

### Étape 3: Informations nécessaires

Pour obtenir vos clés d17, vous devrez fournir :
- 🏢 **Informations sur votre entreprise**
- 📊 **Volume de transactions estimé**
- 🔒 **Mesures de sécurité mises en place**
- 📋 **Documents légaux (registre du commerce, etc.)**

### Étape 4: Configuration d17

#### Backend (.env) :
```env
D17_API_KEY=votre_cle_api_d17
D17_SECRET_KEY=votre_cle_secrete_d17
D17_BASE_URL=https://api.d17.tn/v1/
D17_WEBHOOK_SECRET=votre_secret_webhook_d17
```

---

## 🔧 Configuration des fichiers .env

### Frontend (.env) :
```env
# API Backend
VITE_API_URL=http://localhost:8000

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_stripe

# Mode développement
VITE_NODE_ENV=development
```

### Backend (.env) :
```env
# Database
DATABASE_NAME=shopnow_db
DATABASE_USER=votre_utilisateur_db
DATABASE_PASSWORD=votre_mot_de_passe_db
DATABASE_HOST=localhost
DATABASE_PORT=3306

# Django
SECRET_KEY=votre_cle_secrete_django_tres_longue_et_complexe
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe

# d17
D17_API_KEY=votre_cle_api_d17
D17_SECRET_KEY=votre_cle_secrete_d17
D17_BASE_URL=https://api.d17.tn/v1/
D17_WEBHOOK_SECRET=votre_secret_webhook_d17

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre_email@gmail.com
EMAIL_HOST_PASSWORD=votre_mot_de_passe_app
```

---

## ⚡ Test rapide

### 1. Vérifier Stripe

Utilisez ces clés de test Stripe pour commencer immédiatement :

```env
# Clés de test publiques (peuvent être partagées)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXXX

# ⚠️ Remplacez par vos vraies clés pour la production !
```

### 2. Cartes de test Stripe

- **Visa réussie** : `4242424242424242`
- **Visa échouée** : `4000000000000002`
- **CVC** : n'importe quel 3 chiffres
- **Date** : n'importe quelle date future

### 3. Test d17

Pour l'instant, d17 utilise une simulation. Contactez d17 pour obtenir leurs vraies clés API.

---

## 🚀 Mise en production

### Liste de vérification :

1. ✅ **Stripe** : Basculer vers les clés `pk_live_` et `sk_live_`
2. ✅ **d17** : Utiliser les clés de production d17
3. ✅ **Base de données** : Configurer MySQL/PostgreSQL en production
4. ✅ **HTTPS** : Activer SSL/TLS (obligatoire pour les paiements)
5. ✅ **Variables d'environnement** : Vérifier toutes les clés
6. ✅ **Tests** : Effectuer des transactions de test
7. ✅ **Webhooks** : Configurer les notifications de paiement

---

## 📞 Support

### En cas de problème :

1. **Stripe** : [support.stripe.com](https://support.stripe.com)
2. **d17** : business@d17.tn
3. **Documentation** : Consultez ce fichier et les commentaires dans le code

### Logs utiles :

```bash
# Backend Django
python manage.py runserver --verbosity=2

# Frontend Vite
npm run dev

# Vérifier les variables d'environnement
echo $VITE_STRIPE_PUBLISHABLE_KEY
```

---

## 🎯 Prochaines étapes

1. **Obtenir vos clés Stripe** (rapide - 10 minutes)
2. **Contacter d17** pour les clés API (peut prendre quelques jours)
3. **Tester les paiements** en mode développement
4. **Préparer la mise en production**

Bonne chance avec votre intégration de paiement ! 🚀

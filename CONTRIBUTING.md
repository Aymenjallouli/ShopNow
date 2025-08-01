# Contributing to ShopNow

Merci de votre intérêt pour contribuer à ShopNow ! Ce guide vous aidera à démarrer.

## 🚀 Comment Contribuer

### 1. Fork & Clone
```bash
git clone https://github.com/[votre-username]/ShopNow.git
cd ShopNow
git remote add upstream https://github.com/Aymenjallouli/ShopNow.git
```

### 2. Setup du Développement
```bash
# Backend
cd Backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Frontend
cd ../Frontend
npm install
```

### 3. Créer une Branche
```bash
git checkout -b feature/nom-de-votre-feature
```

### 4. Développer
- Suivez les standards de code
- Ajoutez des tests si nécessaire
- Testez vos changements localement

### 5. Commit & Push
```bash
git add .
git commit -m "feat: description de votre feature"
git push origin feature/nom-de-votre-feature
```

### 6. Pull Request
- Ouvrez une PR vers la branche `main`
- Décrivez vos changements
- Attendez la review

## 📋 Standards de Code

### Frontend (React/JavaScript)
- Utilisez **ESLint** et **Prettier**
- Composants en **PascalCase**
- Hooks personnalisés avec préfixe `use`
- Props avec **TypeScript** (si applicable)

### Backend (Django/Python)
- Suivez **PEP 8**
- Utilisez **Black** pour le formatage
- **isort** pour les imports
- Docstrings pour les fonctions publiques

### Commits
Utilisez [Conventional Commits](https://conventionalcommits.org/) :
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, points-virgules manquants, etc.
refactor: refactoring du code
test: ajout de tests
chore: maintenance
```

## 🐛 Reporter des Bugs

1. Vérifiez si le bug n'existe pas déjà
2. Utilisez le template d'issue
3. Incluez :
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots si applicable
   - Environment (OS, browser, versions)

## 💡 Proposer des Fonctionnalités

1. Ouvrez une issue avec le label `enhancement`
2. Décrivez le problème que ça résout
3. Proposez une solution
4. Discutez avec la communauté

## 🏆 Recognition

Les contributeurs seront ajoutés au README et pourront recevoir :
- Badge "Contributor"
- Mentions dans les release notes
- Invitations aux events communautaires

Merci pour vos contributions ! 🎉

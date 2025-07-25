from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import CustomUser


# Ici, nous pouvons ajouter des signaux si nécessaire
# Par exemple, envoyer un email de bienvenue lors de la création d'un utilisateur

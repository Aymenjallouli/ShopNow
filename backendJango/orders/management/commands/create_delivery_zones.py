from django.core.management.base import BaseCommand
from orders.models import DeliveryZone


class Command(BaseCommand):
    help = 'Create default delivery zones for Tunisia'

    def handle(self, *args, **options):
        # Zones de livraison par défaut pour la Tunisie
        default_zones = [
            {
                'name': 'Tunis Centre',
                'description': 'Zone centre de Tunis - livraison rapide',
                'base_price': 3.00,
                'price_per_km': 0.50,
                'max_distance_km': 15,
                'cities': ['Tunis', 'La Marsa', 'Sidi Bou Said', 'Carthage']
            },
            {
                'name': 'Grand Tunis',
                'description': 'Banlieue de Tunis - livraison standard',
                'base_price': 5.00,
                'price_per_km': 0.75,
                'max_distance_km': 30,
                'cities': ['Ariana', 'Ben Arous', 'Manouba', 'Nabeul']
            },
            {
                'name': 'Sfax et région',
                'description': 'Sfax et environs',
                'base_price': 7.00,
                'price_per_km': 1.00,
                'max_distance_km': 25,
                'cities': ['Sfax', 'Mahdia', 'Kerkennah']
            },
            {
                'name': 'Sousse et région',
                'description': 'Sousse et côte est',
                'base_price': 6.00,
                'price_per_km': 0.80,
                'max_distance_km': 35,
                'cities': ['Sousse', 'Monastir', 'Kairouan', 'Mahdia']
            },
            {
                'name': 'Nord de la Tunisie',
                'description': 'Bizerte, Béja et régions du nord',
                'base_price': 8.00,
                'price_per_km': 1.20,
                'max_distance_km': 40,
                'cities': ['Bizerte', 'Béja', 'Jendouba', 'Le Kef']
            },
            {
                'name': 'Sud de la Tunisie',
                'description': 'Gabes, Tozeur et régions du sud',
                'base_price': 12.00,
                'price_per_km': 1.50,
                'max_distance_km': 60,
                'cities': ['Gabes', 'Tozeur', 'Gafsa', 'Médenine', 'Tataouine']
            }
        ]

        created_count = 0
        updated_count = 0

        for zone_data in default_zones:
            zone, created = DeliveryZone.objects.get_or_create(
                name=zone_data['name'],
                defaults={
                    'description': zone_data['description'],
                    'base_price': zone_data['base_price'],
                    'price_per_km': zone_data['price_per_km'],
                    'max_distance_km': zone_data['max_distance_km'],
                    'is_active': True
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Zone créée: {zone.name}')
                )
            else:
                # Mettre à jour si nécessaire
                zone.description = zone_data['description']
                zone.base_price = zone_data['base_price']
                zone.price_per_km = zone_data['price_per_km']
                zone.max_distance_km = zone_data['max_distance_km']
                zone.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'🔄 Zone mise à jour: {zone.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n📦 Résumé:\n'
                f'   • {created_count} nouvelles zones créées\n'
                f'   • {updated_count} zones mises à jour\n'
                f'   • Total: {DeliveryZone.objects.filter(is_active=True).count()} zones actives'
            )
        )

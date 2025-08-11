from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_order_credit_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_due_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]

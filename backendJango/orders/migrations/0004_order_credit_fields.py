from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0002_alter_shop_owner'),
        ('orders', '0003_orderstatushistory'),
        ('accounts', '0003_customuser_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='credit_decision_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='credit_decision_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='credit_decisions', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='order',
            name='credit_note',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='order',
            name='credit_status',
            field=models.CharField(choices=[('none', 'None'), ('requested', 'Requested'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='none', max_length=20),
        ),
        migrations.AddField(
            model_name='order',
            name='shop',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='shops.shop'),
        ),
    ]

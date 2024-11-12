# Generated by Django 3.2.18 on 2024-10-20 11:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_alter_match_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='extenduser',
            name='player',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='extend_user', to='core.player'),
        ),
        migrations.AlterField(
            model_name='player',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='player_profile', to=settings.AUTH_USER_MODEL),
        ),
    ]
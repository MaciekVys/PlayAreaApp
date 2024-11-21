# Generated by Django 3.2.18 on 2024-11-20 20:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0049_playerteamstatistics_date_left'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerteamstatistics',
            name='date_joined',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='playerteamstatistics',
            unique_together={('player', 'team', 'date_joined')},
        ),
    ]
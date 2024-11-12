# Generated by Django 3.2.18 on 2024-10-20 14:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0020_player_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='city',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='cities/'),
        ),
        migrations.AddField(
            model_name='player',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to='players/'),
        ),
        migrations.AddField(
            model_name='team',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to='teams/'),
        ),
    ]
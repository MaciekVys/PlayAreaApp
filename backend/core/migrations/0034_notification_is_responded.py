# Generated by Django 3.2.18 on 2024-10-28 21:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0033_remove_notification_is_responded'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='is_responded',
            field=models.BooleanField(default=False),
        ),
    ]

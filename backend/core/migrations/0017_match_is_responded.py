# Generated by Django 3.2.18 on 2024-10-17 13:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0016_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='is_responded',
            field=models.BooleanField(default=False),
        ),
    ]

# Generated by Django 3.2.18 on 2024-11-06 13:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0035_extenduser_is_member'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notification',
            name='is_read',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='is_responded',
        ),
    ]

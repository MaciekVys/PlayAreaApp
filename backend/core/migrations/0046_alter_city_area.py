# Generated by Django 3.2.18 on 2024-11-18 15:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0045_auto_20241113_1431'),
    ]

    operations = [
        migrations.AlterField(
            model_name='city',
            name='area',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
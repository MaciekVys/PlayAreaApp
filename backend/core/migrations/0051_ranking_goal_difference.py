# Generated by Django 3.2.18 on 2024-11-20 22:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0050_auto_20241120_2156'),
    ]

    operations = [
        migrations.AddField(
            model_name='ranking',
            name='goal_difference',
            field=models.IntegerField(default=0),
        ),
    ]
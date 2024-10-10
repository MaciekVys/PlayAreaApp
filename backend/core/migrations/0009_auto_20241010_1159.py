# Generated by Django 3.2.18 on 2024-10-10 09:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_auto_20241010_1155'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='match',
            name='league',
        ),
        migrations.AddField(
            model_name='match',
            name='city',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='core.city'),
        ),
    ]

# Generated by Django 3.2.18 on 2024-10-12 09:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_auto_20241010_1159'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='city',
            name='league',
        ),
        migrations.RemoveField(
            model_name='team',
            name='city',
        ),
        migrations.AddField(
            model_name='league',
            name='city',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='league', to='core.city'),
        ),
        migrations.AddField(
            model_name='ranking',
            name='season',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rankings', to='core.season'),
        ),
        migrations.AddField(
            model_name='season',
            name='league',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='seasons', to='core.league'),
        ),
        migrations.AlterUniqueTogether(
            name='ranking',
            unique_together={('league', 'team')},
        ),
    ]

# Generated by Django 3.2.18 on 2024-11-06 17:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0039_alter_notification_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='status',
            field=models.BooleanField(choices=[('accepted', 'Accepted'), ('declined', 'Declined')], default=False),
        ),
    ]

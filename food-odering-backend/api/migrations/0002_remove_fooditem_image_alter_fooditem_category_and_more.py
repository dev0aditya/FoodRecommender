# Generated by Django 5.1.3 on 2024-11-28 06:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fooditem',
            name='image',
        ),
        migrations.AlterField(
            model_name='fooditem',
            name='category',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='fooditem',
            name='price',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
    ]

# Generated manually to deprecate FinanceEntry (quick entries).
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('finance', '0007_financeentry_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='financeentry',
            name='name',
        ),
        migrations.RemoveField(
            model_name='financeentry',
            name='date',
        ),
        migrations.DeleteModel(
            name='FinanceEntry',
        ),
    ]
# Generated for category ordering
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0018_add_transaction_subcategory'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='order',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['order', 'created_at']},
        ),
    ]

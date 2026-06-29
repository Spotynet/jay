from rest_framework import serializers
from .models import JournalEntry, CustomRating, JournalSettings

class CustomRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomRating
        fields = ['label', 'score']

    def validate_label(self, value):
        return value.strip().lower()

class JournalEntrySerializer(serializers.ModelSerializer):
    custom_ratings = CustomRatingSerializer(many=True, required=False)

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'date', 'highlight', 'notes', 
            'mood_score', 'energy_score', 'custom_ratings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_custom_ratings(self, value):
        labels = [item['label'].strip().lower() for item in value]
        if len(labels) != len(set(labels)):
            raise serializers.ValidationError("Duplicate labels found in custom ratings.")
        return value

    def create(self, validated_data):
        custom_ratings_data = validated_data.pop('custom_ratings', [])
        user = validated_data.pop('user', self.context['request'].user)
        
        date = validated_data.get('date')
        if JournalEntry.objects.filter(user=user, date=date).exists():
            raise serializers.ValidationError({"date": "A journal entry for this date already exists."})

        journal_entry = JournalEntry.objects.create(user=user, **validated_data)
        
        for rating_data in custom_ratings_data:
            CustomRating.objects.create(journal_entry=journal_entry, **rating_data)
            
        return journal_entry

    def update(self, instance, validated_data):
        custom_ratings_data = validated_data.pop('custom_ratings', None)
        
        new_date = validated_data.get('date')
        if new_date and new_date != instance.date:
            if JournalEntry.objects.filter(user=instance.user, date=new_date).exists():
                raise serializers.ValidationError({"date": "A journal entry for this date already exists."})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if custom_ratings_data is not None:
            instance.custom_ratings.all().delete()
            for rating_data in custom_ratings_data:
                CustomRating.objects.create(journal_entry=instance, **rating_data)
        
        return instance

class JournalSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalSettings
        fields = ['reminder_enabled', 'reminder_time', 'repeat_mode', 'days_of_week', 'default_tags']

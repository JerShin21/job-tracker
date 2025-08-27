from rest_framework import serializers
from .models import Company, Role, Application, Stage, Document, Reminder

class CompanySerializer(serializers.ModelSerializer):
    class Meta: model = Company; fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    company = CompanySerializer()
    class Meta: model = Role; fields = '__all__'

class RoleWriteSerializer(serializers.ModelSerializer):
    class Meta: model = Role; fields = '__all__'

class StageSerializer(serializers.ModelSerializer):
    class Meta: model = Stage; fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta: model = Document; fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    role = RoleSerializer()
    stages = StageSerializer(many=True, read_only=True)
    class Meta: model = Application; fields = '__all__'

class ApplicationWriteSerializer(serializers.ModelSerializer):
    class Meta: model = Application; fields = '__all__'; read_only_fields = ('user',)

class ReminderSerializer(serializers.ModelSerializer):
    class Meta: model = Reminder; fields = '__all__'; read_only_fields = ('user',)

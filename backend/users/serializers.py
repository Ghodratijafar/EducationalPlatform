from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'confirm_password', 'bio')
        extra_kwargs = {
            'password': {'write_only': True},
            'bio': {'required': False}
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    bio = serializers.CharField(source='user.bio', required=False)

    class Meta:
        model = UserProfile
        fields = ('id', 'email', 'username', 'bio', 'avatar')
        extra_kwargs = {
            'avatar': {'required': False}
        } 
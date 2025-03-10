from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.timesince import timesince
from .models import Post, Category, Comment, Tag, Share

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'avatar_url']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_avatar_url(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar.url
        return None

class TagSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'post_count']

    def get_post_count(self, obj):
        return obj.post_set.filter(status='published').count()

class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'post_count']

    def get_post_count(self, obj):
        return obj.post_set.filter(status='published').count()

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class ShareSerializer(serializers.ModelSerializer):
    shared_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Share
        fields = ['id', 'post', 'platform', 'shared_by', 'created_at']
        read_only_fields = ['shared_by']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'parent', 'replies', 
                 'like_count', 'is_liked', 'created_at', 'created_at_formatted', 
                 'time_since', 'is_approved']
        read_only_fields = ['author', 'is_approved']

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_approved=True), many=True).data
        return []

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M:%S")

    def get_time_since(self, obj):
        return timesince(obj.created_at)

class PostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    bookmark_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'excerpt', 'featured_image', 
                 'author', 'categories', 'tags', 'status', 'views',
                 'like_count', 'bookmark_count', 'comment_count',
                 'is_liked', 'is_bookmarked', 'reading_time',
                 'created_at', 'published_at']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_bookmark_count(self, obj):
        return obj.bookmarks.count()

    def get_comment_count(self, obj):
        return obj.comments.filter(is_approved=True).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarks.filter(id=request.user.id).exists()
        return False

    def get_reading_time(self, obj):
        words_per_minute = 200
        word_count = len(obj.content.split())
        minutes = word_count / words_per_minute
        return max(1, round(minutes))

class PostDetailSerializer(PostListSerializer):
    content = serializers.CharField()
    comments = serializers.SerializerMethodField()
    related_posts = serializers.SerializerMethodField()
    share_urls = serializers.SerializerMethodField()

    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + ['content', 'comments', 'related_posts', 'share_urls']

    def get_comments(self, obj):
        comments = obj.comments.filter(parent=None, is_approved=True)
        return CommentSerializer(comments, many=True, context=self.context).data

    def get_related_posts(self, obj):
        related = obj.update_related_posts()
        return PostListSerializer(related, many=True, context=self.context).data

    def get_share_urls(self, obj):
        request = self.context.get('request')
        if request:
            url = request.build_absolute_uri()
            title = obj.title
            return {
                'facebook': f'https://www.facebook.com/sharer/sharer.php?u={url}',
                'twitter': f'https://twitter.com/intent/tweet?url={url}&text={title}',
                'linkedin': f'https://www.linkedin.com/sharing/share-offsite/?url={url}',
                'telegram': f'https://t.me/share/url?url={url}&text={title}',
                'whatsapp': f'https://api.whatsapp.com/send?text={title}%20{url}'
            }
        return {}
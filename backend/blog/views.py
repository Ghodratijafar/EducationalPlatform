from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import F, Count, Q
from .models import Post, Category, Comment, Tag, Share
from .serializers import (
    PostListSerializer, PostDetailSerializer,
    CategorySerializer, CommentSerializer,
    TagSerializer, ShareSerializer
)
from .permissions import IsAuthorOrReadOnly

# Create your views here.

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    @action(detail=True)
    def posts(self, request, slug=None):
        category = self.get_object()
        posts = Post.objects.filter(categories=category, status='published')
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = PostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'categories__name', 'tags__name']
    ordering_fields = ['created_at', 'views', 'title', '-like_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Post.objects.annotate(
            like_count=Count('likes'),
            bookmark_count=Count('bookmarks'),
            comment_count=Count('comments')
        )
        if self.action == 'list':
            queryset = queryset.filter(status='published')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(categories__slug=category)
        
        # Filter by tag
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__slug=tag)
            
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

    def perform_create(self, serializer):
        post = serializer.save(
            author=self.request.user,
            published_at=timezone.now() if serializer.validated_data.get('status') == 'published' else None
        )
        post.update_related_posts()

    def perform_update(self, serializer):
        post = serializer.save()
        post.update_related_posts()

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def view(self, request, slug=None):
        post = self.get_object()
        post.views = F('views') + 1
        post.save()
        return Response({'status': 'view counted'})

    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        post = self.get_object()
        if request.user in post.likes.all():
            post.likes.remove(request.user)
            return Response({'status': 'unliked'})
        post.likes.add(request.user)
        return Response({'status': 'liked'})

    @action(detail=True, methods=['post'])
    def bookmark(self, request, slug=None):
        post = self.get_object()
        if request.user in post.bookmarks.all():
            post.bookmarks.remove(request.user)
            return Response({'status': 'unbookmarked'})
        post.bookmarks.add(request.user)
        return Response({'status': 'bookmarked'})

    @action(detail=True, methods=['post'])
    def share(self, request, slug=None):
        post = self.get_object()
        platform = request.data.get('platform')
        if not platform:
            return Response({'error': 'Platform is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        Share.objects.create(
            post=post,
            platform=platform,
            shared_by=request.user if request.user.is_authenticated else None
        )
        return Response({'status': 'shared'})

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            is_approved=True  # You might want to change this based on your moderation needs
        )

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        if request.user in comment.likes.all():
            comment.likes.remove(request.user)
            return Response({'status': 'unliked'})
        comment.likes.add(request.user)
        return Response({'status': 'liked'})

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        parent_comment = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                author=request.user,
                post=parent_comment.post,
                parent=parent_comment,
                is_approved=True
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

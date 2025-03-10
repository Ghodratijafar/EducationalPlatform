from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone

User = get_user_model()

class Tag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'

class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    featured_image = models.ImageField(upload_to='blog/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    categories = models.ManyToManyField(Category)
    tags = models.ManyToManyField(Tag)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    views = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    bookmarks = models.ManyToManyField(User, related_name='bookmarked_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.excerpt and self.content:
            self.excerpt = self.content[:300]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def update_related_posts(self):
        related = Post.objects.filter(
            models.Q(tags__in=self.tags.all()) | 
            models.Q(categories__in=self.categories.all())
        ).exclude(id=self.id).distinct()
        return related[:5]

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'

class Share(models.Model):
    PLATFORM_CHOICES = (
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
    )

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    shared_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.post.title} shared on {self.platform}'
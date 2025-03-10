import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from blog.models import Category, Post
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()
user = User.objects.first()

# Create categories
programming = Category.objects.create(
    name='Programming',
    description='Articles about programming and software development'
)
education = Category.objects.create(
    name='Education',
    description='Articles about learning and teaching methods'
)
technology = Category.objects.create(
    name='Technology',
    description='Latest technology news and trends'
)

# Create posts
post1 = Post.objects.create(
    title='Getting Started with Python Programming',
    content='''Python is one of the most popular programming languages in the world. It's known for its simplicity and readability. In this article, we'll explore the basics of Python programming and why it's a great language for beginners.

Key topics we'll cover:
1. Basic syntax
2. Variables and data types
3. Control structures
4. Functions
5. Object-oriented programming

Python's clean syntax and extensive standard library make it an excellent choice for beginners. Whether you're interested in web development, data science, or automation, Python has the tools you need.''',
    excerpt='Learn the fundamentals of Python programming in this comprehensive guide for beginners.',
    author=user,
    status='published',
    tags='python,programming,beginners',
    published_at=timezone.now()
)
post1.categories.add(programming, education)

post2 = Post.objects.create(
    title='Modern Web Development with React',
    content='''React has revolutionized the way we build web applications. This powerful JavaScript library, developed by Facebook, makes it easy to create interactive user interfaces.

In this guide, we'll cover:
1. React components
2. State management
3. Hooks
4. Routing
5. Best practices

React's component-based architecture and virtual DOM make it efficient and maintainable. Learn how to build modern, responsive web applications using React and its ecosystem.''',
    excerpt='Discover how to build modern web applications using React and its ecosystem.',
    author=user,
    status='published',
    tags='react,javascript,web development',
    published_at=timezone.now()
)
post2.categories.add(programming, technology)

post3 = Post.objects.create(
    title='The Future of AI in Education',
    content='''Artificial Intelligence is transforming education in unprecedented ways. From personalized learning paths to automated grading systems, AI is making education more accessible and effective.

Key trends:
1. Adaptive learning platforms
2. Intelligent tutoring systems
3. Automated assessment
4. Virtual learning assistants
5. Predictive analytics in education

AI-powered educational tools are revolutionizing how we teach and learn. Discover the latest innovations in educational technology.''',
    excerpt='Explore how AI is revolutionizing education and shaping the future of learning.',
    author=user,
    status='published',
    tags='ai,education,technology,future',
    published_at=timezone.now()
)
post3.categories.add(education, technology)

print('Sample blog posts and categories created successfully!') 
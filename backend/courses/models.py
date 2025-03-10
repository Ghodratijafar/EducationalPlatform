from django.db import models
from django.contrib.auth import get_user_model
from categories.models import Category
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

User = get_user_model()

class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_teaching', null=True)
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, through='Enrollment', related_name='courses_enrolled')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    duration = models.PositiveIntegerField(help_text="Duration in minutes", default=0)
    prerequisites = models.TextField(blank=True)
    learning_objectives = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    image = models.ImageField(upload_to='courses/', null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return 0
        return sum(review.rating for review in reviews) / len(reviews)

    @property
    def rating_count(self):
        return self.reviews.count()

    @property
    def total_reviews(self):
        return self.reviews.count()

    @property
    def total_students(self):
        return self.students.count()

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = models.TextField()
    order = models.PositiveIntegerField()
    duration = models.PositiveIntegerField(help_text='Duration in minutes')
    video_url = models.URLField(null=True, blank=True)
    is_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resources = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date_enrolled = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username}'s review of {self.course.title}"

class LessonProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['enrollment', 'lesson']

    def __str__(self):
        return f"{self.enrollment.user.username}'s progress in {self.lesson.title}"

class Discussion(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='discussions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Discussion in {self.course.title} by {self.user.username}"

class DiscussionReply(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reply to {self.discussion.title} by {self.user.username}"

class Quiz(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    passing_score = models.PositiveIntegerField(default=70)
    time_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Time limit in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    explanation = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField()
    question_type = models.CharField(max_length=20, choices=[
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer')
    ])

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.quiz.title} - Question {self.order}"

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"{self.question.text} - {self.text}"

class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s attempt at {self.quiz.title}"

class QuizResponse(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    text_response = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    points_earned = models.FloatField(default=0)

    def __str__(self):
        return f"Response to {self.question.text} by {self.attempt.user.username}"

class Note(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_notes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_shared = models.BooleanField(default=False)
    shared_with = models.ManyToManyField(User, related_name='shared_notes', blank=True)
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note by {self.user.username} for {self.lesson.title}"

    @property
    def formatted_tags(self):
        return [tag.strip() for tag in self.tags.split(',')] if self.tags else []

class FeaturedCourse(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, null=True)
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority', '-created_at']

    def __str__(self):
        return f"Featured: {self.course.title if self.course else 'No Course'}"

class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    content = models.TextField()
    avatar = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Testimonial by {self.name}"

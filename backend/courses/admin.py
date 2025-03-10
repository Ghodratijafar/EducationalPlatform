from django.contrib import admin
from .models import (
    Course, Lesson, Enrollment, Review, LessonProgress,
    Discussion, DiscussionReply, Quiz, Question, Answer,
    QuizAttempt, QuizResponse, Note
)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'price', 'level', 'is_published', 'created_at')
    list_filter = ('level', 'is_published', 'created_at')
    search_fields = ('title', 'description', 'instructor__username')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'duration', 'is_preview')
    list_filter = ('course', 'is_preview')
    search_fields = ('title', 'description', 'content')
    ordering = ('course', 'order')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'date_enrolled', 'is_completed')
    list_filter = ('is_completed', 'date_enrolled')
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('date_enrolled',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'course__title', 'comment')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'lesson', 'is_completed', 'completed_at')
    list_filter = ('is_completed', 'completed_at')
    search_fields = ('enrollment__user__username', 'lesson__title')

@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content', 'user__username', 'course__title')

@admin.register(DiscussionReply)
class DiscussionReplyAdmin(admin.ModelAdmin):
    list_display = ('discussion', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'user__username', 'discussion__title')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'passing_score', 'time_limit')
    list_filter = ('passing_score', 'created_at')
    search_fields = ('title', 'description', 'lesson__title')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'text', 'question_type', 'points', 'order')
    list_filter = ('question_type',)
    search_fields = ('text', 'explanation', 'quiz__title')

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'text', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('text', 'explanation', 'question__text')

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'user', 'score', 'passed', 'started_at', 'completed_at')
    list_filter = ('passed', 'started_at')
    search_fields = ('user__username', 'quiz__title')

@admin.register(QuizResponse)
class QuizResponseAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'is_correct', 'points_earned')
    list_filter = ('is_correct',)
    search_fields = ('text_response', 'question__text')

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'created_at', 'is_shared')
    list_filter = ('is_shared', 'created_at')
    search_fields = ('content', 'user__username', 'lesson__title', 'tags')

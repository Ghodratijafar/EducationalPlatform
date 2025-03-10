from rest_framework import serializers
from .models import (
    Course, Lesson, Enrollment, Note, LessonProgress,
    Review, Discussion, DiscussionReply, Quiz, Question,
    Answer, QuizAttempt, QuizResponse, FeaturedCourse, Testimonial
)
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'lesson_title', 'completed', 'last_position', 'completed_at']
        read_only_fields = ['completed_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'course_title', 'date_enrolled', 'is_completed', 'progress']
        read_only_fields = ['user', 'date_enrolled', 'is_completed']

    def get_progress(self, obj):
        completed_lessons = obj.lesson_progress.filter(is_completed=True).count()
        total_lessons = obj.course.lessons.count()
        if total_lessons > 0:
            return (completed_lessons / total_lessons) * 100
        return 0

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct', 'explanation']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'explanation', 'points', 'order', 'question_type', 'answers']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    total_points = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'passing_score', 'time_limit', 'questions', 'total_points']

    def get_total_points(self, obj):
        return sum(question.points for question in obj.questions.all())

class QuizResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResponse
        fields = ['id', 'question', 'answer', 'text_response', 'is_correct', 'points_earned']

class QuizAttemptSerializer(serializers.ModelSerializer):
    responses = QuizResponseSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'started_at', 'completed_at', 'score', 'passed', 'responses']
        read_only_fields = ['started_at', 'completed_at', 'score', 'passed']

class DiscussionReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = DiscussionReply
        fields = ['id', 'discussion', 'user', 'content', 'created_at', 'updated_at', 'is_solution']
        read_only_fields = ['user']

class DiscussionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = DiscussionReplySerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = ['id', 'course', 'lesson', 'user', 'title', 'content', 'created_at', 'updated_at', 'pinned', 'replies', 'reply_count']
        read_only_fields = ['user']

    def get_reply_count(self, obj):
        return obj.replies.count()

class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    quizzes = QuizSerializer(many=True, read_only=True)
    discussions = DiscussionSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'title', 'description', 'duration', 'video_url', 'is_preview', 'order', 'is_completed',
            'progress', 'quizzes', 'discussions'
        ]

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                enrollment = Enrollment.objects.get(user=request.user, course=obj.course)
                progress = LessonProgress.objects.get(enrollment=enrollment, lesson=obj)
                return progress.completed
            except (Enrollment.DoesNotExist, LessonProgress.DoesNotExist):
                return False
        return False

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                enrollment = Enrollment.objects.get(user=request.user, course=obj.course)
                completed_lessons = LessonProgress.objects.filter(
                    enrollment=enrollment,
                    is_completed=True
                ).count()
                total_lessons = obj.lessons.count()
                if total_lessons > 0:
                    return (completed_lessons / total_lessons) * 100
            except Enrollment.DoesNotExist:
                pass
        return 0

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'instructor_name',
            'price', 'thumbnail', 'level', 'category', 'tags',
            'learning_objectives', 'lessons', 'reviews', 'rating',
            'rating_count', 'is_enrolled', 'progress', 'created_at'
        ]
        read_only_fields = ['instructor']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.students.filter(id=request.user.id).exists()
        return False

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                enrollment = Enrollment.objects.get(user=request.user, course=obj)
                completed_lessons = LessonProgress.objects.filter(
                    enrollment=enrollment,
                    is_completed=True
                ).count()
                total_lessons = obj.lessons.count()
                if total_lessons > 0:
                    return (completed_lessons / total_lessons) * 100
            except Enrollment.DoesNotExist:
                pass
        return 0

class NoteSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    shared_with = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )
    formatted_tags = serializers.ListField(read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = Note
        fields = [
            'id', 'content', 'created_at', 'updated_at', 'user',
            'is_shared', 'shared_with', 'tags', 'formatted_tags',
            'lesson_title'
        ]
        read_only_fields = ['user']

class FeaturedCourseSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='course.title')
    description = serializers.CharField(source='course.description')
    price = serializers.DecimalField(source='course.price', max_digits=10, decimal_places=2)
    image = serializers.ImageField(source='course.image')

    class Meta:
        model = FeaturedCourse
        fields = ['id', 'title', 'description', 'price', 'image', 'created_at']

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'role', 'content', 'avatar', 'rating', 'created_at'] 
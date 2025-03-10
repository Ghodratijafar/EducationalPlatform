from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db.models import Q, Avg
from django.utils import timezone
import csv
import json
from datetime import datetime
from .models import (
    Course, Lesson, Enrollment, Note, LessonProgress,
    Review, Discussion, DiscussionReply, Quiz, Question,
    Answer, QuizAttempt, QuizResponse, FeaturedCourse, Testimonial
)
from .serializers import (
    CourseSerializer, LessonSerializer, EnrollmentSerializer, NoteSerializer,
    LessonProgressSerializer, ReviewSerializer, DiscussionSerializer,
    DiscussionReplySerializer, QuizSerializer, QuizAttemptSerializer,
    QuizResponseSerializer, FeaturedCourseSerializer, TestimonialSerializer
)

# Create your views here.

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if Enrollment.objects.filter(user=user, course=course).exists():
            return Response(
                {'error': 'Already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment = Enrollment.objects.create(user=user, course=course)
        
        # Create LessonProgress for all lessons
        lessons = course.lessons.all()
        lesson_progress_objects = [
            LessonProgress(
                enrollment=enrollment,
                lesson=lesson
            ) for lesson in lessons
        ]
        LessonProgress.objects.bulk_create(lesson_progress_objects)

        return Response(
            EnrollmentSerializer(enrollment).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not Enrollment.objects.filter(user=user, course=course).exists():
            return Response(
                {'error': 'Must be enrolled to review'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user, course=course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(course_id=self.kwargs['course_pk'])

    @action(detail=True, methods=['post'])
    def complete(self, request, course_pk=None, pk=None):
        lesson = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            enrollment = Enrollment.objects.get(user=user, course_id=course_pk)
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'Must be enrolled to mark lesson as complete'},
                status=status.HTTP_400_BAD_REQUEST
            )

        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson
        )
        
        if not progress.completed:
            progress.completed = True
            progress.save()

        # Check if all lessons are completed
        total_lessons = lesson.course.lessons.count()
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            completed=True
        ).count()

        if total_lessons == completed_lessons:
            enrollment.completed = True
            enrollment.save()

        return Response(
            LessonProgressSerializer(progress).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def progress(self, request, course_pk=None, pk=None):
        lesson = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            enrollment = Enrollment.objects.get(user=user, course_id=course_pk)
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'Must be enrolled to update progress'},
                status=status.HTTP_400_BAD_REQUEST
            )

        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson
        )

        serializer = LessonProgressSerializer(progress, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DiscussionViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Discussion.objects.filter(
            Q(course_id=self.kwargs['course_pk']) &
            (Q(lesson_id=self.kwargs.get('lesson_pk')) if 'lesson_pk' in self.kwargs else Q())
        )

    def perform_create(self, serializer):
        course_id = self.kwargs['course_pk']
        lesson_id = self.kwargs.get('lesson_pk')
        if not Enrollment.objects.filter(user=self.request.user, course_id=course_id).exists():
            raise PermissionDenied("You must be enrolled in the course to participate in discussions.")
        serializer.save(
            user=self.request.user,
            course_id=course_id,
            lesson_id=lesson_id
        )

class DiscussionReplyViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionReplySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DiscussionReply.objects.filter(discussion_id=self.kwargs['discussion_pk'])

    def perform_create(self, serializer):
        discussion = get_object_or_404(Discussion, id=self.kwargs['discussion_pk'])
        if not Enrollment.objects.filter(user=self.request.user, course=discussion.course).exists():
            raise PermissionDenied("You must be enrolled in the course to reply to discussions.")
        serializer.save(user=self.request.user, discussion=discussion)

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(lesson_id=self.kwargs['lesson_pk'])

    @action(detail=True, methods=['post'])
    def start_attempt(self, request, lesson_pk=None, pk=None):
        quiz = self.get_object()
        lesson = get_object_or_404(Lesson, id=lesson_pk)
        if not Enrollment.objects.filter(user=request.user, course=lesson.course).exists():
            raise PermissionDenied("You must be enrolled in the course to take quizzes.")
            
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user
        )
        return Response(QuizAttemptSerializer(attempt).data)

    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, lesson_pk=None, pk=None):
        quiz = self.get_object()
        attempt = get_object_or_404(QuizAttempt, id=request.data.get('attempt_id'), user=request.user)
        
        if attempt.completed_at:
            return Response({'error': 'This attempt has already been submitted'}, status=status.HTTP_400_BAD_REQUEST)
            
        responses_data = request.data.get('responses', [])
        total_points = 0
        earned_points = 0
        
        for response_data in responses_data:
            question = get_object_or_404(Question, id=response_data['question_id'])
            answer = None
            is_correct = False
            points_earned = 0
            
            if question.question_type in ['multiple_choice', 'true_false']:
                answer = get_object_or_404(Answer, id=response_data.get('answer_id'))
                is_correct = answer.is_correct
                points_earned = question.points if is_correct else 0
            else:  # short_answer
                text_response = response_data.get('text_response', '').strip().lower()
                correct_answer = question.answers.filter(is_correct=True).first()
                is_correct = text_response == correct_answer.text.lower()
                points_earned = question.points if is_correct else 0
                
            QuizResponse.objects.create(
                attempt=attempt,
                question=question,
                answer=answer,
                text_response=response_data.get('text_response', ''),
                is_correct=is_correct,
                points_earned=points_earned
            )
            
            total_points += question.points
            earned_points += points_earned
            
        attempt.score = (earned_points / total_points * 100) if total_points > 0 else 0
        attempt.passed = attempt.score >= quiz.passing_score
        attempt.completed_at = timezone.now()
        attempt.save()
        
        # If passed, mark the lesson as completed
        if attempt.passed:
            lesson = quiz.lesson
            enrollment = get_object_or_404(Enrollment, user=request.user, course=lesson.course)
            progress, created = LessonProgress.objects.get_or_create(
                enrollment=enrollment,
                lesson=lesson
            )
            if not progress.completed:
                progress.completed = True
                progress.completed_at = timezone.now()
                progress.save()
                enrollment.update_progress()
        
        return Response(QuizAttemptSerializer(attempt).data)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content', 'tags']

    def get_queryset(self):
        lesson_id = self.kwargs['lesson_pk']
        queryset = Note.objects.filter(
            Q(lesson_id=lesson_id, user=self.request.user) |
            Q(lesson_id=lesson_id, shared_with=self.request.user)
        ).distinct()

        # Filter by tags
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            tag_filters = Q()
            for tag in tag_list:
                tag_filters |= Q(tags__icontains=tag)
            queryset = queryset.filter(tag_filters)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        # Filter by shared status
        shared = self.request.query_params.get('shared', None)
        if shared is not None:
            is_shared = shared.lower() == 'true'
            queryset = queryset.filter(is_shared=is_shared)

        return queryset

    def perform_create(self, serializer):
        lesson_id = self.kwargs['lesson_pk']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Check if user is enrolled in the course
        if not Enrollment.objects.filter(user=self.request.user, course=lesson.course).exists():
            raise PermissionDenied("You must be enrolled in the course to add notes.")
            
        serializer.save(user=self.request.user, lesson=lesson)

    @action(detail=True, methods=['post'])
    def share(self, request, lesson_pk=None, pk=None):
        note = self.get_object()
        
        if note.user != request.user:
            raise PermissionDenied("You can only share your own notes.")
            
        user_ids = request.data.get('user_ids', [])
        note.is_shared = True
        note.shared_with.set(user_ids)
        note.save()
        
        return Response({'status': 'Note shared successfully'})

    @action(detail=False, methods=['get'])
    def export(self, request, lesson_pk=None):
        notes = self.get_queryset()
        format = request.query_params.get('format', 'json')
        
        if format == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="notes-{datetime.now().strftime("%Y%m%d")}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Lesson', 'Content', 'Tags', 'Created At'])
            
            for note in notes:
                writer.writerow([
                    note.lesson.title,
                    note.content,
                    note.tags,
                    note.created_at.strftime("%Y-%m-%d %H:%M:%S")
                ])
                
            return response
            
        else:  # JSON format
            serializer = self.get_serializer(notes, many=True)
            response = HttpResponse(
                json.dumps(serializer.data, indent=2),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="notes-{datetime.now().strftime("%Y%m%d")}.json"'
            return response

    @action(detail=False, methods=['get'])
    def shared_with_me(self, request, lesson_pk=None):
        notes = Note.objects.filter(shared_with=request.user, lesson_id=lesson_pk)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def tags(self, request, lesson_pk=None):
        """Get all unique tags used in notes for this lesson."""
        notes = self.get_queryset()
        all_tags = set()
        for note in notes:
            if note.tags:
                all_tags.update(tag.strip() for tag in note.tags.split(','))
        return Response(sorted(list(all_tags)))

class FeaturedCourseViewSet(viewsets.ModelViewSet):
    queryset = FeaturedCourse.objects.all()
    serializer_class = FeaturedCourseSerializer
    permission_classes = []  # Allow public access
    http_method_names = ['get']  # Only allow GET requests

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = []  # Allow public access
    http_method_names = ['get']  # Only allow GET requests

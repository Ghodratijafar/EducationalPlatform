from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    CourseViewSet, LessonViewSet, NoteViewSet, DiscussionViewSet,
    DiscussionReplyViewSet, QuizViewSet,
    FeaturedCourseViewSet,
    TestimonialViewSet,
)

# Create a router for courses
router = routers.DefaultRouter()
router.register(r'courses', CourseViewSet)

# Create a nested router for lessons within courses
lessons_router = routers.NestedDefaultRouter(router, r'courses', lookup='course')
lessons_router.register(r'lessons', LessonViewSet, basename='course-lessons')

# Nested routes for lessons
lessons_router.register(r'notes', NoteViewSet, basename='lesson-notes')
lessons_router.register(r'discussions', DiscussionViewSet, basename='lesson-discussions')
lessons_router.register(r'quizzes', QuizViewSet, basename='lesson-quizzes')

# Nested routes for discussions
discussions_router = routers.NestedDefaultRouter(lessons_router, r'discussions', lookup='discussion')
discussions_router.register(r'replies', DiscussionReplyViewSet, basename='discussion-replies')

router.register(r'featured-courses', FeaturedCourseViewSet)
router.register(r'testimonials', TestimonialViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('', include(lessons_router.urls)),
    path('', include(discussions_router.urls)),
] 
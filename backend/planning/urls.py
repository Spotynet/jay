from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaViewSet, GoalViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]

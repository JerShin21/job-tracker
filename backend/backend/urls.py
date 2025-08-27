"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views import CompanyViewSet, RoleViewSet, ApplicationViewSet, StageViewSet, DocumentViewSet, ReminderViewSet
from core.auth_views import register, user_profile
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

router = routers.DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'applications', ApplicationViewSet, basename='applications')
router.register(r'stages', StageViewSet, basename='stages')
router.register(r'documents', DocumentViewSet, basename='documents')
router.register(r'reminders', ReminderViewSet, basename='reminders')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    
    # Authentication endpoints
    path('api/auth/register/', register, name='register'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/profile/', user_profile, name='user_profile'),
    
    # API routes
    path('api/', include(router.urls)),
]
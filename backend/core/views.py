from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
import boto3, os
from .models import Company, Role, Application, Stage, Document, Reminder
from .serializers import *
from .permissions import IsOwner

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'city']
    ordering_fields = ['name', 'country']
    ordering = ['name']

    def perform_create(self, serializer):
        # Check if company already exists
        name = serializer.validated_data['name']
        existing = Company.objects.filter(name__iexact=name).first()
        if existing:
            # Return existing company instead of creating duplicate
            return existing
        return serializer.save()

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.select_related('company').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['company', 'level']
    search_fields = ['title', 'company__name', 'stack_tags']
    ordering_fields = ['title', 'company__name', 'salary_min', 'salary_max']
    ordering = ['-id']  # Most recent first

    def get_serializer_class(self):
        return RoleWriteSerializer if self.action in ['create','update','partial_update'] else RoleSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom filtering
        company_name = self.request.query_params.get('company_name')
        if company_name:
            queryset = queryset.filter(company__name__icontains=company_name)
            
        min_salary = self.request.query_params.get('min_salary')
        if min_salary:
            queryset = queryset.filter(salary_min__gte=min_salary)
            
        max_salary = self.request.query_params.get('max_salary')
        if max_salary:
            queryset = queryset.filter(salary_max__lte=max_salary)
            
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level__icontains=level)
            
        return queryset

class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority']
    search_fields = ['role__title', 'role__company__name', 'source']
    ordering_fields = ['created_at', 'updated_at', 'applied_at', 'priority']
    ordering = ['-updated_at']

    def get_queryset(self):
        queryset = Application.objects.select_related('role','role__company').filter(user=self.request.user)
        
        # Custom filtering
        status = self.request.query_params.get('status')
        if status:
            statuses = status.split(',')
            queryset = queryset.filter(status__in=statuses)
            
        return queryset

    def get_serializer_class(self):
        return ApplicationWriteSerializer if self.action in ['create','update','partial_update'] else ApplicationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard stats with counts by status"""
        qs = self.get_queryset().values_list('status', flat=True)
        from collections import Counter
        return Response(Counter(qs))

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Additional statistics for analytics"""
        queryset = self.get_queryset()
        total = queryset.count()
        
        # Status breakdown
        status_counts = {}
        for status_key, status_label in Application.STATUS_CHOICES:
            status_counts[status_key] = queryset.filter(status=status_key).count()
        
        # Recent activity (last 30 days)
        from datetime import timedelta
        recent_date = timezone.now() - timedelta(days=30)
        recent_applications = queryset.filter(created_at__gte=recent_date).count()
        recent_applied = queryset.filter(applied_at__gte=recent_date).count()
        
        # Priority breakdown
        priority_counts = {
            'high': queryset.filter(priority__gte=3).count(),
            'medium': queryset.filter(priority=2).count(),
            'low': queryset.filter(priority__lt=2).count()
        }
        
        # Top companies by application count
        from django.db.models import Count
        top_companies = (queryset
                        .values('role__company__name')
                        .annotate(count=Count('id'))
                        .order_by('-count')[:5])
        
        return Response({
            'total_applications': total,
            'status_counts': status_counts,
            'recent_activity': {
                'new_applications': recent_applications,
                'applications_submitted': recent_applied
            },
            'priority_counts': priority_counts,
            'top_companies': list(top_companies)
        })

class StageViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class = StageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['application', 'type', 'result']
    ordering_fields = ['created_at', 'scheduled_at']
    ordering = ['created_at']

    def get_queryset(self):
        return Stage.objects.filter(application__user=self.request.user)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming stages in the next 7 days"""
        from datetime import timedelta
        end_date = timezone.now() + timedelta(days=7)
        upcoming_stages = (self.get_queryset()
                          .filter(scheduled_at__gte=timezone.now(), 
                                 scheduled_at__lte=end_date,
                                 result__in=['', 'pending'])
                          .select_related('application__role__company')
                          .order_by('scheduled_at'))
        serializer = self.get_serializer(upcoming_stages, many=True)
        return Response(serializer.data)

class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class = DocumentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['application', 'kind']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Document.objects.filter(application__user=self.request.user)

    @action(detail=False, methods=['post'])
    def presign(self, request):
        """Return S3 presigned POST so frontend can upload directly."""
        s3 = boto3.client('s3', region_name=os.getenv('AWS_S3_REGION_NAME'))
        bucket = os.getenv('AWS_STORAGE_BUCKET_NAME')
        key = request.data.get('key')  # e.g., user/{id}/docs/{uuid}.pdf
        content_type = request.data.get('contentType') or ""
        
        # Validate key format and user permissions
        if not key or not key.startswith(f'user/documents/'):
            return Response({'error': 'Invalid key format'}, status=status.HTTP_400_BAD_REQUEST)
        
        fields = {}
        conditions = [
            ["content-length-range", 0, 10485760],  # 10MB max
            ["starts-with", "$key", "user/documents/"],
            ["starts-with", "$Content-Type", ""],
        ]
        
        if content_type:
            fields["Content-Type"] = content_type
            conditions.append(["eq", "$Content-Type", content_type])
        else:
            pass
        
        try:
            presigned = s3.generate_presigned_post(
                Bucket=bucket, 
                Key=key, 
                Fields=fields, 
                Conditions=conditions, 
                ExpiresIn=3600
            )
            return Response(presigned)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Generate download URL for document"""
        document = self.get_object()
        s3 = boto3.client('s3', region_name=os.getenv('AWS_S3_REGION_NAME'))
        bucket = os.getenv('AWS_STORAGE_BUCKET_NAME')
        
        try:
            url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': document.s3_key},
                ExpiresIn=3600
            )
            return Response({'download_url': url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReminderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class = ReminderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['done', 'application']
    ordering_fields = ['due_at', 'created_at']
    ordering = ['due_at']

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user).select_related('application__role__company')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue reminders"""
        overdue = (self.get_queryset()
                  .filter(due_at__lt=timezone.now(), done=False)
                  .order_by('due_at'))
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming reminders in next 7 days"""
        from datetime import timedelta
        end_date = timezone.now() + timedelta(days=7)
        upcoming = (self.get_queryset()
                   .filter(due_at__gte=timezone.now(), 
                          due_at__lte=end_date, 
                          done=False)
                   .order_by('due_at'))
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_done(self, request):
        """Mark multiple reminders as done"""
        reminder_ids = request.data.get('reminder_ids', [])
        updated_count = (self.get_queryset()
                        .filter(id__in=reminder_ids, done=False)
                        .update(done=True))
        return Response({'updated': updated_count})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Reminder statistics"""
        queryset = self.get_queryset()
        total = queryset.count()
        done = queryset.filter(done=True).count()
        overdue = queryset.filter(due_at__lt=timezone.now(), done=False).count()
        
        # Upcoming in next 7 days
        from datetime import timedelta
        end_date = timezone.now() + timedelta(days=7)
        upcoming = queryset.filter(
            due_at__gte=timezone.now(), 
            due_at__lte=end_date, 
            done=False
        ).count()
        
        return Response({
            'total': total,
            'completed': done,
            'overdue': overdue,
            'upcoming': upcoming,
            'pending': total - done
        })
from django.db import models
from django.conf import settings
# Create your models here.

class Company(models.Model):
    name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    def __str__(self): return self.name

class Role(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='roles')
    title = models.CharField(max_length=200)
    level = models.CharField(max_length=100, blank=True)  # e.g., Intern, Junior
    job_url = models.URLField(blank=True)
    stack_tags = models.JSONField(default=list, blank=True)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True)
    def __str__(self): return f"{self.title} @ {self.company.name}"

class Application(models.Model):
    STATUS_CHOICES = [
        ('saved','Saved'),('applied','Applied'),('oa','Online Assessment'),('tech','Tech Interview'),('hr','HR Interview'),('final','Final'),('offer','Offer'),('reject','Rejected'),('accept','Accepted')
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='saved')
    source = models.CharField(max_length=100, blank=True)  # LinkedIn, Career site
    applied_at = models.DateTimeField(null=True, blank=True)
    deadline_at = models.DateTimeField(null=True, blank=True)
    priority = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Stage(models.Model):
    TYPE_CHOICES = [('oa','OA'),('tech','Tech'),('hr','HR'),('final','Final'),('other','Other')]
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='stages')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    result = models.CharField(max_length=100, blank=True)  # pass/fail/pending
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Document(models.Model):
    KIND_CHOICES = [('resume','Resume'),('cover','Cover'),('es','Entry Sheet'),('offer','Offer'),('other','Other')]
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='documents')
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    s3_key = models.CharField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)

class Reminder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    due_at = models.DateTimeField()
    message = models.CharField(max_length=255)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

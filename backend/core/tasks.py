from celery import shared_task
from django.utils import timezone
from .models import Reminder
import boto3, os

@shared_task
def send_due_reminders():
    now = timezone.now()
    qs = Reminder.objects.filter(due_at__lte=now, done=False)
    if not qs.exists(): return 0
    ses = boto3.client('ses', region_name=os.getenv('SES_REGION'))
    count = 0
    for r in qs:
        ses.send_email(
            Source=os.getenv('SES_SENDER'),
            Destination={'ToAddresses':[r.user.email]},
            Message={'Subject':{'Data':'Reminder: ' + r.message}, 'Body':{'Text':{'Data': f"Due: {r.due_at}\n\n{r.message}"}}}
        )
        r.done = True
        r.save(update_fields=['done'])
        count += 1
    return count

# users/services.py
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from .models import EmailVerificationCode


def create_inactive_user(email, password):
    user = User(username=email, email=email, is_active=False)
    user.set_password(password)
    user.save()
    return user


def send_verification_code(email):
    user = User.objects.get(email=email)
    EmailVerificationCode.objects.filter(user=user, is_used=False).delete()
    code_obj = EmailVerificationCode.objects.create(user=user)
    send_mail(
        subject='Код подтверждения',
        message=f'Ваш код: {code_obj.code}',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
    return code_obj


def activate_user(email):
    user = User.objects.get(email=email)
    user.is_active = True
    user.save()
    return user

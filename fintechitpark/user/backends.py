from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User


class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Если username передан как email, пытаемся найти пользователя
        if username and '@' in username:
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                return None
            if user.check_password(password):
                return user
        return super().authenticate(request, username, password, **kwargs)

from django.urls import path
from .views import RegisterRequestView, VerifyCodeView, LoginView, ResendCodeView, YouGileAuthView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterRequestView.as_view(), name='register'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify-code'),
    path('resend-code/', ResendCodeView.as_view(), name='resend-code'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('yougile/auth/', YouGileAuthView.as_view(), name='yougile-auth'),
]

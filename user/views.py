from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import (
    RegisterRequestSerializer,
    VerifyCodeSerializer,
    LoginSerializer,
    UserSerializer,
    EmailSerializer,
)
from .services import create_inactive_user, send_verification_code, activate_user
from .models import EmailVerificationCode


class RegisterRequestView(APIView):
    permission_classes = []

    @extend_schema(
        request=RegisterRequestSerializer,
        responses={
            200: OpenApiResponse(description='Код отправлен', response={'type': 'object', 'properties': {'detail': {'type': 'string'}}}),
            400: OpenApiResponse(description='Ошибка валидации'),
        }
    )
    def post(self, request):
        serializer = RegisterRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = create_inactive_user(email, password)
        send_verification_code(email)
        return Response({'detail': 'Код отправлен. Подтвердите email.'}, status=200)


class VerifyCodeView(APIView):
    permission_classes = []

    @extend_schema(
        request=VerifyCodeSerializer,
        responses={
            200: OpenApiResponse(description='Успешная активация и токены'),
            400: OpenApiResponse(description='Ошибка: код истёк, неверный код или email уже подтверждён'),
            404: OpenApiResponse(description='Пользователь не найден'),
        }
    )
    def post(self, request):
        serializer = VerifyCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({'error': 'Email уже подтверждён.'}, status=400)
            code_obj = EmailVerificationCode.objects.filter(user=user, code=code, is_used=False).latest('created_at')
            if not code_obj.is_valid():
                return Response({'error': 'Код истёк.'}, status=400)
            code_obj.is_used = True
            code_obj.save()
            activate_user(email)
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
            })
        except User.DoesNotExist:
            return Response({'error': 'Пользователь не найден.'}, status=404)
        except EmailVerificationCode.DoesNotExist:
            return Response({'error': 'Неверный код.'}, status=400)


class LoginView(APIView):
    permission_classes = []

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description='Успешный вход (токены и данные пользователя)'),
            401: OpenApiResponse(description='Неверный email/пароль или email не подтверждён'),
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        auth_user = authenticate(request, username=email, password=password)
        if not auth_user or not auth_user.is_active:
            return Response({'error': 'Неверный email/пароль или email не подтверждён.'}, status=401)
        refresh = RefreshToken.for_user(auth_user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(auth_user).data,
        })


class ResendCodeView(APIView):
    permission_classes = []

    @extend_schema(
        request=EmailSerializer,
        responses={
            200: OpenApiResponse(description='Новый код отправлен'),
            400: OpenApiResponse(description='Email уже подтверждён'),
            404: OpenApiResponse(description='Пользователь не найден'),
        }
    )
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({'error': 'Email уже подтверждён. Войдите.'}, status=status.HTTP_400_BAD_REQUEST)
            send_verification_code(email)
            return Response({'detail': 'Новый код отправлен на почту.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Пользователь с таким email не найден.'}, status=status.HTTP_404_NOT_FOUND)
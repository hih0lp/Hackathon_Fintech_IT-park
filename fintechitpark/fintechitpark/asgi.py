# fintechitpark/asgi.py
import os

# Сначала загружаем Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fintechitpark.settings')

# Затем получаем Django ASGI приложение
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

# А потом импортируем все остальное
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from chat.consumers import ChatConsumer
from chat.auth_middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(
        URLRouter([
            path('ws/chat/<int:chat_id>/', ChatConsumer.as_asgi()),
        ])
    ),
})
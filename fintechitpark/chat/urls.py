from django.urls import path
from .views import ChatListCreateView, ChatMessagesView, ChatDeleteView

urlpatterns = [
    path('', ChatListCreateView.as_view(), name='chat-list-create'),
    path('chats/<int:pk>/', ChatDeleteView.as_view(), name='chat-delete'),
    path('<int:chat_id>/messages/', ChatMessagesView.as_view(), name='chat-messages'),
]

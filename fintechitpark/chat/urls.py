from django.urls import path
from .views import ChatListCreateView, ChatMessagesView, ChatDeleteView, AskLLMView, LLMRequestStatusView

urlpatterns = [
    path('', ChatListCreateView.as_view(), name='chat-list-create'),
    path('<int:pk>/', ChatDeleteView.as_view(), name='chat-delete'),
    path('<int:chat_id>/messages/', ChatMessagesView.as_view(), name='chat-messages'),
    path('<int:chat_id>/ask/', AskLLMView.as_view(), name='chat-ask'),
    path('<int:chat_id>/ask/<int:request_id>/', LLMRequestStatusView.as_view(), name='llm-request-status'),
]

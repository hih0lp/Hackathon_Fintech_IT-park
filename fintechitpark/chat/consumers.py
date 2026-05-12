# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Chat, Message, LLMRequest
from .llm_service import call_llm


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """При подключении WebSocket"""
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'

        # Проверяем аутентификацию
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
            return

        # Проверяем, имеет ли пользователь доступ к чату
        has_access = await self.check_chat_access(user, self.chat_id)
        if not has_access:
            await self.close()
            return

        # Добавляем в группу
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Отправляем историю сообщений
        await self.send_history()

    async def disconnect(self, close_code):
        """При отключении WebSocket"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Получение сообщения от клиента"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')

            if message_type == 'message':
                # Обычное сообщение
                user_message = data.get('message', '')
                if user_message:
                    await self.handle_user_message(user_message)

            elif message_type == 'ping':
                # Keep-alive
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))

        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            await self.send_error(str(e))

    async def handle_user_message(self, user_message):
        """Обработка сообщения пользователя"""
        user = self.scope['user']

        # Получаем контекст чата
        context = await self.get_chat_context(self.chat_id)

        # Создаем LLMRequest
        llm_req = await self.create_llm_request(
            self.chat_id,
            user_message,
            context
        )

        # Запускаем задачу в Dramatiq
        # Используем database_sync_to_async для синхронного вызова
        try:
            call_llm.send(llm_req.id, self.chat_id, user_message, context)
        except Exception as e:
            await self.send(text_data=json.dumps({
                "error": e
            }))
            return

        # Отправляем статус о начале обработки
        await self.send(text_data=json.dumps({
            'type': 'processing_started',
            'request_id': llm_req.id
        }))

    async def llm_response(self, event):
        """Получение ответа от LLM (через Channel Layer)"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'bot_response',
                'message': event['message'],
                'request_id': event['request_id'],
                'tasks': event.get('tasks', []),
                'status': event.get('status', 'completed')
            }))
            print(f"✅ [CONSUMER] Message sent to client")
        except Exception as e:
            print(f"❌ [CONSUMER] Error sending to client: {e}")

    async def send_history(self):
        """Отправка истории сообщений"""
        messages = await self.get_chat_history(self.chat_id)

        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))

    # async def send_chat_message(self, sender, text, request_id=None):
    #     """Отправка сообщения в чат"""
    #     await self.send(text_data=json.dumps({
    #         'type': 'chat_message',
    #         'sender': sender,
    #         'message': text,
    #         'request_id': request_id,
    #         'timestamp': None  # Можно добавить время
    #     }))

    async def send_error(self, error_message):
        """Отправка ошибки"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))

    # Database operations
    @database_sync_to_async
    def check_chat_access(self, user, chat_id):
        """Проверка доступа к чату"""
        return Chat.objects.filter(
            id=chat_id,
            project__user=user
        ).exists()

    @database_sync_to_async
    def get_chat_context(self, chat_id):
        """Получение контекста чата"""
        chat = Chat.objects.get(id=chat_id)
        messages = chat.messages.order_by('created_at')

        context = "История диалога:\n"
        for msg in messages:
            context += f"{msg.sender}: {msg.text}\n"

        context += f"\nИнформация о проекте:\n"
        context += f"Название: {chat.project.title}\n"
        context += f"Описание: {chat.project.description}\n"
        context += f"Страна: {chat.project.country}"

        return context

    @database_sync_to_async
    def create_llm_request(self, chat_id, user_message, context):
        """Создание LLMRequest"""
        return LLMRequest.objects.create(
            chat_id=chat_id,
            user_message=user_message,
            context_text=context,
            status='pending'
        )

    @database_sync_to_async
    def get_llm_request(self, request_id):
        """Получение LLMRequest"""
        try:
            return LLMRequest.objects.get(id=request_id)
        except LLMRequest.DoesNotExist:
            return None

    @database_sync_to_async
    def get_chat_history(self, chat_id):
        """Получение истории чата"""
        messages = Message.objects.filter(
            chat_id=chat_id
        ).order_by('created_at').values('sender', 'text', 'created_at')

        return [
            {
                'sender': m['sender'],
                'text': m['text'],
                'timestamp': m['created_at'].isoformat()
            }
            for m in messages
        ]
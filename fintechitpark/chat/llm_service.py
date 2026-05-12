import mimetypes
import os
import django
import json

# Импорты для WebSocket - в самом верху!
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Важно! Настройка Django перед импортом моделей
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fintechitpark.settings')
django.setup()

import httpx
import dramatiq
from .models import LLMRequest, Message, Chat


@dramatiq.actor(
    max_retries=3,
    min_backoff=60000,
    max_backoff=60000
)
def call_llm(llm_request_id: int, chat_id: int, user_message: str, context_text: str):
    """Отправляет запрос к LLM-микросервису (SSE поток)"""
    req = None
    try:
        req = LLMRequest.objects.get(id=llm_request_id)
        req.status = 'processing'
        req.save()

        chat = Chat.objects.get(id=chat_id)
        # Сохраняем сообщение пользователя
        Message.objects.create(chat=chat, sender='user', text=user_message)

        # 1. Собираем файлы проекта
        project_files = chat.project.files.all()
        files_for_llm = []
        for pf in project_files:
            with pf.file.open('rb') as f:
                file_content = f.read()
            file_name = str(pf.file.name)
            content_type = mimetypes.guess_type(file_name)[0] or 'application/octet-stream'
            files_for_llm.append(
                ('context_files', (file_name, file_content, content_type))
            )

        # 2. Формируем данные формы
        data = {
            'msg': user_message,
            'context_text': context_text,
        }

        # 3. POST-запрос к LLM
        url = 'https://agent.psbsmartedu.ru/v1/orchestrate'

        msg = None
        tasks = []

        with httpx.Client(timeout=600) as client:
            response = client.post(url, data=data, files=files_for_llm)

            if response.status_code != 200:
                raise Exception(f"LLM service returned {response.status_code}: {response.text[:200]}")

            response_text = response.text
            print(f"Raw response: {response_text[:500]}")

            # Парсим SSE формат
            result = None
            for line in response_text.strip().split('\n'):
                if line.startswith('data: '):
                    data_content = line[6:]
                    if data_content and data_content != '[DONE]':
                        try:
                            parsed = json.loads(data_content)
                            result = parsed
                        except json.JSONDecodeError:
                            print(f"Failed to parse: {data_content}")

            if result is None:
                try:
                    result = response.json()
                except:
                    result = {}

        # 4. Обрабатываем различные типы ответов
        if result.get('blocked'):
            msg = "⚠️ Ваш запрос был заблокирован системой безопасности. Пожалуйста, переформулируйте сообщение."

        elif result.get('clarify'):
            clarification_questions = result.get('questions', [])
            msg = "🔍 Для продолжения мне нужно уточнить несколько моментов:\n\n"
            for i, question in enumerate(clarification_questions, 1):
                msg += f"{i}. {question}\n"
            msg += "\nПожалуйста, ответьте на эти вопросы."

        elif result.get('type') == 'done':
            result_data = result.get('result', {})
            agents_data = result_data.get('agents', {})
            errors = result_data.get('errors', {})
            action = result_data.get('action', 'unknown')

            msg_parts = [f"🏷️ **Действие:** {action}\n"]
            all_tasks = []

            for agent_name, agent_result in agents_data.items():
                spec = agent_result.get('spec', '')
                if spec and spec != "...":
                    msg_parts.append(f"\n**{agent_name.replace('_', ' ').title()}**:\n{spec}")

                agent_tasks = agent_result.get('tasks', [])
                for task in agent_tasks:
                    if task and task != "...":
                        all_tasks.append({
                            'title': task,
                            'agent': agent_name
                        })

            if errors:
                msg_parts.append("\n⚠️ **Ошибки при обработке:**")
                for agent_name, error in errors.items():
                    msg_parts.append(f"- {agent_name}: {error}")

            msg = "\n".join(msg_parts) if len(msg_parts) > 1 else "Запрос обработан, но спецификации не сформированы."
            tasks = all_tasks

        elif result.get('type') == 'error':
            error_detail = result.get('detail', 'Неизвестная ошибка')
            msg = f"❌ **Ошибка обработки запроса:**\n{error_detail}"
            if "Content filter failed" in error_detail:
                msg += "\n\nВаш запрос содержит недопустимый контент. Пожалуйста, измените сообщение."
            elif "Ambiguity resolver failed" in error_detail:
                msg += "\n\nНе удалось разрешить неоднозначность запроса. Пожалуйста, уточните детали."

        elif result.get('type') == 'agent_error':
            agent_name = result.get('agent', 'unknown')
            error_detail = result.get('detail', 'Unknown error')
            msg = f"⚠️ **Ошибка агента '{agent_name}':**\n{error_detail}\n\nНекоторые функции временно недоступны. Пожалуйста, попробуйте позже."

        elif result.get('result') and result.get('result').get('ambiguity'):
            ambiguity = result['result']['ambiguity']
            if ambiguity.get('action') == 'patch':
                msg = "🔧 Требуется уточнение для продолжения работы."

        else:
            msg = "Получен ответ от нейросети, но формат не распознан. Пожалуйста, обратитесь к администратору."
            tasks = []

        # Сохраняем ответ бота
        if msg:
            Message.objects.create(chat=chat, sender='bot', text=msg)

        # Создаем задачи, если есть
        if tasks:
            from task.models import Task
            for task_data in tasks:
                Task.objects.create(
                    chat=chat,
                    title=task_data.get('title', 'Задача без названия'),
                    active=False,
                )

        # 5. Обновляем статус LLMRequest
        req.status = 'completed'
        req.result_text = msg or "Ответ не сформирован"
        req.tasks_data = tasks
        req.save()

        # 6. Отправляем результат через WebSocket
        print(f"🔍 [DEBUG] Preparing to send WebSocket message for chat_{chat_id}")
        print(f"🔍 [DEBUG] Channel layer module imported")

        try:
            # channel_layer уже импортирован вверху
            channel_layer = get_channel_layer()
            print(f"🔍 [DEBUG] Channel layer obtained: {channel_layer}")

            if channel_layer is None:
                print(f"❌ [ERROR] Channel layer is None! Check CHANNEL_LAYERS settings")
            else:
                group_name = f'chat_{chat_id}'
                print(f"🔍 [DEBUG] Sending to group: {group_name}")

                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'llm_response',  # Должно совпадать с методом в Consumer
                        'message': msg,
                        'request_id': llm_request_id,
                        'tasks': tasks,
                        'status': 'completed'
                    }
                )
                print(f"✅ [SUCCESS] WebSocket message sent to group '{group_name}'")

        except Exception as ws_error:
            print(f"❌ [ERROR] WebSocket send failed: {ws_error}")
            import traceback
            traceback.print_exc()

        print(f"✅ Запрос {llm_request_id} успешно обработан")

    except Exception as e:
        print(f"❌ Ошибка в запросе {llm_request_id}: {str(e)}")
        if req:
            req.status = 'failed'
            req.error_message = str(e)
            req.save()
        raise
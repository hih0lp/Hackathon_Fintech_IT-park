# project/yougile_service.py
import requests
from django.conf import settings
from rest_framework import status


class YouGileAPIError(Exception):
    """Кастомное исключение для ошибок YouGile API"""
    pass


def call_yougile_api(method, endpoint, api_key, data=None):
    """Универсальная функция для вызова YouGile API"""
    url = f"https://ru.yougile.com/api-v2/{endpoint}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.request(method, url, json=data, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise YouGileAPIError(f"Ошибка YouGile API: {str(e)}")


def create_yougile_project(api_key, title):
    """Создаёт проект в YouGile и возвращает его ID"""
    data = {
        "title": title,
    }
    result = call_yougile_api("POST", "projects", api_key, data)
    project_id = result.get("id")
    if not project_id:
        raise YouGileAPIError("Не удалось получить ID проекта из ответа YouGile")
    return project_id


def add_board_id(api_key, yougile_project_id, title):
    """Возвращает ID первой доски в проекте"""
    data = {
        "title": title,
        'projectId': yougile_project_id
    }
    result = call_yougile_api("POST", "boards", api_key, data)
    board_id = result.get("id")
    if not board_id:
        raise YouGileAPIError("Не удалось получить ID доски")
    return board_id


def add_column_id(api_key, board_id):
    """Создает и возвращает ID первой колонки в доске"""
    column = None
    columns = {
        'Готово': 4,
        'В работе': 3,
        'Новое': 1
    }

    for column_title, color in columns.items():
        data = {
            "title": column_title,
            'boardId': board_id,
            'color': color
        }
        result = call_yougile_api("POST", "columns", api_key, data)
        if column_title == 'Новое':
            column = result.get("id")
    if not column:
        raise YouGileAPIError("В доске нет ни одной колонки")
    return column


def sync_project_with_yougile(user, project):
    """
    Синхронизирует проект с YouGile:
    - создаёт проект в YouGile
    - получает columnId
    - сохраняет его в project.yougile_column_id
    """
    api_key = user.profile.yougile_api_key
    if not api_key:
        raise YouGileAPIError("У пользователя не настроен YouGile API-ключ")

    # 1. Создаём проект
    yougile_project_id = create_yougile_project(api_key, project.title)

    # 2. Получаем ID доски
    board_id = add_board_id(api_key, yougile_project_id, project.title)

    # 3. Получаем ID колонки
    column_id = add_column_id(api_key, board_id)

    # 4. Сохраняем column_id в модель
    project.yougile_column_id = column_id
    project.save()

    return column_id


def create_yougile_task(api_key, column_id, title, description=""):
    data = {
        "title": title,
        "description": description,
        "columnId": column_id,
    }
    result = call_yougile_api("POST", "tasks", api_key, data)
    task_id = result.get("id")
    if not task_id:
        raise YouGileAPIError("Не удалось получить ID задачи из ответа YouGile")
    return task_id

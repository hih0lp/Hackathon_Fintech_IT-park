# project/yougile_service.py
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class YouGileAPIError(Exception):
    """Кастомное исключение для ошибок YouGile API"""

    def __init__(self, message, status_code=None, response_body=None):
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


def call_yougile_api(method, endpoint, api_key, data=None, expected_status=201):
    """
    Универсальная функция для вызова YouGile API с улучшенной обработкой ошибок.

    Args:
        method: 'GET', 'POST', 'PUT', 'DELETE'
        endpoint: относительный путь, например 'projects' или 'boards'
        api_key: Bearer токен
        data: dict для тела запроса (если есть)
        expected_status: ожидаемый HTTP статус (по умолчанию 201)

    Returns:
        dict: JSON ответа
    """
    url = f"https://ru.yougile.com/api-v2/{endpoint}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.request(method, url, json=data, headers=headers, timeout=10)

        # Логируем для отладки
        logger.debug(f"YouGile API {method} {endpoint} -> {response.status_code}")
        if response.status_code != expected_status:
            logger.error(f"Unexpected status {response.status_code}, expected {expected_status}")
            logger.error(f"Response body: {response.text[:500]}")

        # Проверяем наличие ошибки в теле ответа (YouGile часто возвращает 200 с полем 'error')
        try:
            resp_json = response.json()
        except:
            resp_json = {}

        # Если в ответе есть поле error или statusCode != 0 – значит ошибка
        if resp_json.get('error') or resp_json.get('statusCode') not in [None, 0, 200]:
            error_msg = resp_json.get('error', resp_json.get('message', 'Unknown error'))
            raise YouGileAPIError(
                message=f"YouGile API error: {error_msg}",
                status_code=response.status_code,
                response_body=resp_json
            )

        # Статус 2xx – нормально, но проверяем наличие id (если создание)
        if response.status_code in (200, 201, 204):
            return resp_json

        # Любой другой статус считаем ошибкой
        raise YouGileAPIError(
            message=f"HTTP {response.status_code}: {response.text[:200]}",
            status_code=response.status_code,
            response_body=resp_json
        )

    except requests.exceptions.RequestException as e:
        logger.exception(f"YouGile API request failed: {e}")
        raise YouGileAPIError(f"Ошибка соединения с YouGile API: {str(e)}")
    except YouGileAPIError:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in call_yougile_api: {e}")
        raise YouGileAPIError(f"Неизвестная ошибка: {str(e)}")


def create_yougile_project(api_key, title):
    """Создаёт проект в YouGile и возвращает его ID"""
    data = {"title": title}
    result = call_yougile_api("POST", "projects", api_key, data)
    project_id = result.get("id")
    if not project_id:
        raise YouGileAPIError("Не удалось получить ID проекта из ответа YouGile")
    logger.info(f"YouGile project created: {project_id} ({title})")
    return project_id


def add_board_id(api_key, yougile_project_id, title):
    """Создаёт доску в проекте и возвращает её ID"""
    data = {
        "title": title,
        "projectId": yougile_project_id
    }
    result = call_yougile_api("POST", "boards", api_key, data)
    board_id = result.get("id")
    if not board_id:
        raise YouGileAPIError("Не удалось получить ID доски")
    logger.info(f"YouGile board created: {board_id} for project {yougile_project_id}")
    return board_id


def add_column_id(api_key, board_id):
    """
    Создаёт три стандартные колонки ('Новое', 'В работе', 'Готово')
    и возвращает ID колонки 'Новое' (или первой по порядку).
    """
    columns_config = [
        {"title": 'Готово', "color": 4},  # цвет как строка (hex)
        {"title": "В работе", "color": 3},
        {"title": "Новое", "color": 1},
    ]
    new_column_id = None

    for col in columns_config:
        data = {
            "title": col["title"],
            "boardId": board_id,
            "color": col["color"]
        }
        try:
            result = call_yougile_api("POST", "columns", api_key, data)
            column_id = result.get("id")
            if col["title"] == "Новое":
                new_column_id = column_id
            logger.debug(f"Column '{col['title']}' created with ID {column_id}")
        except YouGileAPIError as e:
            logger.error(f"Failed to create column '{col['title']}': {e}")
            # Если не удалось создать колонку, прерываем синхронизацию
            raise

    if not new_column_id:
        raise YouGileAPIError("Не удалось создать колонку 'Новое'")

    logger.info(f"Column 'Новое' created with ID {new_column_id} for board {board_id}")
    return new_column_id


def sync_project_with_yougile(user, project):
    """
    Синхронизирует проект с YouGile:
    - создаёт проект в YouGile
    - создаёт доску
    - создаёт колонки
    - сохраняет column_id в project.yougile_column_id
    """
    api_key = user.profile.yougile_api_key
    if not api_key:
        raise YouGileAPIError("У пользователя не настроен YouGile API-ключ")

    logger.info(f"Starting YouGile sync for project {project.id} ({project.title})")

    # 1. Создаём проект
    yougile_project_id = create_yougile_project(api_key, project.title)

    # 2. Создаём доску
    board_id = add_board_id(api_key, yougile_project_id, project.title)

    # 3. Создаём колонки и получаем ID колонки "Новое"
    column_id = add_column_id(api_key, board_id)

    # 4. Сохраняем column_id в модель
    project.yougile_column_id = column_id
    project.save()

    logger.info(f"YouGile sync completed: project {project.id} -> {yougile_project_id}, column {column_id}")
    return column_id


def create_yougile_task(api_key, column_id, title, description=""):
    """Создаёт задачу в указанной колонке YouGile"""
    data = {
        "title": title,
        "description": description,
        "columnId": column_id,
    }
    result = call_yougile_api("POST", "tasks", api_key, data)
    task_id = result.get("id")
    if not task_id:
        raise YouGileAPIError("Не удалось получить ID задачи из ответа YouGile")
    logger.info(f"YouGile task created: {task_id} in column {column_id}")
    return task_id
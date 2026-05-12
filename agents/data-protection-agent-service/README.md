# Data Protection Agent Service

Легковесный Python-микросервис для privacy/data-protection анализа с обязательным использованием скилла `data-protection-agent.skill` и потоковой интеграцией с Anthropic Claude API.

## Что делает сервис

- Загружает инструкции агента из:
  - `skill/data-protection-agent/SKILL.md`
  - `skill/data-protection-agent/references/regulations.md`
- На каждый запрос формирует вход строго как JSON:
  - `{"msg": "...", "context": ...}`
- Отправляет запрос в Claude с `stream=true`
- Возвращает клиенту SSE-поток (`text/event-stream`) без буферизации

## Структура

- `app/` — API и клиент Anthropic
- `skill/` — скилл рядом с сервисом (копируется в Docker при build)
- `tests/` — базовые тесты
- `Dockerfile`, `docker-compose.yml`

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_BASE_URL`
- `CLAUDE_MODEL`
- `MAX_TOKENS`
- `ANTHROPIC_TEMPERATURE`
- `SKILL_DIR`

`.env` и другие env-файлы добавлены в `.gitignore`.

## Локальный запуск

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8082
```

## Docker

```bash
docker compose up --build
```

## Пример запроса (stream)

```bash
curl -N -X POST "http://localhost:8082/v1/analyze/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "msg":"Оцени риски обработки персональных данных в новой функции",
    "context":{
      "region":"EU",
      "product_type":"web app",
      "feature":"behavioral analytics"
    }
  }'
```

Поток возвращает SSE-события в формате `data: {...}`:
- `{"type":"token","text":"..."}` — очередной кусок ответа
- `{"type":"done","result":"..."}` — финальный полный текст
- `{"type":"error","detail":"..."}` — ошибка

## Healthcheck

```bash
curl http://localhost:8082/health
```

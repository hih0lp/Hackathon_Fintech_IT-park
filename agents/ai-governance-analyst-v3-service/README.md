# AI Governance Analyst v3 Service

Легковесный Python-микросервис для анализа уязвимостей в домене AI Governance с обязательным использованием скилла `ai-governance-analyst-v3.skill` и потоковой интеграцией с Anthropic Claude API.

## Что делает сервис

- Загружает инструкции агента из:
  - `skill/ai-governance-analyst-v3/SKILL.md`
  - `skill/ai-governance-analyst-v3/references/regulations.md`
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
uvicorn app.main:app --host 0.0.0.0 --port 8085
```

## Docker

```bash
docker compose up --build
```

## Пример запроса (stream)

```bash
curl -N -X POST "http://localhost:8085/v1/analyze/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "msg":"Оцени AI governance риски запуска automated credit decisioning",
    "context":{
      "region":"EU",
      "product_type":"lending",
      "feature":"automated model scoring"
    }
  }'
```

Поток возвращает SSE-события в формате `data: {...}`:
- `{"type":"token","text":"..."}` — очередной кусок ответа
- `{"type":"done","result":"..."}` — финальный полный текст
- `{"type":"error","detail":"..."}` — ошибка

## Healthcheck

```bash
curl http://localhost:8085/health
```
from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any, AsyncIterator

import anthropic

from .config import Settings
from .schemas import CustomAgentDef


logger = logging.getLogger("custom-agents")


RANKING_SUFFIX = """

---

## Обязательный контракт вывода (общий для всех агентов пайплайна)

Ты работаешь как один из доменных агентов в общем пайплайне compliance-анализа.
Твоя роль (домен) описана выше. Дальше — единые правила скоринга и формата,
которые ты обязан соблюдать вне зависимости от домена.

### Входной формат

```json
{ "msg": "описание фичи или продукта", "context": "контекст проекта" }
```

### Алгоритм

1. **Mini-research.** Если фича вообще не касается твоего домена — верни `{"spec": "", "tasks": []}` и остановись.
2. **Найди уязвимости** в рамках своего домена (всё, что вне домена — молча игнорируй).
3. **Скоринг.** Для каждой уязвимости оцени по двум осям (1–10):
   - `cost` — стоимость разработки фикса (1 = правка текста, 10 = архитектурный редизайн)
   - `severity` — насколько блокирует прод (1 = косметика, 10 = блокер / штраф / запрет сервиса)

   Формула:
   ```
   score = cost + (severity * 1.5)
   normalized_score = score / 2.5
   ```
   Максимум = 10. **Порог включения: normalized_score > 7.5.**

4. **Сортировка** включённых уязвимостей по убыванию `normalized_score`.
5. **Не выводи** ни сами числа, ни промежуточные оценки — они только для внутренней фильтрации и сортировки.

### Формат вывода (СТРОГО)

Верни **только** JSON, без markdown-обёрток, без префиксов, без пояснений:

```json
{
  "spec": "<Название твоего домена на языке запроса>\\n1) Краткое название — суть проблемы и фикс в 1-2 предложениях. Основание: <регуляция/принцип>.\\n2) ...",
  "tasks": ["короткое предложение по улучшению ≤12 слов", "..."]
}
```

Правила:
- Первая строка `spec` — заголовок твоего домена на языке запроса.
- Далее нумерованный список уязвимостей с `normalized_score > 7.5`, отсортированный по убыванию.
- Если ничего не прошло порог — `spec` содержит только заголовок домена.
- `tasks` — до 3 коротких улучшений по твоему домену в императиве; если нечего предложить — `[]`.
- Язык вывода — язык входного `msg`.
- Никаких ключей кроме `spec` и `tasks`. Никаких ```json``` фенсов, никакого текста до или после JSON.
"""


def _sse(data: dict[str, object]) -> str:
    return "data: " + json.dumps(data, ensure_ascii=False) + "\n\n"


def _strip_json_artifacts(text: str) -> str:
    cleaned = text.strip().lstrip("﻿").strip()
    cleaned = re.sub(r"^\s*```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    cleaned = re.sub(r"^\s*json\s*[:\n\r]+", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def _try_parse_json(text: str) -> Any:
    cleaned = _strip_json_artifacts(text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    start_candidates = [i for i in (cleaned.find("{"), cleaned.find("[")) if i != -1]
    end_candidates = [i for i in (cleaned.rfind("}"), cleaned.rfind("]")) if i != -1]
    if start_candidates and end_candidates:
        start = min(start_candidates)
        end = max(end_candidates)
        if end > start:
            try:
                return json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError:
                pass
    return cleaned


async def _run_single_agent(
    agent: CustomAgentDef,
    msg: str,
    context: Any,
    settings: Settings,
) -> tuple[str, Any]:
    logger.info("Agent start: %s | model=%s", agent.name, settings.anthropic_model)
    client = anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key,
        base_url=settings.anthropic_base_url,
    )

    user_payload = json.dumps({"msg": msg, "context": context}, ensure_ascii=False)
    system_prompt = agent.skill.rstrip() + RANKING_SUFFIX
    full_text = ""
    stop_reason: str | None = None

    try:
        async with client.messages.stream(
            model=settings.anthropic_model,
            max_tokens=settings.anthropic_max_tokens,
            temperature=settings.anthropic_temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_payload}],
        ) as stream:
            async for text in stream.text_stream:
                full_text += text
            final = await stream.get_final_message()
            stop_reason = getattr(final, "stop_reason", None)
    except Exception as exc:
        logger.exception("Agent %s — Anthropic call failed: %s", agent.name, exc)
        raise

    if stop_reason == "max_tokens":
        logger.warning(
            "Agent %s — response truncated by max_tokens (len=%d)",
            agent.name,
            len(full_text),
        )

    logger.info(
        "Agent done: %s | stop_reason=%s | text_len=%d",
        agent.name,
        stop_reason or "?",
        len(full_text),
    )
    parsed = _try_parse_json(full_text)
    return agent.name, parsed


async def stream_custom_agents(
    agents: list[CustomAgentDef],
    msg: str,
    context: Any,
    settings: Settings,
) -> AsyncIterator[str]:
    logger.info("stream_custom_agents called with %d agents: %s",
                len(agents), [a.name for a in agents])

    if not agents:
        logger.warning("No custom agents to run")
        yield _sse({"type": "done", "result": {}, "errors": {}})
        return

    tasks = {
        asyncio.create_task(
            _run_single_agent(agent, msg, context, settings)
        ): agent.name
        for agent in agents
    }

    merged: dict[str, Any] = {}
    errors: dict[str, str] = {}
    pending = set(tasks.keys())

    while pending:
        done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            name = tasks[task]
            try:
                _, result = task.result()
                merged[name] = result
                yield _sse({"type": "agent", "agent": name, "result": result})
            except Exception as exc:
                errors[name] = str(exc)
                logger.error("Agent %s failed: %s", name, exc)
                yield _sse({"type": "agent_error", "agent": name, "detail": str(exc)})

    logger.info("All agents finished | success=%d | errors=%d", len(merged), len(errors))
    yield _sse({"type": "done", "result": merged, "errors": errors})

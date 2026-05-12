from __future__ import annotations

import asyncio
import json
import re
from typing import Any, AsyncIterator

import anthropic

from .config import Settings
from .schemas import CustomAgentDef


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
    client = anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key,
        base_url=settings.anthropic_base_url,
    )

    user_payload = json.dumps({"msg": msg, "context": context}, ensure_ascii=False)

    message = await client.messages.create(
        model=settings.anthropic_model,
        max_tokens=settings.anthropic_max_tokens,
        temperature=settings.anthropic_temperature,
        system=agent.skill,
        messages=[{"role": "user", "content": user_payload}],
    )

    raw_text = message.content[0].text if message.content else ""
    parsed = _try_parse_json(raw_text)
    return agent.name, parsed


async def stream_custom_agents(
    agents: list[CustomAgentDef],
    msg: str,
    context: Any,
    settings: Settings,
) -> AsyncIterator[str]:
    if not agents:
        yield _sse({"type": "done", "result": {}})
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
                yield _sse({"type": "agent_error", "agent": name, "detail": str(exc)})

    done_payload: dict[str, Any] = dict(merged)
    yield _sse({"type": "done", "result": done_payload})

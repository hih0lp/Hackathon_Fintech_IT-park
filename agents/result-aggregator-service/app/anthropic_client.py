from __future__ import annotations

import json
import re
from typing import Any, AsyncIterator

import anthropic

from .config import Settings
from .schemas import AggregateRequest


def build_user_payload(request: AggregateRequest) -> str:
    return json.dumps({"agents": request.agents}, ensure_ascii=False)


def _strip_json_artifacts(text: str) -> str:
    cleaned = text.strip().lstrip("﻿").strip()
    # remove opening ```json or ``` fence
    cleaned = re.sub(r"^\s*```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    # remove closing ``` fence
    cleaned = re.sub(r"\s*```\s*$", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    # remove stray "json:" or "json\n" prefix that some models emit
    cleaned = re.sub(r"^\s*json\s*[:\n\r]+", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


async def stream_anthropic_events(
    request: AggregateRequest,
    settings: Settings,
    system_prompt: str,
) -> AsyncIterator[str]:
    client = anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key,
        base_url=settings.anthropic_base_url,
    )

    payload = build_user_payload(request)
    full_text = ""

    try:
        async with client.messages.stream(
            model=settings.anthropic_model,
            max_tokens=settings.anthropic_max_tokens,
            temperature=settings.anthropic_temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": payload}],
        ) as stream:
            async for text in stream.text_stream:
                full_text += text
                yield (
                    "data: "
                    + json.dumps({"type": "token", "text": text}, ensure_ascii=False)
                    + "\n\n"
                )

            final = await stream.get_final_message()
            if final.stop_reason == "max_tokens":
                yield (
                    "data: "
                    + json.dumps(
                        {"type": "error", "detail": "Response truncated: max_tokens limit reached."},
                        ensure_ascii=False,
                    )
                    + "\n\n"
                )
                return

        yield (
            "data: "
            + json.dumps({"type": "done", "result": _strip_json_artifacts(full_text)}, ensure_ascii=False)
            + "\n\n"
        )
    except Exception as exc:
        yield (
            "data: "
            + json.dumps({"type": "error", "detail": str(exc)}, ensure_ascii=False)
            + "\n\n"
        )

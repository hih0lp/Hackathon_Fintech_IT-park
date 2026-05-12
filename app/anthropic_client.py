from __future__ import annotations

import json
import re
from typing import AsyncIterator

import anthropic

from .config import Settings
from .schemas import AgentRequest


_CODE_BLOCK = re.compile(r"^```[a-zA-Z]*\s*(.*?)\s*```$", re.DOTALL)


def _extract_json(text: str) -> str:
    """Strip markdown code fences and return clean JSON string."""
    stripped = text.strip()
    m = _CODE_BLOCK.match(stripped)
    if m:
        stripped = m.group(1).strip()
    return stripped


def _validate_json(text: str) -> dict:
    """Parse and return JSON; raise ValueError if invalid."""
    return json.loads(text)


def build_content(request: AgentRequest) -> str:
    return json.dumps(
        {"msg": request.msg, "context": request.context},
        ensure_ascii=False,
    )


async def stream_anthropic_events(
    request: AgentRequest,
    settings: Settings,
    system_prompt: str,
) -> AsyncIterator[str]:
    client = anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key,
        base_url=settings.anthropic_base_url,
    )

    payload = build_content(request)
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

        try:
            clean = _extract_json(full_text)
            parsed = _validate_json(clean)
        except (ValueError, json.JSONDecodeError) as exc:
            yield (
                "data: "
                + json.dumps(
                    {"type": "error", "detail": f"Invalid JSON from model: {exc}", "raw": full_text},
                    ensure_ascii=False,
                )
                + "\n\n"
            )
            return

        yield (
            "data: "
            + json.dumps({"type": "done", "result": parsed}, ensure_ascii=False)
            + "\n\n"
        )
    except Exception as exc:  # pragma: no cover
        yield (
            "data: "
            + json.dumps({"type": "error", "detail": str(exc)}, ensure_ascii=False)
            + "\n\n"
        )

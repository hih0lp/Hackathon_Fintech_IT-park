from __future__ import annotations

import json
from typing import AsyncIterator

import anthropic

from .config import Settings
from .schemas import AnalyzeRequest


_WEB_SEARCH_TOOLS: list[dict] = [
    {
        "type": "web_search_20250305",
        "name": "web_search",
        "max_uses": 5,
    }
]


def build_user_payload(request: AnalyzeRequest) -> str:
    return json.dumps(
        {
            "msg": request.msg,
            "context": request.context,
        },
        ensure_ascii=False,
    )


async def stream_anthropic_events(
    request: AnalyzeRequest,
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
            tools=_WEB_SEARCH_TOOLS,
            extra_headers={"anthropic-beta": "web-search-2025-03-05"},
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
                        {
                            "type": "error",
                            "detail": "Response truncated: max_tokens limit reached.",
                        },
                        ensure_ascii=False,
                    )
                    + "\n\n"
                )
                return

        yield (
            "data: "
            + json.dumps({"type": "done", "result": full_text}, ensure_ascii=False)
            + "\n\n"
        )
    except Exception as exc:  # pragma: no cover - provider-specific errors
        yield (
            "data: "
            + json.dumps({"type": "error", "detail": str(exc)}, ensure_ascii=False)
            + "\n\n"
        )

from __future__ import annotations

import json
from typing import AsyncIterator

import httpx
from fastapi import HTTPException

from .config import Settings
from .schemas import AnalyzeRequest


def build_anthropic_payload(
    request: AnalyzeRequest,
    settings: Settings,
    system_prompt: str,
) -> dict:
    skill_input = {
        "msg": request.msg,
        "context": request.context,
    }

    return {
        "model": settings.anthropic_model,
        "max_tokens": settings.anthropic_max_tokens,
        "temperature": settings.anthropic_temperature,
        "stream": True,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(skill_input, ensure_ascii=False),
                    }
                ],
            }
        ],
    }


async def stream_anthropic(
    payload: dict,
    settings: Settings,
) -> AsyncIterator[bytes]:
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": settings.anthropic_version,
        "content-type": "application/json",
        "accept": "text/event-stream",
    }

    timeout = httpx.Timeout(
        timeout=settings.anthropic_timeout_seconds,
        connect=min(settings.anthropic_timeout_seconds, 15.0),
    )

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST",
                settings.anthropic_api_url,
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code >= 400:
                    body = await response.aread()
                    detail = body.decode("utf-8", errors="ignore") or "Claude API error"
                    raise HTTPException(status_code=response.status_code, detail=detail)

                async for chunk in response.aiter_bytes():
                    if chunk:
                        yield chunk
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to Claude API: {exc}",
        ) from exc

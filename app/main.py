from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from .anthropic_client import stream_anthropic_events
from .config import get_settings
from .schemas import AnalyzeRequest
from .skill_loader import load_skill_prompt


settings = get_settings()
system_prompt = load_skill_prompt(settings.skill_markdown_path)

app = FastAPI(
    title="Filter Content Agent",
    version="1.0.0",
    description="Streaming microservice that detects LLM prompt-injection attempts before the main pipeline.",
)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse(
        {
            "status": "ok",
            "service": "filter-content-agent",
        }
    )


@app.post("/v1/analyze/stream")
async def analyze_stream(request: AnalyzeRequest) -> StreamingResponse:
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not configured.",
        )

    return StreamingResponse(
        stream_anthropic_events(request, settings, system_prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

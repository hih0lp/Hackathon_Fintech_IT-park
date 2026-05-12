from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from .anthropic_client import stream_anthropic_events
from .config import get_settings
from .schemas import AggregateRequest
from .skill_loader import load_skill_prompt


settings = get_settings()
system_prompt = load_skill_prompt(settings.skill_markdown_path)

app = FastAPI(
    title="Result Aggregator Agent",
    version="1.0.0",
    description="Merges and deduplicates outputs from all parallel compliance agents into a single {spec, tasks} response.",
)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok", "service": "result-aggregator-agent"})


@app.post("/v1/aggregate/stream")
async def aggregate_stream(request: AggregateRequest) -> StreamingResponse:
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

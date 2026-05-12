from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from .anthropic_client import stream_custom_agents
from .config import get_settings
from .schemas import ExecuteRequest


settings = get_settings()

app = FastAPI(
    title="Custom Agents Service",
    version="1.0.0",
    description="Runs user-defined custom agents in parallel against the Anthropic API.",
)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok", "service": "custom-agents-service"})


@app.post("/v1/execute/stream")
async def execute_stream(request: ExecuteRequest) -> StreamingResponse:
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not configured.",
        )

    return StreamingResponse(
        stream_custom_agents(
            request.custom_agents,
            request.msg,
            request.context,
            settings,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

from __future__ import annotations

from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from .anthropic_client import stream_anthropic_events
from .config import get_settings
from .file_parser import parse_upload
from .schemas import AgentRequest
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
    return JSONResponse({"status": "ok", "service": "filter-content-agent"})


@app.post("/v1/analyze/stream")
async def analyze_stream(
    msg: Annotated[str, Form(min_length=1)],
    context_text: Annotated[str | None, Form()] = None,
    context_files: Annotated[list[UploadFile], File()] = [],
) -> StreamingResponse:
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not configured.")

    parts: list[str] = []
    if context_text:
        parts.append(context_text)
    for f in context_files:
        if f.filename:
            parsed = await parse_upload(f)
            parts.append(f"[File: {parsed.filename}]\n{parsed.text}")

    request = AgentRequest(msg=msg, context="\n\n".join(parts))

    return StreamingResponse(
        stream_anthropic_events(request, settings, system_prompt),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

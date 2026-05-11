from __future__ import annotations

import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Iterator

from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse

from .agent_client import AgentCallError, call_agent_json
from .config import get_settings
from .schemas import AnalyzeRequest


settings = get_settings()

app = FastAPI(
    title="Agents Orchestrator Service",
    version="1.0.0",
    description="Single-entry orchestration service for all agent microservices.",
)


def _sse(data: dict[str, object]) -> str:
    return "data: " + json.dumps(data, ensure_ascii=False) + "\n\n"


@app.get("/health")
def health() -> JSONResponse:
    return JSONResponse(
        {
            "status": "ok",
            "service": "agents-orchestrator",
        }
    )


@app.post("/v1/orchestrate")
def orchestrate(request: AnalyzeRequest) -> StreamingResponse:
    payload = {
        "msg": request.msg,
        "context": request.context,
    }

    def event_stream() -> Iterator[str]:
        try:
            ambiguity_result = call_agent_json(
                settings.ambiguity_agent_url,
                payload,
                settings.request_timeout_seconds,
            )
        except AgentCallError as exc:
            yield _sse({"type": "error", "detail": f"Ambiguity resolver failed: {exc}"})
            return

        if not isinstance(ambiguity_result, dict):
            yield _sse(
                {"type": "error", "detail": "Ambiguity resolver returned non-object JSON."}
            )
            return

        action = str(ambiguity_result.get("action", "")).strip().lower()

        if action == "clarify":
            questions = ambiguity_result.get("questions", [])
            if not isinstance(questions, list):
                questions = [str(questions)]
            yield _sse({"type": "done", "result": {"questions": questions}})
            return

        if action != "patch":
            yield _sse({"type": "error", "detail": f"Unexpected ambiguity action: {action!r}"})
            return

        merged: dict[str, object] = {}
        errors: dict[str, str] = {}

        workers = max(1, min(settings.max_parallel_workers, len(settings.agent_urls)))
        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_map = {
                executor.submit(
                    call_agent_json,
                    url,
                    payload,
                    settings.request_timeout_seconds,
                ): name
                for name, url in settings.agent_urls.items()
            }

            for future in as_completed(future_map):
                name = future_map[future]
                try:
                    result = future.result()
                    merged[name] = result
                    yield _sse({"type": "agent", "agent": name, "result": result})
                except Exception as exc:  # pragma: no cover - defensive path
                    errors[name] = str(exc)
                    yield _sse(
                        {
                            "type": "agent_error",
                            "agent": name,
                            "detail": str(exc),
                        }
                    )

        response_payload: dict[str, object] = {
            "action": "patch",
            "ambiguity": ambiguity_result,
            "agents": merged,
        }
        if errors:
            response_payload["errors"] = errors

        yield _sse({"type": "done", "result": response_payload})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

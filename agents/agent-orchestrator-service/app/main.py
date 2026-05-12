from __future__ import annotations

import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Annotated, Iterator

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from .agent_client import AgentCallError, call_agent_json
from .config import get_settings
from .file_parser import parse_upload
from .schemas import AgentRequest


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] orchestrator: %(message)s",
)
logger = logging.getLogger("orchestrator")

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
    return JSONResponse({"status": "ok", "service": "agents-orchestrator"})


@app.post("/v1/orchestrate")
async def orchestrate(
    msg: Annotated[str, Form(min_length=1)],
    context_text: Annotated[str | None, Form()] = None,
    context_files: Annotated[list[UploadFile] | None, File()] = None,
    add_agents: Annotated[str | None, Form()] = None,
) -> StreamingResponse:
    parts: list[str] = []
    if context_text:
        parts.append(context_text)
    for f in (context_files or []):
        if f.filename:
            parsed = await parse_upload(f)
            parts.append(f"[File: {parsed.filename}]\n{parsed.text}")

    request = AgentRequest(msg=msg, context="\n\n".join(parts))
    payload = {"msg": request.msg, "context": request.context}

    logger.info(
        "Request received | msg_len=%d | add_agents_raw=%s",
        len(msg),
        add_agents[:120] if add_agents else "None",
    )

    def event_stream() -> Iterator[str]:
        logger.info("Stage 1/4 — content filter")
        try:
            filter_result = call_agent_json(
                settings.filter_content_agent_url,
                payload,
                settings.request_timeout_seconds,
            )
        except AgentCallError as exc:
            logger.error("Content filter failed: %s", exc)
            yield _sse({"type": "error", "detail": f"Content filter failed: {exc}"})
            return

        if not isinstance(filter_result, dict):
            yield _sse({"type": "error", "detail": "Content filter returned non-object JSON."})
            return

        filter_action = str(filter_result.get("action", "")).strip().lower()
        logger.info("Content filter action: %s", filter_action)

        if filter_action == "stop":
            yield _sse({"blocked": True})
            return

        if filter_action != "ok":
            yield _sse({"type": "error", "detail": f"Unexpected filter action: {filter_action!r}"})
            return

        logger.info("Stage 2/4 — ambiguity resolver")
        try:
            ambiguity_result = call_agent_json(
                settings.ambiguity_agent_url,
                payload,
                settings.request_timeout_seconds,
            )
        except AgentCallError as exc:
            logger.error("Ambiguity resolver failed: %s", exc)
            yield _sse({"type": "error", "detail": f"Ambiguity resolver failed: {exc}"})
            return

        if not isinstance(ambiguity_result, dict):
            yield _sse({"type": "error", "detail": "Ambiguity resolver returned non-object JSON."})
            return

        action = str(ambiguity_result.get("action", "")).strip().lower()
        logger.info("Ambiguity resolver action: %s", action)

        if action == "clarify":
            questions = ambiguity_result.get("questions", [])
            if not isinstance(questions, list):
                questions = [str(questions)]
            yield _sse({"clarify": True, "questions": questions})
            return

        if action != "patch":
            yield _sse({"type": "error", "detail": f"Unexpected ambiguity action: {action!r}"})
            return

        custom_agent_defs: list[dict[str, str]] = []
        if add_agents:
            try:
                custom_agent_defs = json.loads(add_agents)
                if not isinstance(custom_agent_defs, list):
                    custom_agent_defs = []
            except json.JSONDecodeError:
                yield _sse({"type": "error", "detail": "Invalid add_agents JSON."})
                return

        merged: dict[str, object] = {}
        custom_agents_merged: dict[str, object] = {}
        errors: dict[str, str] = {}

        has_custom = bool(custom_agent_defs)
        total = len(settings.agent_urls) + (1 if has_custom else 0)
        workers = max(1, min(settings.max_parallel_workers, total))

        builtin_names = list(settings.agent_urls.keys())
        custom_names = [a["name"] for a in custom_agent_defs if isinstance(a, dict) and "name" in a]
        logger.info(
            "Stage 3/4 — parallel agents (%d workers) | built-in: %s | custom: %s",
            workers,
            builtin_names,
            custom_names,
        )

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

            if has_custom:
                custom_payload = {
                    "msg": request.msg,
                    "context": request.context,
                    "custom_agents": custom_agent_defs,
                }
                custom_future = executor.submit(
                    call_agent_json,
                    settings.custom_agents_url,
                    custom_payload,
                    settings.request_timeout_seconds,
                )
                future_map[custom_future] = "__custom_agents__"

            for future in as_completed(future_map):
                name = future_map[future]
                try:
                    result = future.result()
                    if name == "__custom_agents__" and isinstance(result, dict):
                        if not result:
                            logger.warning("Custom-agents service returned empty result (no errors reported)")
                            errors["custom_agents"] = "Custom-agents service returned empty result"
                            yield _sse({"type": "agent_error", "agent": "custom_agents", "detail": "Custom-agents service returned empty result"})
                        else:
                            for agent_name, agent_result in result.items():
                                merged[agent_name] = agent_result
                                custom_agents_merged[agent_name] = agent_result
                                logger.info("Agent done [custom]: %s", agent_name)
                                yield _sse({"type": "agent", "agent": agent_name, "result": agent_result})
                    elif name != "__custom_agents__":
                        merged[name] = result
                        logger.info("Agent done [built-in]: %s", name)
                        yield _sse({"type": "agent", "agent": name, "result": result})
                except Exception as exc:
                    if name == "__custom_agents__":
                        errors["custom_agents"] = str(exc)
                        logger.error("Agent error [custom]: %s", exc)
                        yield _sse({"type": "agent_error", "agent": "custom_agents", "detail": str(exc)})
                    else:
                        errors[name] = str(exc)
                        logger.error("Agent error [built-in] %s: %s", name, exc)
                        yield _sse({"type": "agent_error", "agent": name, "detail": str(exc)})

        logger.info("Stage 4/4 — result aggregator | agents collected: %s", list(merged.keys()))
        try:
            aggregated = call_agent_json(
                settings.result_aggregator_url,
                {"agents": merged},
                settings.request_timeout_seconds,
            )
        except AgentCallError as exc:
            logger.error("Result aggregator failed: %s", exc)
            yield _sse({"type": "error", "detail": f"Result aggregator failed: {exc}"})
            return

        logger.info("Pipeline complete")

        response_payload: dict[str, object] = {
            "action": "patch",
            "ambiguity": ambiguity_result,
            "agents": merged,
            "result": aggregated,
        }
        if custom_agents_merged:
            response_payload["custom_agents"] = custom_agents_merged
        if errors:
            response_payload["errors"] = errors

        yield _sse({"type": "done", "result": response_payload})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

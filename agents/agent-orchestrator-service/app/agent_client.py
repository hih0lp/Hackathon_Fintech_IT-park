from __future__ import annotations

import json
import re
import urllib.parse
from typing import Any
from urllib import error, request


class AgentCallError(RuntimeError):
    pass


def strip_json_artifacts(text: str) -> str:
    cleaned = text.strip().lstrip("﻿").strip()
    cleaned = re.sub(r"^\s*```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    cleaned = re.sub(r"^\s*json\s*[:\n\r]+", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def parse_json_output(raw_text: str) -> Any:
    cleaned = strip_json_artifacts(raw_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start_candidates = [idx for idx in (cleaned.find("{"), cleaned.find("[")) if idx != -1]
        end_candidates = [idx for idx in (cleaned.rfind("}"), cleaned.rfind("]")) if idx != -1]

        if start_candidates and end_candidates:
            start = min(start_candidates)
            end = max(end_candidates)
            if end > start:
                candidate = cleaned[start : end + 1].strip()
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError as exc:
                    raise AgentCallError(f"Failed to parse JSON payload: {exc}") from exc

        raise AgentCallError("Failed to locate JSON object in agent response.")


def _extract_sse_result(response_stream) -> Any:
    """Read SSE stream and return the value from the 'done' event's result field."""
    full_text_parts: list[str] = []
    done_result: Any = None
    done_errors: dict[str, str] = {}
    agent_errors: list[str] = []
    found_done = False

    for raw_line in response_stream:
        if not raw_line:
            continue

        line = raw_line.decode("utf-8", errors="replace").strip()
        if not line.startswith("data:"):
            continue

        data_text = line[len("data:"):].strip()
        if not data_text:
            continue

        try:
            event = json.loads(data_text)
        except json.JSONDecodeError:
            continue

        event_type = event.get("type")
        if event_type == "token":
            full_text_parts.append(str(event.get("text", "")))
        elif event_type == "done":
            done_result = event.get("result")
            maybe_errs = event.get("errors")
            if isinstance(maybe_errs, dict):
                done_errors = {str(k): str(v) for k, v in maybe_errs.items()}
            found_done = True
        elif event_type == "agent_error":
            agent = str(event.get("agent", "?"))
            detail = str(event.get("detail", "Unknown agent error"))
            agent_errors.append(f"{agent}: {detail}")
        elif event_type == "error":
            detail = str(event.get("detail", "Unknown upstream error"))
            raise AgentCallError(detail)

    if found_done:
        # пустой dict + были agent_error → возвращаем ошибку, не молчаливый {}
        if isinstance(done_result, dict) and not done_result and (agent_errors or done_errors):
            err_lines = agent_errors + [f"{k}: {v}" for k, v in done_errors.items()]
            raise AgentCallError("All sub-agents failed: " + " | ".join(err_lines))
        if isinstance(done_result, dict):
            return done_result
        return done_result  # None или примитив — вернём как есть

    return "".join(full_text_parts).strip()


def call_agent_json(url: str, payload: dict[str, Any], timeout_seconds: float) -> Any:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = request.Request(
        url=url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=timeout_seconds) as response:
            raw_result = _extract_sse_result(response)
    except error.HTTPError as exc:
        raise AgentCallError(f"Request to {url} failed: HTTP {exc.code}") from exc
    except error.URLError as exc:
        raise AgentCallError(f"Request to {url} failed: {exc.reason}") from exc

    if raw_result is None or raw_result == "":
        raise AgentCallError(f"Upstream service {url} returned an empty result.")

    if isinstance(raw_result, dict):
        return raw_result

    return parse_json_output(str(raw_result))


def call_agent_form(
    url: str,
    *,
    msg: str,
    context_text: str = "",
    timeout_seconds: float,
) -> Any:
    """Call an agent that accepts form data (e.g. filter-content-agent)."""
    body = urllib.parse.urlencode(
        {"msg": msg, "context_text": context_text}
    ).encode("utf-8")

    req = request.Request(
        url=url,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=timeout_seconds) as response:
            raw_result = _extract_sse_result(response)
    except error.HTTPError as exc:
        raise AgentCallError(f"Request to {url} failed: HTTP {exc.code}") from exc
    except error.URLError as exc:
        raise AgentCallError(f"Request to {url} failed: {exc.reason}") from exc

    if raw_result is None or raw_result == "":
        raise AgentCallError(f"Upstream service {url} returned an empty result.")

    if isinstance(raw_result, dict):
        return raw_result

    return parse_json_output(str(raw_result))

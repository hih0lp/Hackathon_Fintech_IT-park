from __future__ import annotations

import json
import re
from typing import Any

from urllib import error, request


class AgentCallError(RuntimeError):
    pass


def strip_json_artifacts(text: str) -> str:
    cleaned = text.strip().lstrip("\ufeff").strip()

    cleaned = re.sub(r"^\s*```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()

    cleaned = re.sub(r"^\s*json\s*[:\n\r]+", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()

    return cleaned


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


def _extract_sse_result(response_stream) -> str:
    full_text_parts: list[str] = []
    done_result: str | None = None

    for raw_line in response_stream:
        if not raw_line:
            continue

        line = raw_line.decode("utf-8", errors="replace").strip()
        if not line.startswith("data:"):
            continue

        data_text = line[len("data:") :].strip()
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
            done_result = str(event.get("result", ""))
        elif event_type == "error":
            detail = str(event.get("detail", "Unknown upstream error"))
            raise AgentCallError(detail)

    if done_result is not None:
        return done_result

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

    if not raw_result:
        raise AgentCallError(f"Upstream service {url} returned an empty result.")

    return parse_json_output(raw_result)

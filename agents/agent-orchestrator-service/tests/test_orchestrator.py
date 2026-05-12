from __future__ import annotations

import json
from dataclasses import replace

from fastapi.testclient import TestClient

import app.main as main_module
from app.agent_client import parse_json_output, strip_json_artifacts
from app.config import get_settings


def _extract_sse_events(response_text: str) -> list[dict]:
    events: list[dict] = []
    for line in response_text.splitlines():
        if line.startswith("data:"):
            events.append(json.loads(line[len("data:") :].strip()))
    return events


def test_strip_json_artifacts() -> None:
    text = "```json\n{\"action\":\"patch\"}\n```"
    assert strip_json_artifacts(text) == '{"action":"patch"}'


def test_parse_json_output_with_json_prefix() -> None:
    parsed = parse_json_output("json\n{\"action\": \"clarify\", \"questions\": [\"Q\"]}")
    assert parsed["action"] == "clarify"
    assert parsed["questions"] == ["Q"]


def test_orchestrate_returns_questions_for_clarify(monkeypatch) -> None:
    settings = replace(
        get_settings(),
        ambiguity_agent_url="http://ambig",
        agent_urls={"a": "http://a", "b": "http://b"},
        max_parallel_workers=2,
    )
    monkeypatch.setattr(main_module, "settings", settings)

    calls: list[str] = []

    def fake_call_agent_json(url, _payload, _timeout):
        calls.append(url)
        if url == "http://ambig":
            return {"action": "clarify", "questions": ["Q1", "Q2"]}
        raise AssertionError("Downstream agents must not be called on clarify.")

    monkeypatch.setattr(main_module, "call_agent_json", fake_call_agent_json)

    with TestClient(main_module.app) as client:
        response = client.post("/v1/orchestrate", json={"msg": "x", "context": {"k": 1}})

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    events = _extract_sse_events(response.text)
    assert events == [{"type": "done", "result": {"questions": ["Q1", "Q2"]}}]
    assert calls == ["http://ambig"]


def test_orchestrate_parallel_merge_for_patch(monkeypatch) -> None:
    settings = replace(
        get_settings(),
        ambiguity_agent_url="http://ambig",
        agent_urls={
            "financial_crime": "http://financial",
            "data_protection": "http://data",
        },
        max_parallel_workers=4,
    )
    monkeypatch.setattr(main_module, "settings", settings)

    def fake_call_agent_json(url, _payload, _timeout):
        if url == "http://ambig":
            return {"action": "patch", "context_score": "sufficient"}
        if url == "http://financial":
            return {"spec": "finance"}
        if url == "http://data":
            return {"spec": "data"}
        raise AssertionError(f"Unexpected URL: {url}")

    monkeypatch.setattr(main_module, "call_agent_json", fake_call_agent_json)

    with TestClient(main_module.app) as client:
        response = client.post("/v1/orchestrate", json={"msg": "x", "context": {"k": 1}})

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    events = _extract_sse_events(response.text)
    agent_events = [event for event in events if event.get("type") == "agent"]
    done_event = events[-1]

    assert {event["agent"] for event in agent_events} == {"financial_crime", "data_protection"}
    assert done_event["type"] == "done"
    assert done_event["result"]["action"] == "patch"
    assert done_event["result"]["ambiguity"]["action"] == "patch"
    assert done_event["result"]["agents"]["financial_crime"]["spec"] == "finance"
    assert done_event["result"]["agents"]["data_protection"]["spec"] == "data"

from __future__ import annotations

import json
from dataclasses import replace

from fastapi.testclient import TestClient

from app.anthropic_client import build_user_payload
from app.config import _normalize_model_id, get_settings
from app.main import app
from app.schemas import AnalyzeRequest
from app.skill_loader import load_skill_prompt


def test_skill_prompt_loads_and_contains_references() -> None:
    settings = get_settings()
    prompt = load_skill_prompt(
        settings.skill_markdown_path,
        settings.regulations_markdown_path,
    )
    assert "Crypto Domain" in prompt or "crypto" in prompt.lower()
    assert "MiCA" in prompt or "FATF" in prompt


def test_build_payload_shape() -> None:
    request = AnalyzeRequest(
        msg="Check crypto custody risks",
        context={"country": "EU", "feature": "crypto wallet"},
    )
    payload_text = build_user_payload(request)
    payload = json.loads(payload_text)
    assert payload["msg"] == "Check crypto custody risks"
    assert payload["context"]["country"] == "EU"


def test_stream_endpoint_returns_sse(monkeypatch) -> None:
    async def fake_stream(_request, _settings, _system_prompt):
        yield "data: {\"type\":\"token\",\"text\":\"ok\"}\n\n"
        yield "data: {\"type\":\"done\",\"result\":\"ok\"}\n\n"

    monkeypatch.setattr("app.main.stream_anthropic_events", fake_stream)
    patched_settings = replace(get_settings(), anthropic_api_key="test-key")
    monkeypatch.setattr("app.main.settings", patched_settings)

    with TestClient(app) as client:
        response = client.post(
            "/v1/analyze/stream",
            json={"msg": "test", "context": {"country": "EU"}},
        )

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert "\"type\":\"token\"" in response.text
    assert "\"type\":\"done\"" in response.text


def test_model_alias_normalization() -> None:
    assert _normalize_model_id("claude-4-6-sonnet") == "claude-sonnet-4-6"
    assert _normalize_model_id("claude-opus-4-7") == "claude-opus-4-7"

from __future__ import annotations

from fastapi.testclient import TestClient

from app.anthropic_client import build_anthropic_payload
from app.config import get_settings
from app.main import app
from app.schemas import AnalyzeRequest
from app.skill_loader import load_skill_prompt


def test_skill_prompt_loads_and_contains_references() -> None:
    settings = get_settings()
    prompt = load_skill_prompt(
        settings.skill_markdown_path,
        settings.regulations_markdown_path,
    )
    assert "Financial Crime & Integrity" in prompt
    assert "Regulatory Reference" in prompt


def test_build_payload_uses_stream_and_skill_input_shape() -> None:
    settings = get_settings()
    request = AnalyzeRequest(
        msg="Check AML risks",
        context={"country": "US", "feature": "wallet top-up"},
    )
    payload = build_anthropic_payload(request, settings, "system prompt")
    assert payload["stream"] is True
    assert payload["messages"][0]["role"] == "user"
    assert '"msg": "Check AML risks"' in payload["messages"][0]["content"][0]["text"]
    assert '"country": "US"' in payload["messages"][0]["content"][0]["text"]


def test_stream_endpoint_returns_sse(monkeypatch) -> None:
    async def fake_stream(_payload, _settings):
        yield b"event: content_block_delta\n"
        yield b"data: {\"type\":\"content_block_delta\",\"delta\":{\"text\":\"ok\"}}\n\n"

    monkeypatch.setattr("app.main.stream_anthropic", fake_stream)
    monkeypatch.setattr("app.main.settings", get_settings())
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")

    with TestClient(app) as client:
        response = client.post(
            "/v1/analyze/stream",
            json={"msg": "test", "context": {"country": "EU"}},
        )

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert "event: content_block_delta" in response.text

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.anthropic_client import _strip_json_artifacts, _try_parse_json


def _extract_sse_events(text: str) -> list[dict]:
    events = []
    for line in text.splitlines():
        if line.startswith("data:"):
            events.append(json.loads(line[len("data:"):].strip()))
    return events


class TestStripJsonArtifacts:
    def test_removes_json_fences(self):
        assert _strip_json_artifacts('```json\n{"a":1}\n```') == '{"a":1}'

    def test_removes_plain_fences(self):
        assert _strip_json_artifacts("```\n[1,2]\n```") == "[1,2]"

    def test_removes_json_prefix(self):
        assert _strip_json_artifacts('json\n{"a":1}') == '{"a":1}'

    def test_strips_bom(self):
        assert _strip_json_artifacts('﻿{"a":1}') == '{"a":1}'

    def test_passthrough_clean_json(self):
        assert _strip_json_artifacts('{"a":1}') == '{"a":1}'


class TestTryParseJson:
    def test_parses_clean_json(self):
        assert _try_parse_json('{"spec":"x","tasks":[]}') == {"spec": "x", "tasks": []}

    def test_parses_fenced_json(self):
        result = _try_parse_json('```json\n{"spec":"x","tasks":[]}\n```')
        assert result == {"spec": "x", "tasks": []}

    def test_returns_string_on_failure(self):
        result = _try_parse_json("not json at all")
        assert isinstance(result, str)

    def test_extracts_json_from_surrounding_text(self):
        result = _try_parse_json('Here is the result: {"spec":"x","tasks":[]} end')
        assert result == {"spec": "x", "tasks": []}


class TestExecuteEndpoint:
    def test_health(self):
        with TestClient(app) as client:
            r = client.get("/health")
            assert r.status_code == 200
            assert r.json()["service"] == "custom-agents-service"

    def test_validation_rejects_empty_agents(self):
        with TestClient(app) as client:
            r = client.post("/v1/execute/stream", json={
                "msg": "test",
                "context": "",
                "custom_agents": [],
            })
            assert r.status_code == 422

    def test_validation_rejects_missing_skill(self):
        with TestClient(app) as client:
            r = client.post("/v1/execute/stream", json={
                "msg": "test",
                "context": "",
                "custom_agents": [{"name": "a", "skill": ""}],
            })
            assert r.status_code == 422

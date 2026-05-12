from __future__ import annotations

import json

from fastapi.testclient import TestClient

from app.main import app
from app.anthropic_client import _strip_json_artifacts


def _extract_sse_events(text: str) -> list[dict]:
    events = []
    for line in text.splitlines():
        if line.startswith("data:"):
            events.append(json.loads(line[len("data:"):].strip()))
    return events


class TestStripJsonArtifacts:
    def test_removes_json_fences(self):
        assert _strip_json_artifacts('```json\n{"spec":"","tasks":[]}\n```') == '{"spec":"","tasks":[]}'

    def test_removes_plain_fences(self):
        assert _strip_json_artifacts("```\n[1,2]\n```") == "[1,2]"

    def test_removes_json_prefix(self):
        assert _strip_json_artifacts('json:\n{"a":1}') == '{"a":1}'

    def test_strips_bom(self):
        assert _strip_json_artifacts('﻿{"a":1}') == '{"a":1}'

    def test_passthrough_clean_json(self):
        assert _strip_json_artifacts('{"a":1}') == '{"a":1}'


class TestAggregateEndpoint:
    def test_health(self):
        with TestClient(app) as client:
            r = client.get("/health")
            assert r.status_code == 200
            assert r.json()["service"] == "result-aggregator-agent"

    def test_validation_rejects_missing_agents(self):
        with TestClient(app) as client:
            r = client.post("/v1/aggregate/stream", json={})
            assert r.status_code == 422

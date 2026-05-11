# Agents Orchestrator Service

Single-entry streaming orchestrator for all agent microservices.

## Input Contract

`POST /v1/orchestrate`

```json
{
  "msg": "feature description",
  "context": {"region": "EU"}
}
```

## Streaming Flow

Endpoint returns SSE (`text/event-stream`) with lines like:

```text
data: {"type":"...", ...}

```

1. Calls `ambiguilty-resolver-0lvl-agent` first.
2. If `action == "clarify"`, sends only final event:

```json
{"type":"done","result":{"questions":["..."]}}
```

3. If `action == "patch"`, runs all other agents in parallel threads and streams:
- per-agent completion events:

```json
{"type":"agent","agent":"financial_crime","result":{...}}
```

- final merged result:

```json
{
  "type": "done",
  "result": {
    "action": "patch",
    "ambiguity": {...},
    "agents": {
      "financial_crime": {...},
      "data_protection": {...},
      "payments_vulnerability": {...},
      "consumer_protection": {...},
      "ai_governance": {...}
    }
  }
}
```

## JSON Artifact Cleanup

The orchestrator sanitizes upstream agent outputs before JSON parsing:
- removes leading/trailing triple-backtick fences
- removes leading `json` prefix
- extracts JSON object/array from noisy wrappers

## Run via Docker Compose

```bash
docker compose up --build
```

## Endpoints

- `http://localhost:8090/v1/orchestrate`
- `http://localhost:8090/health`

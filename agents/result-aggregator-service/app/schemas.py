from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AgentResult(BaseModel):
    spec: str = Field(default="")
    tasks: list[str] = Field(default_factory=list)


class AggregateRequest(BaseModel):
    agents: dict[str, Any] = Field(..., description="Map of agent name -> {spec, tasks}")

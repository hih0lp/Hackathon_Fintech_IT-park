from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class CustomAgentDef(BaseModel):
    name: str = Field(..., min_length=1, description="Unique agent identifier")
    skill: str = Field(..., min_length=1, description="System prompt / skill text for this agent")


class ExecuteRequest(BaseModel):
    msg: str = Field(..., min_length=1, description="User message")
    context: Any = Field(default="", description="Project context")
    custom_agents: list[CustomAgentDef] = Field(..., min_length=1, description="Custom agent definitions to run in parallel")

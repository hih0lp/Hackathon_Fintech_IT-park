from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    msg: str = Field(..., min_length=1, description="User question or request")
    context: Any = Field(..., description="Project context for analysis")

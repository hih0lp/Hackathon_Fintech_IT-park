from __future__ import annotations

from dataclasses import dataclass

ALLOWED_EXTENSIONS: frozenset[str] = frozenset({
    ".pdf",
    ".doc", ".docx",
    ".xls", ".xlsx",
})


@dataclass
class ParsedFile:
    filename: str
    text: str


@dataclass
class AgentRequest:
    """Normalized request that always flows into agents."""
    msg: str
    context: str

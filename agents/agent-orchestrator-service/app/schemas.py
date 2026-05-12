from __future__ import annotations

from dataclasses import dataclass, field

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
    msg: str
    context: str

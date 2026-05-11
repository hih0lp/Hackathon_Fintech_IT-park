from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    anthropic_api_key: str
    anthropic_model: str
    anthropic_base_url: str
    anthropic_max_tokens: int
    anthropic_temperature: float
    skill_markdown_path: Path
    regulations_markdown_path: Path


def _get_env_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None:
        return default
    return float(value)


def _get_env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    return int(value)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    skill_dir = Path(
        os.getenv(
            "SKILL_DIR",
            str(ROOT_DIR / "skill" / "financial-crime-integrity"),
        )
    )
    if not skill_dir.is_absolute():
        skill_dir = ROOT_DIR / skill_dir

    return Settings(
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
        anthropic_model=os.getenv(
            "CLAUDE_MODEL",
            os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
        ),
        anthropic_base_url=os.getenv(
            "ANTHROPIC_BASE_URL",
            "https://api.anthropic.com",
        ),
        anthropic_max_tokens=_get_env_int(
            "MAX_TOKENS",
            _get_env_int("ANTHROPIC_MAX_TOKENS", 8192),
        ),
        anthropic_temperature=_get_env_float("ANTHROPIC_TEMPERATURE", 0.1),
        skill_markdown_path=skill_dir / "SKILL.md",
        regulations_markdown_path=skill_dir / "references" / "regulations.md",
    )

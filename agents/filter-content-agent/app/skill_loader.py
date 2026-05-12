from __future__ import annotations

from pathlib import Path


def _read_text(path: Path) -> str:
    encodings = ("utf-8", "utf-8-sig", "cp1251")
    for encoding in encodings:
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="replace")


def load_skill_prompt(skill_markdown_path: Path) -> str:
    if not skill_markdown_path.exists():
        raise FileNotFoundError(f"Skill file not found: {skill_markdown_path}")
    return _read_text(skill_markdown_path).strip()

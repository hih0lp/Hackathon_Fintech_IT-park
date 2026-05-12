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


def load_skill_prompt(skill_markdown_path: Path, regulations_markdown_path: Path) -> str:
    if not skill_markdown_path.exists():
        raise FileNotFoundError(f"Skill file not found: {skill_markdown_path}")
    if not regulations_markdown_path.exists():
        raise FileNotFoundError(f"Regulations file not found: {regulations_markdown_path}")

    skill_text = _read_text(skill_markdown_path).strip()
    regulations_text = _read_text(regulations_markdown_path).strip()

    return (
        f"{skill_text}\n\n"
        "## Embedded Regulatory Reference\n"
        "Use the following regulation material when selecting applicable frameworks:\n\n"
        f"{regulations_text}\n"
    )

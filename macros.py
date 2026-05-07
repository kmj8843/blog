"""Zensical macros: auto-generate post listings from docs/ frontmatter + git history.

Wired in via zensical.toml [project.markdown_extensions.zensical.extensions.macros].
Consumed by docs/index.md ({{ latest_posts(n) }}).
"""

from __future__ import annotations

from datetime import date, datetime
from pathlib import Path
from typing import Any

import yaml

PROJECT_ROOT = Path(__file__).resolve().parent
DOCS_DIR = PROJECT_ROOT / "docs"


def _parse_frontmatter(md_path: Path) -> dict[str, Any] | None:
    try:
        text = md_path.read_text(encoding="utf-8")
    except OSError:
        return None
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---", 4)
    if end == -1:
        return None
    try:
        data = yaml.safe_load(text[4:end])
    except yaml.YAMLError:
        return None
    return data if isinstance(data, dict) else None


def _resolve_created(fm: dict[str, Any]) -> datetime:
    created = fm.get("created")
    if isinstance(created, datetime):
        return created
    if isinstance(created, date):
        return datetime.combine(created, datetime.min.time())
    if isinstance(created, str):
        try:
            return datetime.fromisoformat(created)
        except ValueError:
            pass
    return datetime.min


def _collect_posts() -> list[dict[str, Any]]:
    posts: list[dict[str, Any]] = []
    for md_path in DOCS_DIR.glob("*/**/*.md"):
        if not md_path.is_file():
            continue
        fm = _parse_frontmatter(md_path)
        if not fm or "title" not in fm:
            continue
        rel = md_path.relative_to(DOCS_DIR)
        url = rel.as_posix()
        category = rel.parts[0]
        posts.append(
            {
                "title": fm["title"],
                "description": fm.get("description", ""),
                "icon": fm.get("icon", "lucide/file-text"),
                "tags": fm.get("tags", []) or [],
                "url": url,
                "category": category,
                "created": _resolve_created(fm),
                "filename": md_path.name,
            }
        )
    posts.sort(key=lambda p: (p["created"], p["filename"]), reverse=True)
    return posts


def define_env(env: Any) -> None:
    @env.macro
    def latest_posts(n: int = 2) -> list[dict[str, Any]]:
        return _collect_posts()[:n]

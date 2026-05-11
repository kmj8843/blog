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


def _post_sort_key(post: dict[str, Any]) -> tuple[datetime, str]:
    return post["created"], post["filename"]


def _doc_path_to_site_href(path: str) -> str:
    if path.endswith(("index.md", "README.md")):
        name = path.rsplit("/", 1)[-1]
        return f"/{path.removesuffix(name)}"

    if path.endswith(".md"):
        return f"/{path.removesuffix('.md')}/"

    return f"/{path}"


def _collect_posts(base_dir: Path = DOCS_DIR) -> list[dict[str, Any]]:
    posts: list[dict[str, Any]] = []
    for md_path in base_dir.glob("*/**/*.md"):
        if not md_path.is_file():
            continue
        fm = _parse_frontmatter(md_path)
        if not fm or "title" not in fm:
            continue
        rel = md_path.relative_to(base_dir)
        url = f"/{rel.as_posix()}"
        href = _doc_path_to_site_href(rel.as_posix())
        category = rel.parts[0]
        posts.append(
            {
                "title": fm["title"],
                "description": fm.get("description", ""),
                "icon": fm.get("icon", "lucide/file-text"),
                "tags": fm.get("tags", []) or [],
                "url": url,
                "href": href,
                "category": category,
                "created": _resolve_created(fm),
                "filename": md_path.name,
            }
        )
    posts.sort(key=_post_sort_key, reverse=True)
    return posts


def _category_posts(posts: list[dict[str, Any]], category: str) -> list[dict[str, Any]]:
    return [
        post
        for post in posts
        if post["category"] == category and post["filename"] != "index.md"
    ]


def _first_post_in_category(posts: list[dict[str, Any]], category: str) -> dict[str, Any]:
    category_posts = _category_posts(posts, category)
    if not category_posts:
        raise ValueError(f"No eligible posts found in category: {category}")
    return min(category_posts, key=_post_sort_key)


def _latest_post_in_category(posts: list[dict[str, Any]], category: str) -> dict[str, Any]:
    category_posts = _category_posts(posts, category)
    if not category_posts:
        raise ValueError(f"No eligible posts found in category: {category}")
    return max(category_posts, key=_post_sort_key)


def _render_tags(tags: list[Any]) -> str:
    return " · ".join(f"`{tag}`" for tag in tags)


def _render_markdown_html(markdown_text: str) -> str:
    from zensical.markdown.render import render as render_markdown

    return render_markdown(
        markdown_text,
        path="__latest_posts_cards__.md",
        url="",
    )["content"]


def _render_latest_post_card(post: dict[str, Any]) -> str:
    tags = _render_tags(post.get("tags", []))
    sections = [
        _render_markdown_html(
            f":{post['icon'].replace('/', '-')}:{{ .lg .middle }} **{post['title']}**"
        ),
        "<hr />",
        _render_markdown_html(post["description"]),
    ]

    if tags:
        sections.append(_render_markdown_html(tags))

    sections.append(
        f'<p><a href="{post["href"]}">읽으러 가기</a></p>'
    )

    body = "\n".join(sections)
    return f"<li>\n{body}\n</li>"


def _render_latest_posts_cards(posts: list[dict[str, Any]]) -> str:
    cards = "\n".join(_render_latest_post_card(post) for post in posts)
    return f'\n<div class="grid cards">\n<ul>\n{cards}\n</ul>\n</div>\n'


def define_env(env: Any) -> None:
    @env.macro
    def latest_posts(n: int = 2, category: str | None = None) -> list[dict[str, Any]]:
        posts = _collect_posts()
        if category is not None:
            posts = _category_posts(posts, category)
            posts.sort(key=_post_sort_key, reverse=True)
        return posts[:n]

    @env.macro
    def latest_posts_cards(n: int = 2, category: str | None = None) -> str:
        posts = latest_posts(n=n, category=category)
        return _render_latest_posts_cards(posts)

    @env.macro
    def first_post(category: str) -> dict[str, Any]:
        return _first_post_in_category(_collect_posts(), category)

    @env.macro
    def latest_post(category: str) -> dict[str, Any]:
        return _latest_post_in_category(_collect_posts(), category)

import type {
  CommentDatabase,
  CommentStatus,
  PublicComment,
  RateLimitRecord,
  StoredComment,
} from "./types"

type CommentRow = {
  readonly id: string
  readonly parent_id: string | null
  readonly page_path: string
  readonly page_url: string
  readonly page_title: string
  readonly author_name: string
  readonly author_email_hash: string | null
  readonly body: string
  readonly status: CommentStatus
  readonly ip_hash: string | null
  readonly user_agent_hash: string | null
  readonly created_at: string
  readonly updated_at: string
  readonly approved_at: string | null
  readonly rejected_at: string | null
  readonly deleted_at: string | null
}

type RateLimitRow = {
  readonly key: string
  readonly window_start: string
  readonly count: number
}

export function createCommentDatabase(db: CommentDatabase | D1Database): CommentDatabase {
  if (isCommentDatabase(db)) {
    return db
  }
  return new D1CommentDatabase(db)
}

function isCommentDatabase(db: CommentDatabase | D1Database): db is CommentDatabase {
  return "listApprovedComments" in db
}

class D1CommentDatabase implements CommentDatabase {
  constructor(private readonly db: D1Database) {}

  async listApprovedComments(pagePath: string, limit: number): Promise<readonly PublicComment[]> {
    const result = await this.db
      .prepare(
        "SELECT id, parent_id, author_name, body, status, created_at FROM comments WHERE page_path = ? AND status IN ('approved', 'deleted') ORDER BY created_at ASC LIMIT ?",
      )
      .bind(pagePath, limit)
      .all<
        Pick<CommentRow, "id" | "parent_id" | "author_name" | "body" | "status" | "created_at">
      >()
    return result.results.map(rowToPublicComment)
  }

  async listAdminComments(status: CommentStatus, limit: number): Promise<readonly StoredComment[]> {
    const result = await this.db
      .prepare("SELECT * FROM comments WHERE status = ? ORDER BY created_at ASC LIMIT ?")
      .bind(status, limit)
      .all<CommentRow>()
    return result.results.map(rowToStoredComment)
  }

  async findComment(id: string): Promise<StoredComment | null> {
    const row = await this.db
      .prepare("SELECT * FROM comments WHERE id = ?")
      .bind(id)
      .first<CommentRow>()
    return row === null ? null : rowToStoredComment(row)
  }

  async insertComment(comment: StoredComment): Promise<void> {
    await this.db
      .prepare(
        "INSERT INTO comments (id, parent_id, page_path, page_url, page_title, author_name, author_email_hash, body, status, ip_hash, user_agent_hash, created_at, updated_at, approved_at, rejected_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        comment.id,
        comment.parentId,
        comment.pagePath,
        comment.pageUrl,
        comment.pageTitle,
        comment.authorName,
        comment.authorEmailHash,
        comment.body,
        comment.status,
        comment.ipHash,
        comment.userAgentHash,
        comment.createdAt,
        comment.updatedAt,
        comment.approvedAt,
        comment.rejectedAt ?? null,
        comment.deletedAt ?? null,
      )
      .run()
  }

  async updateCommentStatus(
    id: string,
    status: CommentStatus,
    timestamp: string,
  ): Promise<boolean> {
    const column = statusTimestampColumn(status)
    const result = await this.db
      .prepare(`UPDATE comments SET status = ?, updated_at = ?, ${column} = ? WHERE id = ?`)
      .bind(status, timestamp, timestamp, id)
      .run()
    return result.meta.changes > 0
  }

  async getRateLimit(key: string): Promise<RateLimitRecord | null> {
    const row = await this.db
      .prepare("SELECT key, window_start, count FROM comment_rate_limits WHERE key = ?")
      .bind(key)
      .first<RateLimitRow>()
    if (row === null) {
      return null
    }
    return { key: row.key, windowStart: row.window_start, count: row.count }
  }

  async setRateLimit(record: RateLimitRecord): Promise<void> {
    await this.db
      .prepare(
        "INSERT OR REPLACE INTO comment_rate_limits (key, window_start, count, updated_at) VALUES (?, ?, ?, ?)",
      )
      .bind(record.key, record.windowStart, record.count, record.windowStart)
      .run()
  }

  async countComments(): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) AS count FROM comments")
      .first<{ count: number }>()
    return row?.count ?? 0
  }
}

function rowToPublicComment(
  row: Pick<CommentRow, "id" | "parent_id" | "author_name" | "body" | "status" | "created_at">,
): PublicComment {
  if (row.status === "deleted") {
    return {
      id: row.id,
      parentId: row.parent_id,
      authorName: "삭제된 댓글",
      body: "삭제된 댓글입니다.",
      status: "deleted",
      createdAt: row.created_at,
    }
  }
  return {
    id: row.id,
    parentId: row.parent_id,
    authorName: row.author_name,
    body: row.body,
    status: "approved",
    createdAt: row.created_at,
  }
}

function rowToStoredComment(row: CommentRow): StoredComment {
  return {
    id: row.id,
    parentId: row.parent_id,
    pagePath: row.page_path,
    pageUrl: row.page_url,
    pageTitle: row.page_title,
    authorName: row.author_name,
    authorEmailHash: row.author_email_hash,
    body: row.body,
    status: row.status,
    ipHash: row.ip_hash,
    userAgentHash: row.user_agent_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    deletedAt: row.deleted_at,
  }
}

function statusTimestampColumn(
  status: CommentStatus,
): "approved_at" | "rejected_at" | "deleted_at" {
  switch (status) {
    case "approved":
      return "approved_at"
    case "rejected":
      return "rejected_at"
    case "deleted":
      return "deleted_at"
    case "pending":
      return "approved_at"
  }
}

import type {
  CommentDatabase,
  CommentStatus,
  PublicComment,
  RateLimitRecord,
  StoredComment,
} from "./types"

export function createMemoryCommentDatabase(): CommentDatabase {
  return new MemoryCommentDatabase()
}

class MemoryCommentDatabase implements CommentDatabase {
  private readonly comments = new Map<string, StoredComment>()
  private readonly rateLimits = new Map<string, RateLimitRecord>()

  async listApprovedComments(pagePath: string, limit: number): Promise<readonly PublicComment[]> {
    return Array.from(this.comments.values())
      .filter(
        (comment) =>
          comment.pagePath === pagePath &&
          (comment.status === "approved" || comment.status === "deleted"),
      )
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .slice(0, limit)
      .map(commentToPublicComment)
  }

  async listAdminComments(status: CommentStatus, limit: number): Promise<readonly StoredComment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.status === status)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .slice(0, limit)
  }

  async findComment(id: string): Promise<StoredComment | null> {
    return this.comments.get(id) ?? null
  }

  async insertComment(comment: StoredComment): Promise<void> {
    this.comments.set(comment.id, comment)
  }

  async updateCommentStatus(
    id: string,
    status: CommentStatus,
    timestamp: string,
  ): Promise<boolean> {
    const existing = this.comments.get(id)
    if (existing === undefined) {
      return false
    }
    const updated = applyStatus(existing, status, timestamp)
    this.comments.set(id, updated)
    return true
  }

  async getRateLimit(key: string): Promise<RateLimitRecord | null> {
    return this.rateLimits.get(key) ?? null
  }

  async setRateLimit(record: RateLimitRecord): Promise<void> {
    this.rateLimits.set(record.key, record)
  }

  async countComments(): Promise<number> {
    return this.comments.size
  }
}

function commentToPublicComment(comment: StoredComment): PublicComment {
  if (comment.status === "deleted") {
    return {
      id: comment.id,
      parentId: comment.parentId,
      authorName: "삭제된 댓글",
      body: "삭제된 댓글입니다.",
      status: "deleted",
      createdAt: comment.createdAt,
    }
  }
  return {
    id: comment.id,
    parentId: comment.parentId,
    authorName: comment.authorName,
    body: comment.body,
    status: "approved",
    createdAt: comment.createdAt,
  }
}

function applyStatus(
  comment: StoredComment,
  status: CommentStatus,
  timestamp: string,
): StoredComment {
  switch (status) {
    case "approved":
      return { ...comment, status, updatedAt: timestamp, approvedAt: timestamp }
    case "rejected":
      return { ...comment, status, updatedAt: timestamp, rejectedAt: timestamp }
    case "deleted":
      return { ...comment, status, updatedAt: timestamp, deletedAt: timestamp }
    case "pending":
      return { ...comment, status, updatedAt: timestamp }
  }
}

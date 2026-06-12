export const COMMENT_STATUSES = ["pending", "approved", "rejected", "deleted"] as const

export type CommentStatus = (typeof COMMENT_STATUSES)[number]

export type StoredComment = {
  readonly id: string
  readonly parentId: string | null
  readonly pagePath: string
  readonly pageUrl: string
  readonly pageTitle: string
  readonly authorName: string
  readonly authorEmailHash: string | null
  readonly body: string
  readonly status: CommentStatus
  readonly ipHash: string | null
  readonly userAgentHash: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly approvedAt: string | null
  readonly rejectedAt?: string | null
  readonly deletedAt?: string | null
}

export type PublicComment = {
  readonly id: string
  readonly parentId: string | null
  readonly authorName: string
  readonly body: string
  readonly status: "approved" | "deleted"
  readonly createdAt: string
}

export type RateLimitRecord = {
  readonly key: string
  readonly windowStart: string
  readonly count: number
}

export interface CommentDatabase {
  listApprovedComments(pagePath: string, limit: number): Promise<readonly PublicComment[]>
  listAllAdminComments(limit: number): Promise<readonly StoredComment[]>
  listAdminComments(status: CommentStatus, limit: number): Promise<readonly StoredComment[]>
  findComment(id: string): Promise<StoredComment | null>
  insertComment(comment: StoredComment): Promise<void>
  updateCommentStatus(id: string, status: CommentStatus, timestamp: string): Promise<boolean>
  getRateLimit(key: string): Promise<RateLimitRecord | null>
  setRateLimit(record: RateLimitRecord): Promise<void>
  countComments(): Promise<number>
}

export type AppBindings = {
  readonly DB: CommentDatabase | D1Database
  readonly ADMIN_TOKEN: string
  readonly TURNSTILE_SECRET_KEY: string
  readonly COMMENT_HASH_SALT: string
  readonly COMMENT_MODERATION_MODE?: "auto" | "manual"
  readonly COMMENTS_READ_ONLY?: string
  readonly DISCORD_BOT_TOKEN?: string
  readonly DISCORD_COMMENT_CHANNEL_ID?: string
  readonly DISCORD_PUBLIC_KEY?: string
  readonly DISCORD_ADMIN_USER_ID?: string
  readonly ENVIRONMENT?: string
}

export type TurnstileVerificationResult = {
  readonly success: boolean
}

export type TurnstileVerifier = (
  token: string,
  remoteIp: string | null,
  env: AppBindings,
) => Promise<TurnstileVerificationResult>

export type AppOptions = {
  readonly turnstileVerifier?: TurnstileVerifier
  readonly discordNotifier?: DiscordNotifier
  readonly createCommentId?: () => string
  readonly now?: () => string
}

export type DiscordNotificationInput = {
  readonly comment: StoredComment
  readonly adminHideUrl: string
  readonly adminDeleteUrl: string
}

export type DiscordNotifier = (
  input: DiscordNotificationInput,
  env: AppBindings,
) => Promise<boolean>

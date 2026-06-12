import { z } from "zod"
import { LimitSchema } from "./schemas"
import type { CommentDatabase, CommentStatus, StoredComment } from "./types"

const DISCORD_MESSAGE_LIMIT = 2000
const DEFAULT_COMMAND_LIMIT = 10
const MAX_COMMAND_LIMIT = 20

const CommandOptionSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
})

const CommentCommandDataSchema = z.object({
  name: z.string(),
  options: z.array(CommandOptionSchema).optional(),
})

type CommandOption = z.infer<typeof CommandOptionSchema>

type CommentCommandOptions = {
  readonly status: CommentStatus | null
  readonly limit: number
}

export async function handleCommentCommand(
  data: unknown,
  db: CommentDatabase,
  respond: (content: string) => Response,
): Promise<Response | null> {
  const parsed = CommentCommandDataSchema.safeParse(data)
  if (!parsed.success || parsed.data.name !== "comments") {
    return null
  }
  const options = parseCommentCommandOptions(parsed.data.options ?? [])
  const comments =
    options.status === null
      ? await db.listAllAdminComments(options.limit)
      : await db.listAdminComments(options.status, options.limit)
  return respond(formatComments(options, comments))
}

function parseCommentCommandOptions(options: readonly CommandOption[]): CommentCommandOptions {
  const status = parseStatusOption(options.find((option) => option.name === "status"))
  const limit = parseLimitOption(options.find((option) => option.name === "limit"))
  return { status, limit }
}

function parseStatusOption(option: CommandOption | undefined): CommentStatus | null {
  if (option?.value !== "pending" && option?.value !== "approved") {
    if (option?.value !== "rejected" && option?.value !== "deleted") {
      return null
    }
  }
  return option.value
}

function parseLimitOption(option: CommandOption | undefined): number {
  const parsed = LimitSchema.safeParse(option?.value ?? DEFAULT_COMMAND_LIMIT)
  if (!parsed.success) {
    return DEFAULT_COMMAND_LIMIT
  }
  return Math.min(parsed.data, MAX_COMMAND_LIMIT)
}

function formatComments(
  options: CommentCommandOptions,
  comments: readonly StoredComment[],
): string {
  const title =
    options.status === null
      ? `최근 댓글 ${comments.length}개`
      : `최근 ${statusLabel(options.status)} 댓글 ${comments.length}개`
  if (comments.length === 0) {
    return `${title}\n조회할 댓글이 없어요.`
  }
  const lines = comments.map(formatComment)
  return truncateForDiscord([title, ...lines].join("\n\n"))
}

function formatComment(comment: StoredComment): string {
  const body = truncateLine(comment.body.replace(/\s+/gu, " "), 180)
  const parent = comment.parentId === null ? "" : ` / parent: ${comment.parentId}`
  return [
    `id: ${comment.id}${parent}`,
    `상태: ${statusLabel(comment.status)} / 작성자: ${comment.authorName}`,
    `글: ${comment.pageTitle}`,
    `작성: ${comment.createdAt}`,
    `내용: ${body}`,
  ].join("\n")
}

function statusLabel(status: CommentStatus): string {
  switch (status) {
    case "pending":
      return "대기"
    case "approved":
      return "승인"
    case "rejected":
      return "삭제"
    case "deleted":
      return "숨김"
  }
}

function truncateLine(value: string, limit: number): string {
  if (value.length <= limit) {
    return value
  }
  return `${value.slice(0, limit - 3)}...`
}

function truncateForDiscord(value: string): string {
  if (value.length <= DISCORD_MESSAGE_LIMIT) {
    return value
  }
  return `${value.slice(0, DISCORD_MESSAGE_LIMIT - 30)}\n...더 줄여서 다시 조회해주세요.`
}

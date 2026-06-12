import { z } from "zod"
import { replyButtonCustomId } from "./discord"
import type { DiscordActionRow } from "./discord-responses"
import { LimitSchema } from "./schemas"
import type { AppBindings, CommentDatabase, CommentStatus, StoredComment } from "./types"

const DISCORD_MESSAGE_LIMIT = 2000
const DISCORD_COMPONENT_ROW_LIMIT = 5
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
  request: Request,
  env: AppBindings,
  respond: (content: string, components?: readonly DiscordActionRow[]) => Response,
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
  return respond(formatComments(options, comments), buildCommentActionRows(request, env, comments))
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
  const commentUrl = commentUrlFor(comment)
  const parent = comment.parentId === null ? "" : ` / parent: ${comment.parentId}`
  return [
    `id: ${comment.id}${parent}`,
    `상태: ${statusLabel(comment.status)} / 작성자: ${comment.authorName}`,
    `글: ${comment.pageTitle}`,
    `작성: ${comment.createdAt}`,
    `댓글: ${commentUrl}`,
    `내용: ${body}`,
  ].join("\n")
}

function buildCommentActionRows(
  request: Request,
  env: AppBindings,
  comments: readonly StoredComment[],
): readonly DiscordActionRow[] {
  return comments.slice(0, DISCORD_COMPONENT_ROW_LIMIT).map((comment) => ({
    type: 1,
    components: [
      {
        type: 2,
        style: 5,
        label: "댓글 보기",
        url: commentUrlFor(comment),
      },
      {
        type: 2,
        style: 5,
        label: "댓글 숨기기",
        url: adminActionUrl(request, comment.id, "hide", env.ADMIN_TOKEN),
      },
      {
        type: 2,
        style: 5,
        label: "댓글 삭제",
        url: adminActionUrl(request, comment.id, "delete", env.ADMIN_TOKEN),
      },
      {
        type: 2,
        style: 1,
        label: "대댓글",
        custom_id: replyButtonCustomId(comment.id),
      },
    ],
  }))
}

function commentUrlFor(comment: StoredComment): string {
  return `${comment.pageUrl}#comment-${encodeURIComponent(comment.id)}`
}

function adminActionUrl(
  request: Request,
  commentId: string,
  action: "hide" | "delete",
  token: string,
): string {
  const url = new URL(request.url)
  url.pathname = `/api/admin/comments/${encodeURIComponent(commentId)}/${action}`
  url.search = ""
  url.searchParams.set("token", token)
  return url.toString()
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

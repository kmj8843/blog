import { z } from "zod"
import { replyButtonCustomId } from "./discord"
import type { DiscordActionRow, DiscordMessageComponent } from "./discord-responses"
import { LimitSchema } from "./schemas"
import type { AppBindings, CommentDatabase, CommentStatus, StoredComment } from "./types"

const DISCORD_INTERACTIVE_COMMENT_LIMIT = 5
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
  readonly id: string | null
}

export async function handleCommentCommand(
  data: unknown,
  db: CommentDatabase,
  request: Request,
  env: AppBindings,
  respond: (content: string, components?: readonly DiscordActionRow[]) => Response,
  respondComponents: (components: readonly DiscordMessageComponent[]) => Response,
): Promise<Response | null> {
  const parsed = CommentCommandDataSchema.safeParse(data)
  if (!parsed.success || parsed.data.name !== "comments") {
    return null
  }
  const options = parseCommentCommandOptions(parsed.data.options ?? [])
  if (options.id !== null) {
    const comment = await db.findComment(options.id)
    if (comment === null) {
      return respond(`댓글 ${options.id}을 찾지 못했어요.`, [])
    }
    return respondComponents(buildCommentComponents("댓글 상세", [comment], request, env))
  }
  const comments =
    options.status === null
      ? await db.listAllAdminComments(options.limit)
      : await db.listAdminComments(options.status, options.limit)
  return respondComponents(
    buildCommentComponents(commentListTitle(options, comments), comments, request, env),
  )
}

function parseCommentCommandOptions(options: readonly CommandOption[]): CommentCommandOptions {
  const status = parseStatusOption(options.find((option) => option.name === "status"))
  const limit = parseLimitOption(options.find((option) => option.name === "limit"))
  const id = parseIdOption(options.find((option) => option.name === "id"))
  return { status, limit, id }
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

function parseIdOption(option: CommandOption | undefined): string | null {
  return typeof option?.value === "string" && option.value.trim().length > 0
    ? option.value.trim()
    : null
}

function commentListTitle(
  options: CommentCommandOptions,
  comments: readonly StoredComment[],
): string {
  return options.status === null
    ? `최근 댓글 ${comments.length}개`
    : `최근 ${statusLabel(options.status)} 댓글 ${comments.length}개`
}

function buildCommentComponents(
  title: string,
  comments: readonly StoredComment[],
  request: Request,
  env: AppBindings,
): readonly DiscordMessageComponent[] {
  if (comments.length === 0) {
    return [{ type: 10, content: `${title}\n조회할 댓글이 없어요.` }]
  }
  const visibleComments = comments.slice(0, DISCORD_INTERACTIVE_COMMENT_LIMIT)
  const components: DiscordMessageComponent[] = [{ type: 10, content: title }]
  for (const comment of visibleComments) {
    components.push({ type: 10, content: formatComment(comment) })
    components.push(buildCommentActionRow(request, env, comment))
  }
  const overflow =
    comments.length > visibleComments.length
      ? [
          {
            type: 10,
            content: `${comments.length - visibleComments.length}개 댓글은 Discord 버튼 배치 제한 때문에 생략했어요. 더 보려면 limit을 줄이거나 id로 조회해주세요.`,
          } satisfies DiscordMessageComponent,
        ]
      : []
  components.push(...overflow)
  return components
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

function buildCommentActionRow(
  request: Request,
  env: AppBindings,
  comment: StoredComment,
): DiscordActionRow {
  return {
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
  }
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

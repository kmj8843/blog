import ky, { HTTPError } from "ky"
import type { AppBindings, DiscordNotificationInput } from "./types"

type DiscordButton = DiscordLinkButton | DiscordInteractionButton

type DiscordLinkButton = {
  readonly type: 2
  readonly style: 5
  readonly label: string
  readonly url: string
}

type DiscordInteractionButton = {
  readonly type: 2
  readonly style: 1
  readonly label: string
  readonly custom_id: string
}

type DiscordActionRow = {
  readonly type: 1
  readonly components: readonly DiscordButton[]
}

type DiscordMessage = {
  readonly content: string
  readonly embeds: readonly DiscordEmbed[]
  readonly components: readonly DiscordActionRow[]
  readonly allowed_mentions: {
    readonly parse: readonly string[]
  }
}

type DiscordEmbed = {
  readonly title: string
  readonly url: string
  readonly description: string
  readonly color: number
  readonly author: {
    readonly name: string
  }
}

const DISCORD_API_BASE_URL = "https://discord.com/api/v10"
const DISCORD_EMBED_COLOR = 3447003

export async function notifyDiscordComment(
  input: DiscordNotificationInput,
  env: AppBindings,
): Promise<boolean> {
  if (env.DISCORD_BOT_TOKEN === undefined || env.DISCORD_COMMENT_CHANNEL_ID === undefined) {
    return false
  }
  const message = buildDiscordMessage(input)
  try {
    await ky
      .post(`${DISCORD_API_BASE_URL}/channels/${env.DISCORD_COMMENT_CHANNEL_ID}/messages`, {
        json: message,
        headers: {
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
        timeout: 3000,
        retry: 0,
      })
      .json<unknown>()
    return true
  } catch (error) {
    if (error instanceof HTTPError) {
      return false
    }
    throw error
  }
}

export function buildDiscordMessage(input: DiscordNotificationInput): DiscordMessage {
  const commentUrl = `${input.comment.pageUrl}#comment-${encodeURIComponent(input.comment.id)}`
  const content =
    input.comment.parentId === null
      ? "🔔 새로운 댓글이 등록되었습니다."
      : "🔔 새로운 대댓글이 등록되었습니다."
  return {
    content,
    embeds: [
      {
        title: input.comment.pageTitle,
        url: commentUrl,
        description: truncateForDiscord(input.comment.body),
        color: DISCORD_EMBED_COLOR,
        author: {
          name: input.comment.authorName,
        },
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "댓글 숨기기",
            url: input.adminHideUrl,
          },
          {
            type: 2,
            style: 5,
            label: "댓글 삭제",
            url: input.adminDeleteUrl,
          },
          {
            type: 2,
            style: 1,
            label: "대댓글",
            custom_id: replyButtonCustomId(input.comment.id),
          },
        ],
      },
    ],
    allowed_mentions: { parse: [] },
  }
}

export function replyButtonCustomId(commentId: string): string {
  return `comment_reply:${commentId}`
}

function truncateForDiscord(value: string): string {
  if (value.length <= 1500) {
    return value
  }
  return `${value.slice(0, 1497)}...`
}

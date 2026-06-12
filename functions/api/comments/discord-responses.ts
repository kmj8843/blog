const RESPONSE_TYPES = {
  channelMessage: 4,
} as const

const EPHEMERAL_FLAG = 64

export type DiscordLinkButton = {
  readonly type: 2
  readonly style: 5
  readonly label: string
  readonly url: string
}

export type DiscordInteractionButton = {
  readonly type: 2
  readonly style: 1
  readonly label: string
  readonly custom_id: string
}

export type DiscordButton = DiscordLinkButton | DiscordInteractionButton

export type DiscordActionRow = {
  readonly type: 1
  readonly components: readonly DiscordButton[]
}

export function ephemeral(content: string, components: readonly DiscordActionRow[] = []): Response {
  return json({
    type: RESPONSE_TYPES.channelMessage,
    data: {
      content,
      flags: EPHEMERAL_FLAG,
      components,
    },
  })
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

const RESPONSE_TYPES = {
  channelMessage: 4,
} as const

const EPHEMERAL_FLAG = 64

export function ephemeral(content: string): Response {
  return json({
    type: RESPONSE_TYPES.channelMessage,
    data: {
      content,
      flags: EPHEMERAL_FLAG,
    },
  })
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

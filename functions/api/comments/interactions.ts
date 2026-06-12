import { z } from "zod"
import { handleCommentCommand } from "./comment-command"
import { ephemeral, json } from "./discord-responses"
import { createAdminReply } from "./factory"
import { verifyDiscordSignature, verifyRequest } from "./interactions-crypto"
import { AdminReplySchema } from "./schemas"
import type { AppBindings, CommentDatabase } from "./types"

const INTERACTION_TYPES = {
  ping: 1,
  applicationCommand: 2,
  messageComponent: 3,
  modalSubmit: 5,
} as const

const RESPONSE_TYPES = {
  pong: 1,
  modal: 9,
} as const

const REPLY_BUTTON_PREFIX = "comment_reply:"
const REPLY_MODAL_PREFIX = "comment_reply_modal:"

const InteractionSchema = z.object({
  type: z.number().int(),
  data: z
    .object({
      custom_id: z.string().optional(),
      components: z.unknown().optional(),
      name: z.string().optional(),
      options: z.unknown().optional(),
    })
    .optional(),
  member: z
    .object({
      user: z
        .object({
          id: z.string(),
        })
        .optional(),
    })
    .optional(),
  user: z
    .object({
      id: z.string(),
    })
    .optional(),
})

const ModalComponentsSchema = z.array(
  z.object({
    components: z.array(
      z.object({
        custom_id: z.string(),
        value: z.string().optional(),
      }),
    ),
  }),
)

export async function handleDiscordInteraction(
  request: Request,
  env: AppBindings,
  db: CommentDatabase,
  createCommentId: () => string,
  now: () => string,
): Promise<Response> {
  const body = await request.text()
  const verified = await verifyRequest(request, env, body)
  if (!verified) {
    return new Response("invalid request signature", { status: 401 })
  }
  const jsonBody = parseJson(body)
  if (jsonBody === null) {
    return json({ error: "invalid_json" }, 400)
  }
  const parsed = InteractionSchema.safeParse(jsonBody)
  if (!parsed.success) {
    return json({ error: "invalid_interaction" }, 400)
  }
  const interaction = parsed.data
  if (interaction.type === INTERACTION_TYPES.ping) {
    return json({ type: RESPONSE_TYPES.pong })
  }
  if (!isAdminUser(interaction, env)) {
    return ephemeral("이 기능은 관리자만 사용할 수 있어요.")
  }
  if (interaction.type === INTERACTION_TYPES.applicationCommand) {
    const response = await handleCommentCommand(interaction.data, db, ephemeral)
    return response ?? ephemeral("지원하지 않는 Discord slash command예요.")
  }
  if (interaction.type === INTERACTION_TYPES.messageComponent) {
    return handleReplyButton(interaction.data?.custom_id)
  }
  if (interaction.type === INTERACTION_TYPES.modalSubmit) {
    return handleReplyModal(
      interaction.data?.custom_id,
      interaction.data?.components,
      db,
      createCommentId,
      now,
    )
  }
  return ephemeral("지원하지 않는 Discord interaction이에요.")
}

function parseJson(body: string): unknown | null {
  try {
    return JSON.parse(body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null
    }
    throw error
  }
}

export { verifyDiscordSignature }

function handleReplyButton(customId: string | undefined): Response {
  const commentId = parseCustomId(customId, REPLY_BUTTON_PREFIX)
  if (commentId === null) {
    return ephemeral("알 수 없는 버튼이에요.")
  }
  return json({
    type: RESPONSE_TYPES.modal,
    data: {
      custom_id: `${REPLY_MODAL_PREFIX}${commentId}`,
      title: "대댓글 작성",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "body",
              label: "대댓글",
              style: 2,
              min_length: 1,
              max_length: 2000,
              required: true,
            },
          ],
        },
      ],
    },
  })
}

async function handleReplyModal(
  customId: string | undefined,
  components: unknown,
  db: CommentDatabase,
  createCommentId: () => string,
  now: () => string,
): Promise<Response> {
  const commentId = parseCustomId(customId, REPLY_MODAL_PREFIX)
  if (commentId === null) {
    return ephemeral("알 수 없는 대댓글 입력창이에요.")
  }
  const parent = await db.findComment(commentId)
  if (parent === null) {
    return ephemeral("대상 댓글을 찾지 못했어요.")
  }
  const body = extractTextInputValue(components, "body")
  const replyResult = AdminReplySchema.safeParse({ body })
  if (!replyResult.success) {
    return ephemeral("대댓글 내용을 확인해주세요.")
  }
  const reply = createAdminReply(replyResult.data, parent, createCommentId(), now())
  await db.insertComment(reply)
  return ephemeral("대댓글을 등록했어요.")
}

function extractTextInputValue(components: unknown, customId: string): string {
  const parsed = ModalComponentsSchema.safeParse(components)
  if (!parsed.success) {
    return ""
  }
  for (const row of parsed.data) {
    const input = row.components.find((component) => component.custom_id === customId)
    if (input?.value !== undefined) {
      return input.value
    }
  }
  return ""
}

function isAdminUser(interaction: z.infer<typeof InteractionSchema>, env: AppBindings): boolean {
  if (env.DISCORD_ADMIN_USER_ID === undefined) {
    return false
  }
  const userId = interaction.member?.user?.id ?? interaction.user?.id
  return userId === env.DISCORD_ADMIN_USER_ID
}

function parseCustomId(customId: string | undefined, prefix: string): string | null {
  if (customId === undefined || !customId.startsWith(prefix)) {
    return null
  }
  const id = customId.slice(prefix.length)
  return id.length > 0 ? id : null
}

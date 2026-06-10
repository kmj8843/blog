import { Hono } from "hono"
import { parseAdminReplyBody, parseAdminReplyForm, replyFormHtml } from "./admin-replies"
import { hashPrivateValue } from "./crypto"
import { createCommentDatabase } from "./database"
import { notifyDiscordComment } from "./discord"
import { createAdminReply, createPublicComment } from "./factory"
import { handleDiscordInteraction } from "./interactions"
import { AdminStatusSchema, CreateCommentSchema, LimitSchema, PagePathSchema } from "./schemas"
import { verifyTurnstile } from "./turnstile"
import type { AppBindings, AppOptions, CommentDatabase, CommentStatus } from "./types"

type HonoEnv = {
  readonly Bindings: AppBindings
}

const DEFAULT_LIMIT = 50
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

export function createCommentsApp(options: AppOptions = {}): Hono<HonoEnv> {
  const app = new Hono<HonoEnv>().basePath("/api")
  const verifier = options.turnstileVerifier ?? verifyTurnstile
  const discordNotifier = options.discordNotifier ?? notifyDiscordComment
  const createCommentId = options.createCommentId ?? (() => crypto.randomUUID())
  const now = options.now ?? (() => new Date().toISOString())

  app.get("/comments", async (c) => {
    const pagePathResult = PagePathSchema.safeParse(c.req.query("page_path"))
    if (!pagePathResult.success) {
      return c.json({ error: "missing_page_path" }, 400)
    }
    const limitResult = LimitSchema.safeParse(c.req.query("limit") ?? DEFAULT_LIMIT)
    const limit = limitResult.success ? limitResult.data : DEFAULT_LIMIT
    const comments = await database(c.env).listApprovedComments(pagePathResult.data, limit)
    return c.json({ comments })
  })

  app.post("/comments", async (c) => {
    if (c.env.COMMENTS_READ_ONLY === "true") {
      return c.json({ error: "comments_read_only" }, 503)
    }
    const bodyResult = await parseCommentBody(c.req.raw)
    if (!bodyResult.ok) {
      return c.json({ error: bodyResult.error }, 400)
    }
    if (bodyResult.value.website !== undefined && bodyResult.value.website !== "") {
      return c.json({ error: "spam_rejected" }, 400)
    }
    const remoteIp = c.req.header("CF-Connecting-IP") ?? null
    const verification = await verifier(bodyResult.value.turnstileToken, remoteIp, c.env)
    if (!verification.success) {
      return c.json({ error: "turnstile_failed" }, 400)
    }
    const db = database(c.env)
    const rateLimit = await consumeRateLimit(db, remoteIp, c.env.COMMENT_HASH_SALT, now())
    if (!rateLimit.allowed) {
      return c.json({ error: "rate_limited" }, 429)
    }
    const status = initialCommentStatus(c.env)
    const comment = await createPublicComment(
      bodyResult.value,
      createCommentId(),
      now(),
      c.env,
      c.req.raw,
      status,
    )
    await db.insertComment(comment)
    await discordNotifier(
      {
        comment,
        adminHideUrl: adminActionUrl(c.req.raw, comment.id, "delete", c.env.ADMIN_TOKEN),
      },
      c.env,
    )
    return c.json({ status }, status === "approved" ? 201 : 202)
  })

  app.post("/discord/interactions", async (c) =>
    handleDiscordInteraction(c.req.raw, c.env, database(c.env), createCommentId, now),
  )

  app.get("/admin/comments", async (c) => {
    const auth = authorize(c.req.header("Authorization"), c.env.ADMIN_TOKEN)
    if (!auth) {
      return c.json({ error: "unauthorized" }, 401)
    }
    const statusResult = AdminStatusSchema.safeParse(c.req.query("status"))
    const status = statusResult.success ? statusResult.data : "pending"
    const limitResult = LimitSchema.safeParse(c.req.query("limit") ?? 100)
    const limit = limitResult.success ? limitResult.data : 100
    const comments = await database(c.env).listAdminComments(status, limit)
    return c.json({ comments })
  })

  app.get("/admin/comments/:id/reply", async (c) => {
    if (c.req.query("token") !== c.env.ADMIN_TOKEN) {
      return c.text("unauthorized", 401)
    }
    const parent = await database(c.env).findComment(c.req.param("id"))
    if (parent === null) {
      return c.text("not found", 404)
    }
    return c.html(replyFormHtml(parent.id, parent.pageTitle))
  })

  app.post("/admin/comments/:id/replies", async (c) => {
    if (!authorize(c.req.header("Authorization"), c.env.ADMIN_TOKEN)) {
      return c.json({ error: "unauthorized" }, 401)
    }
    const parent = await database(c.env).findComment(c.req.param("id"))
    if (parent === null) {
      return c.json({ error: "not_found" }, 404)
    }
    const replyResult = await parseAdminReplyBody(c.req.raw)
    if (!replyResult.ok) {
      return c.json({ error: replyResult.error }, 400)
    }
    const reply = createAdminReply(replyResult.value, parent, createCommentId(), now())
    await database(c.env).insertComment(reply)
    return c.json({ id: reply.id, status: reply.status }, 201)
  })

  app.post("/admin/comments/:id/reply", async (c) => {
    if (c.req.query("token") !== c.env.ADMIN_TOKEN) {
      return c.text("unauthorized", 401)
    }
    const parent = await database(c.env).findComment(c.req.param("id"))
    const replyResult = await parseAdminReplyForm(c.req.raw)
    if (parent === null) {
      return c.text("not found", 404)
    }
    if (!replyResult.ok) {
      return c.text("invalid reply", 400)
    }
    const reply = createAdminReply(replyResult.value, parent, createCommentId(), now())
    await database(c.env).insertComment(reply)
    return c.redirect(`${parent.pageUrl}#comment-${reply.id}`, 303)
  })

  app.post("/admin/comments/:id/:action", async (c) => {
    const auth = authorize(c.req.header("Authorization"), c.env.ADMIN_TOKEN)
    if (!auth) {
      return c.json({ error: "unauthorized" }, 401)
    }
    const status = actionToStatus(c.req.param("action"))
    if (status === null) {
      return c.json({ error: "unknown_action" }, 404)
    }
    const id = c.req.param("id")
    const changed = await database(c.env).updateCommentStatus(id, status, now())
    if (!changed) {
      return c.json({ error: "not_found" }, 404)
    }
    return c.json({ id, status })
  })

  app.get("/admin/comments/:id/:action", async (c) => {
    if (c.req.query("token") !== c.env.ADMIN_TOKEN) {
      return c.text("unauthorized", 401)
    }
    const status = actionToStatus(c.req.param("action"))
    if (status === null) {
      return c.text("unknown action", 404)
    }
    const id = c.req.param("id")
    const changed = await database(c.env).updateCommentStatus(id, status, now())
    if (!changed) {
      return c.text("not found", 404)
    }
    return c.text(`comment ${id} ${status}`)
  })

  return app
}

function database(env: AppBindings): CommentDatabase {
  return createCommentDatabase(env.DB)
}

type PublicParseResult =
  | { readonly ok: true; readonly value: ReturnType<typeof CreateCommentSchema.parse> }
  | { readonly ok: false; readonly error: string }

async function parseCommentBody(request: Request): Promise<PublicParseResult> {
  try {
    const json = await request.json()
    const parsed = CreateCommentSchema.safeParse(json)
    if (!parsed.success) {
      return { ok: false, error: "invalid_comment" }
    }
    return { ok: true, value: parsed.data }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, error: "invalid_json" }
    }
    throw error
  }
}

function adminActionUrl(
  request: Request,
  commentId: string,
  action: CommentStatusAction,
  token: string,
): string {
  const url = new URL(request.url)
  url.pathname = `/api/admin/comments/${encodeURIComponent(commentId)}/${action}`
  url.search = ""
  url.searchParams.set("token", token)
  return url.toString()
}

type CommentStatusAction = "approve" | "reject" | "delete"

function initialCommentStatus(env: AppBindings): "approved" | "pending" {
  return env.COMMENT_MODERATION_MODE === "manual" ? "pending" : "approved"
}

async function consumeRateLimit(
  db: CommentDatabase,
  remoteIp: string | null,
  salt: string,
  timestamp: string,
): Promise<{ readonly allowed: boolean }> {
  const windowStart = new Date(
    Math.floor(Date.parse(timestamp) / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS,
  ).toISOString()
  const key = await hashPrivateValue(`${remoteIp ?? "unknown"}:${windowStart}`, salt)
  const existing = await db.getRateLimit(key)
  const count = existing === null ? 1 : existing.count + 1
  if (count > RATE_LIMIT_MAX) {
    return { allowed: false }
  }
  await db.setRateLimit({ key, windowStart, count })
  return { allowed: true }
}

function authorize(header: string | undefined, token: string): boolean {
  return header === `Bearer ${token}`
}

function actionToStatus(action: string): CommentStatus | null {
  switch (action) {
    case "approve":
      return "approved"
    case "reject":
      return "rejected"
    case "delete":
      return "deleted"
    default:
      return null
  }
}

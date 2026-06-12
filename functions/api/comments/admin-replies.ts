import { REPLY_FORM_TEMPLATE } from "./reply-form-template"
import { AdminReplySchema } from "./schemas"
import type { AppBindings } from "./types"

export type AdminReplyParseResult =
  | { readonly ok: true; readonly value: ReturnType<typeof AdminReplySchema.parse> }
  | { readonly ok: false; readonly error: string }

export async function parseAdminReplyBody(request: Request): Promise<AdminReplyParseResult> {
  try {
    const json = await request.json()
    const parsed = AdminReplySchema.safeParse(json)
    return parsed.success ? { ok: true, value: parsed.data } : { ok: false, error: "invalid_reply" }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, error: "invalid_json" }
    }
    throw error
  }
}

export async function parseAdminReplyForm(request: Request): Promise<AdminReplyParseResult> {
  const parsed = AdminReplySchema.safeParse(Object.fromEntries(await request.formData()))
  return parsed.success ? { ok: true, value: parsed.data } : { ok: false, error: "invalid_reply" }
}

const REPLY_URL_TTL_MS = 10 * 60 * 1000

export async function createSignedAdminReplyUrl(
  request: Request,
  commentId: string,
  env: AppBindings,
  now: () => string,
): Promise<string> {
  const url = new URL(request.url)
  url.pathname = `/api/admin/comments/${encodeURIComponent(commentId)}/reply`
  url.search = ""
  const expires = String(Date.parse(now()) + REPLY_URL_TTL_MS)
  const nonce = crypto.randomUUID()
  url.searchParams.set("expires", expires)
  url.searchParams.set("nonce", nonce)
  url.searchParams.set("signature", await signReplyUrl(commentId, expires, nonce, env))
  return url.toString()
}

export async function verifyAdminReplyRequest(
  request: Request,
  commentId: string,
  env: AppBindings,
  now: () => string,
): Promise<boolean> {
  const url = new URL(request.url)
  const expires = url.searchParams.get("expires")
  const nonce = url.searchParams.get("nonce")
  const signature = url.searchParams.get("signature")
  if (expires === null || nonce === null || signature === null) {
    return false
  }
  if (!/^\d+$/u.test(expires) || Number(expires) < Date.parse(now())) {
    return false
  }
  const expected = await signReplyUrl(commentId, expires, nonce, env)
  return timingSafeEqual(signature, expected)
}

export function renderReplyFormHtml(commentId: string, pageTitle: string): string {
  return REPLY_FORM_TEMPLATE.replaceAll("{{PAGE_TITLE}}", escapeHtml(pageTitle)).replaceAll(
    "{{COMMENT_ID}}",
    escapeHtml(commentId),
  )
}

async function signReplyUrl(
  commentId: string,
  expires: string,
  nonce: string,
  env: AppBindings,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8ArrayBuffer(`${env.ADMIN_TOKEN}:${env.COMMENT_HASH_SALT}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    utf8ArrayBuffer(`${commentId}:${expires}:${nonce}`),
  )
  return bytesToHex(new Uint8Array(signature))
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false
  }
  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

function utf8ArrayBuffer(value: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(value)
  const buffer = new ArrayBuffer(encoded.byteLength)
  new Uint8Array(buffer).set(encoded)
  return buffer
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

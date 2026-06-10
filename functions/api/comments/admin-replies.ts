import { AdminReplySchema } from "./schemas"

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

export function adminReplyUrl(request: Request, commentId: string, token: string): string {
  const url = new URL(request.url)
  url.pathname = `/api/admin/comments/${encodeURIComponent(commentId)}/reply`
  url.search = ""
  url.searchParams.set("token", token)
  return url.toString()
}

export function replyFormHtml(commentId: string, pageTitle: string): string {
  return `<!doctype html><html lang="ko"><meta name="viewport" content="width=device-width,initial-scale=1"><title>대댓글</title><body><main><h1>대댓글</h1><p>${escapeHtml(pageTitle)}</p><form method="post"><input name="authorName" value="Zensical"><textarea name="body" maxlength="2000" required autofocus></textarea><button type="submit">대댓글 등록</button></form><p>대상 댓글: ${escapeHtml(commentId)}</p></main></body></html>`
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

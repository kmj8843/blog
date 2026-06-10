import { z } from "zod"
import { COMMENT_STATUSES } from "./types"

export const PagePathSchema = z.string().min(1).max(300).regex(/^\//)

export const LimitSchema = z.coerce.number().int().min(1).max(100).default(50)

export const AdminStatusSchema = z.enum(COMMENT_STATUSES).default("pending")

export const PageTitleSchema = z
  .string()
  .transform((value) => value.replace(/\s*¶+\s*$/u, "").trim())
  .pipe(z.string().min(1).max(200))

export const CreateCommentSchema = z.strictObject({
  pagePath: PagePathSchema,
  pageUrl: z.string().url().max(500),
  pageTitle: PageTitleSchema,
  authorName: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(2000),
  turnstileToken: z.string().min(1).max(2048),
  website: z.string().max(0).optional(),
})

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>

export const AdminReplySchema = z.object({
  authorName: z.string().trim().min(1).max(40).default("Zensical"),
  body: z.string().trim().min(1).max(2000),
})

export type AdminReplyInput = z.infer<typeof AdminReplySchema>

import { handle } from "hono/cloudflare-pages"
import { createCommentsApp } from "./comments/app"

export const onRequest = handle(createCommentsApp())

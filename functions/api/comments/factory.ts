import { hashPrivateValue } from "./crypto"
import type { AdminReplyInput, CreateCommentInput } from "./schemas"
import type { AppBindings, StoredComment } from "./types"

export async function createPublicComment(
  input: CreateCommentInput,
  id: string,
  timestamp: string,
  env: AppBindings,
  request: Request,
  status: "approved" | "pending",
): Promise<StoredComment> {
  const ip = request.headers.get("CF-Connecting-IP")
  const userAgent = request.headers.get("User-Agent")
  return {
    id,
    parentId: null,
    pagePath: input.pagePath,
    pageUrl: input.pageUrl,
    pageTitle: input.pageTitle,
    authorName: input.authorName,
    authorEmailHash: null,
    body: input.body,
    status,
    ipHash: ip === null ? null : await hashPrivateValue(ip, env.COMMENT_HASH_SALT),
    userAgentHash:
      userAgent === null ? null : await hashPrivateValue(userAgent, env.COMMENT_HASH_SALT),
    createdAt: timestamp,
    updatedAt: timestamp,
    approvedAt: status === "approved" ? timestamp : null,
  }
}

export function createAdminReply(
  input: AdminReplyInput,
  parent: StoredComment,
  id: string,
  timestamp: string,
): StoredComment {
  return {
    id,
    parentId: parent.id,
    pagePath: parent.pagePath,
    pageUrl: parent.pageUrl,
    pageTitle: parent.pageTitle,
    authorName: input.authorName,
    authorEmailHash: null,
    body: input.body,
    status: "approved",
    ipHash: null,
    userAgentHash: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    approvedAt: timestamp,
  }
}

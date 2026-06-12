import { createCommentsApp } from "./comments/app"
import { createMemoryCommentDatabase } from "./comments/memory-database"
import type { AppBindings, CommentDatabase, StoredComment } from "./comments/types"

type TestAppBindings = AppBindings & {
  readonly DB: CommentDatabase
}

type DiscordSigningKeys = {
  readonly publicKeyHex: string
  readonly privateKey: CryptoKey
}

function createEnv(overrides: Partial<TestAppBindings> = {}): TestAppBindings {
  return {
    DB: createMemoryCommentDatabase(),
    ADMIN_TOKEN: "test-admin-token",
    TURNSTILE_SECRET_KEY: "test-secret",
    COMMENT_HASH_SALT: "test-salt",
    COMMENTS_READ_ONLY: "false",
    ENVIRONMENT: "test",
    DISCORD_ADMIN_USER_ID: "admin-user-id",
    ...overrides,
  }
}

function storedComment(input: {
  readonly id: string
  readonly status: StoredComment["status"]
  readonly body: string
  readonly createdAt: string
}): StoredComment {
  return {
    id: input.id,
    parentId: null,
    pagePath: "/Network/basic/01-what-is-packet/",
    pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
    pageTitle: "패킷이 뭐길래?",
    authorName: "홍길동",
    authorEmailHash: null,
    body: input.body,
    status: input.status,
    ipHash: null,
    userAgentHash: null,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    approvedAt: input.status === "approved" ? input.createdAt : null,
    rejectedAt: input.status === "rejected" ? input.createdAt : null,
    deletedAt: input.status === "deleted" ? input.createdAt : null,
  }
}

async function createDiscordSigningKeys(): Promise<DiscordSigningKeys> {
  const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
  if (!isCryptoKeyPair(keyPair)) {
    throw new Error("expected a key pair")
  }
  const publicKey = await crypto.subtle.exportKey("raw", keyPair.publicKey)
  return {
    publicKeyHex: bytesToHex(new Uint8Array(publicKey)),
    privateKey: keyPair.privateKey,
  }
}

function isCryptoKeyPair(value: CryptoKeyPair | CryptoKey): value is CryptoKeyPair {
  return "privateKey" in value
}

async function signedDiscordRequest(
  body: unknown,
  keys: DiscordSigningKeys,
): Promise<{ readonly path: string; readonly init: RequestInit }> {
  const rawBody = JSON.stringify(body)
  const timestamp = "1790000000"
  const signature = await crypto.subtle.sign(
    { name: "Ed25519" },
    keys.privateKey,
    new TextEncoder().encode(`${timestamp}${rawBody}`),
  )
  return {
    path: "/api/discord/interactions",
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature-Ed25519": bytesToHex(new Uint8Array(signature)),
        "X-Signature-Timestamp": timestamp,
      },
      body: rawBody,
    },
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function readJson(response: Response): Promise<unknown> {
  return response.json()
}

describe("Discord comment slash commands", () => {
  it("lists recent comments across every status when the admin runs the comments command", async () => {
    const keys = await createDiscordSigningKeys()
    const env = createEnv({ DISCORD_PUBLIC_KEY: keys.publicKeyHex })
    await env.DB.insertComment(
      storedComment({
        id: "approved-1",
        status: "approved",
        body: "승인된 댓글입니다.",
        createdAt: "2026-06-10T00:00:01.000Z",
      }),
    )
    await env.DB.insertComment(
      storedComment({
        id: "pending-1",
        status: "pending",
        body: "검토 중인 댓글입니다.",
        createdAt: "2026-06-10T00:00:02.000Z",
      }),
    )
    const request = await signedDiscordRequest(
      {
        type: 2,
        member: { user: { id: "admin-user-id" } },
        data: {
          name: "comments",
          options: [{ name: "limit", value: 2 }],
        },
      },
      keys,
    )
    const app = createCommentsApp()

    const response = await app.request(request.path, request.init, env)

    expect(response.status).toBe(200)
    await expect(readJson(response)).resolves.toMatchObject({
      type: 4,
      data: {
        flags: 64,
        content: expect.stringContaining("pending-1"),
      },
    })
  })

  it("filters comments by status when the comments command includes a status option", async () => {
    const keys = await createDiscordSigningKeys()
    const env = createEnv({ DISCORD_PUBLIC_KEY: keys.publicKeyHex })
    await env.DB.insertComment(
      storedComment({
        id: "approved-1",
        status: "approved",
        body: "승인된 댓글입니다.",
        createdAt: "2026-06-10T00:00:01.000Z",
      }),
    )
    await env.DB.insertComment(
      storedComment({
        id: "pending-1",
        status: "pending",
        body: "검토 중인 댓글입니다.",
        createdAt: "2026-06-10T00:00:02.000Z",
      }),
    )
    const request = await signedDiscordRequest(
      {
        type: 2,
        member: { user: { id: "admin-user-id" } },
        data: {
          name: "comments",
          options: [{ name: "status", value: "approved" }],
        },
      },
      keys,
    )
    const app = createCommentsApp()

    const response = await app.request(request.path, request.init, env)
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      type: 4,
      data: {
        flags: 64,
        content: expect.stringContaining("approved-1"),
      },
    })
    expect(JSON.stringify(body)).not.toContain("pending-1")
  })
})

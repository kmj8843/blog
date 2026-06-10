import { createCommentsApp } from "./comments/app"
import { buildDiscordMessage } from "./comments/discord"
import { createMemoryCommentDatabase } from "./comments/memory-database"
import type { AppBindings, CommentDatabase } from "./comments/types"

const TEST_ADMIN_TOKEN = "test-admin-token"

type TestAppBindings = AppBindings & {
  readonly DB: CommentDatabase
}

class UnexpectedTurnstileCallError extends Error {
  override readonly name = "UnexpectedTurnstileCallError"

  constructor() {
    super("turnstile should not be called")
  }
}

function createEnv(overrides: Partial<TestAppBindings> = {}): TestAppBindings {
  return {
    DB: createMemoryCommentDatabase(),
    ADMIN_TOKEN: TEST_ADMIN_TOKEN,
    TURNSTILE_SECRET_KEY: "test-secret",
    COMMENT_HASH_SALT: "test-salt",
    COMMENTS_READ_ONLY: "false",
    ENVIRONMENT: "test",
    ...overrides,
  }
}

async function readJson(response: Response): Promise<unknown> {
  return response.json()
}

type DiscordSigningKeys = {
  readonly publicKeyHex: string
  readonly privateKey: CryptoKey
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
  path: string,
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
    path,
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

describe("comments API", () => {
  it("returns 400 when page_path is missing", async () => {
    const app = createCommentsApp()
    const response = await app.request("/api/comments", {}, createEnv())

    expect(response.status).toBe(400)
    await expect(readJson(response)).resolves.toMatchObject({
      error: "missing_page_path",
    })
  })

  it("returns only approved public comments without private fields", async () => {
    const env = createEnv()
    await env.DB.insertComment({
      id: "approved-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "홍길동",
      authorEmailHash: "private-email",
      body: "좋은 글이에요",
      status: "approved",
      ipHash: "private-ip",
      userAgentHash: "private-agent",
      createdAt: "2026-06-10T00:00:00.000Z",
      updatedAt: "2026-06-10T00:00:00.000Z",
      approvedAt: "2026-06-10T00:00:01.000Z",
    })
    await env.DB.insertComment({
      id: "pending-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "독자",
      authorEmailHash: null,
      body: "승인 전 댓글",
      status: "pending",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:02.000Z",
      updatedAt: "2026-06-10T00:00:02.000Z",
      approvedAt: null,
    })
    const app = createCommentsApp()

    const response = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )

    expect(response.status).toBe(200)
    await expect(readJson(response)).resolves.toStrictEqual({
      comments: [
        {
          id: "approved-1",
          parentId: null,
          authorName: "홍길동",
          body: "좋은 글이에요",
          status: "approved",
          createdAt: "2026-06-10T00:00:00.000Z",
        },
      ],
    })
  })

  it("rejects missing Turnstile token before insert", async () => {
    const env = createEnv()
    const app = createCommentsApp()

    const response = await app.request(
      "/api/comments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: "/Network/basic/01-what-is-packet/",
          pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
          pageTitle: "패킷이 뭐길래?",
          authorName: "홍길동",
          body: "댓글입니다",
        }),
      },
      env,
    )

    expect(response.status).toBe(400)
    expect(await env.DB.countComments()).toBe(0)
  })

  it("returns approved replies with their parent id", async () => {
    const env = createEnv()
    await env.DB.insertComment({
      id: "parent-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "홍길동",
      authorEmailHash: null,
      body: "부모 댓글",
      status: "approved",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:00.000Z",
      updatedAt: "2026-06-10T00:00:00.000Z",
      approvedAt: "2026-06-10T00:00:00.000Z",
    })
    await env.DB.insertComment({
      id: "reply-1",
      parentId: "parent-1",
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "주인장",
      authorEmailHash: null,
      body: "대댓글입니다",
      status: "approved",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:01.000Z",
      updatedAt: "2026-06-10T00:00:01.000Z",
      approvedAt: "2026-06-10T00:00:01.000Z",
    })
    const app = createCommentsApp()

    const response = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )

    expect(response.status).toBe(200)
    await expect(readJson(response)).resolves.toMatchObject({
      comments: [
        { id: "parent-1", parentId: null },
        { id: "reply-1", parentId: "parent-1" },
      ],
    })
  })

  it("auto-approves valid submissions by default", async () => {
    const env = createEnv()
    const app = createCommentsApp({
      turnstileVerifier: async () => ({ success: true }),
    })

    const response = await app.request(
      "/api/comments",
      {
        method: "POST",
        headers: {
          "CF-Connecting-IP": "203.0.113.10",
          "Content-Type": "application/json",
          "User-Agent": "Vitest",
        },
        body: JSON.stringify({
          pagePath: "/Network/basic/01-what-is-packet/",
          pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
          pageTitle: "패킷이 뭐길래?",
          authorName: "홍길동",
          body: "댓글입니다",
          turnstileToken: "valid-token",
        }),
      },
      env,
    )

    expect(response.status).toBe(201)
    await expect(readJson(response)).resolves.toStrictEqual({ status: "approved" })
    expect(await env.DB.countComments()).toBe(1)
    const publicResponse = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )
    await expect(readJson(publicResponse)).resolves.toMatchObject({
      comments: [{ authorName: "홍길동", body: "댓글입니다" }],
    })
  })

  it("removes trailing heading anchors from submitted page titles", async () => {
    const env = createEnv()
    const notifiedTitles: string[] = []
    const app = createCommentsApp({
      discordNotifier: async ({ comment }) => {
        notifiedTitles.push(comment.pageTitle)
        return true
      },
      turnstileVerifier: async () => ({ success: true }),
    })

    const response = await app.request(
      "/api/comments",
      {
        method: "POST",
        headers: {
          "CF-Connecting-IP": "203.0.113.10",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pagePath: "/Network/basic/01-what-is-packet/",
          pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
          pageTitle: "패킷이 뭐길래?¶",
          authorName: "홍길동",
          body: "댓글입니다",
          turnstileToken: "valid-token",
        }),
      },
      env,
    )

    expect(response.status).toBe(201)
    expect(notifiedTitles).toStrictEqual(["패킷이 뭐길래?"])
  })

  it("creates replies only through the admin reply API", async () => {
    const env = createEnv()
    await env.DB.insertComment({
      id: "parent-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "홍길동",
      authorEmailHash: null,
      body: "부모 댓글",
      status: "approved",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:00.000Z",
      updatedAt: "2026-06-10T00:00:00.000Z",
      approvedAt: "2026-06-10T00:00:00.000Z",
    })
    const app = createCommentsApp({
      createCommentId: () => "reply-1",
    })

    const response = await app.request(
      "/api/admin/comments/parent-1/replies",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TEST_ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: "주인장",
          body: "대댓글입니다",
        }),
      },
      env,
    )

    expect(response.status).toBe(201)
    const publicResponse = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )
    await expect(readJson(publicResponse)).resolves.toMatchObject({
      comments: [{ id: "parent-1" }, { id: "reply-1", parentId: "parent-1" }],
    })
  })

  it("rejects public reply attempts on the public comment API", async () => {
    const env = createEnv()
    const app = createCommentsApp({
      turnstileVerifier: async () => ({ success: true }),
    })

    const response = await app.request(
      "/api/comments",
      {
        method: "POST",
        headers: {
          "CF-Connecting-IP": "203.0.113.10",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: "parent-1",
          pagePath: "/Network/basic/01-what-is-packet/",
          pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
          pageTitle: "패킷이 뭐길래?",
          authorName: "주인장",
          body: "대댓글입니다",
          turnstileToken: "valid-token",
        }),
      },
      env,
    )

    expect(response.status).toBe(400)
    await expect(readJson(response)).resolves.toStrictEqual({ error: "invalid_comment" })
  })

  it("rejects admin replies without a valid bearer token", async () => {
    const app = createCommentsApp()

    const response = await app.request(
      "/api/admin/comments/parent-1/replies",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "대댓글입니다" }),
      },
      createEnv(),
    )

    expect(response.status).toBe(401)
  })

  it("opens and submits the tokenized admin reply form", async () => {
    const env = createEnv()
    await env.DB.insertComment({
      id: "parent-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "홍길동",
      authorEmailHash: null,
      body: "부모 댓글",
      status: "approved",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:00.000Z",
      updatedAt: "2026-06-10T00:00:00.000Z",
      approvedAt: "2026-06-10T00:00:00.000Z",
    })
    const app = createCommentsApp({
      createCommentId: () => "reply-1",
    })

    const formResponse = await app.request(
      `/api/admin/comments/parent-1/reply?token=${TEST_ADMIN_TOKEN}`,
      {},
      env,
    )
    const submitResponse = await app.request(
      `/api/admin/comments/parent-1/reply?token=${TEST_ADMIN_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          authorName: "Zensical",
          body: "관리자 대댓글입니다",
        }).toString(),
      },
      env,
    )

    expect(formResponse.status).toBe(200)
    expect(await formResponse.text()).toContain("대댓글 등록")
    expect(submitResponse.status).toBe(303)
    expect(submitResponse.headers.get("Location")).toBe(
      "https://blog.nvim.me/Network/basic/01-what-is-packet/#comment-reply-1",
    )
  })

  it("keeps manual moderation available through env configuration", async () => {
    const env = createEnv({ COMMENT_MODERATION_MODE: "manual" })
    const app = createCommentsApp({
      turnstileVerifier: async () => ({ success: true }),
    })

    const response = await app.request(
      "/api/comments",
      {
        method: "POST",
        headers: {
          "CF-Connecting-IP": "203.0.113.10",
          "Content-Type": "application/json",
          "User-Agent": "Vitest",
        },
        body: JSON.stringify({
          pagePath: "/Network/basic/01-what-is-packet/",
          pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
          pageTitle: "패킷이 뭐길래?",
          authorName: "홍길동",
          body: "댓글입니다",
          turnstileToken: "valid-token",
        }),
      },
      env,
    )

    expect(response.status).toBe(202)
    await expect(readJson(response)).resolves.toStrictEqual({ status: "pending" })
    const publicResponse = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )
    await expect(readJson(publicResponse)).resolves.toStrictEqual({ comments: [] })
  })

  it("returns 503 in read-only mode before insert", async () => {
    const env = createEnv({ COMMENTS_READ_ONLY: "true" })
    const app = createCommentsApp({
      turnstileVerifier: async () => {
        throw new UnexpectedTurnstileCallError()
      },
    })

    const response = await app.request(
      "/api/comments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: "/Network/basic/01-what-is-packet/",
          pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
          pageTitle: "패킷이 뭐길래?",
          authorName: "홍길동",
          body: "댓글입니다",
          turnstileToken: "valid-token",
        }),
      },
      env,
    )

    expect(response.status).toBe(503)
    expect(await env.DB.countComments()).toBe(0)
  })

  it("rejects too-long body", async () => {
    const app = createCommentsApp({
      turnstileVerifier: async () => ({ success: true }),
    })

    const response = await app.request(
      "/api/comments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: "/Network/basic/01-what-is-packet/",
          pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
          pageTitle: "패킷이 뭐길래?",
          authorName: "홍길동",
          body: "x".repeat(2001),
          turnstileToken: "valid-token",
        }),
      },
      createEnv(),
    )

    expect(response.status).toBe(400)
  })

  it("rate-limits the fourth submission from the same IP window", async () => {
    const env = createEnv()
    const app = createCommentsApp({
      now: () => "2026-06-10T00:00:00.000Z",
      turnstileVerifier: async () => ({ success: true }),
    })

    async function submit(body: string): Promise<Response> {
      return app.request(
        "/api/comments",
        {
          method: "POST",
          headers: {
            "CF-Connecting-IP": "203.0.113.20",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pagePath: "/Network/basic/01-what-is-packet/",
            pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
            pageTitle: "패킷이 뭐길래?",
            authorName: "홍길동",
            body,
            turnstileToken: "valid-token",
          }),
        },
        env,
      )
    }

    await expect(submit("첫 번째 댓글")).resolves.toHaveProperty("status", 201)
    await expect(submit("두 번째 댓글")).resolves.toHaveProperty("status", 201)
    await expect(submit("세 번째 댓글")).resolves.toHaveProperty("status", 201)

    const response = await submit("네 번째 댓글")

    expect(response.status).toBe(429)
    expect(await env.DB.countComments()).toBe(3)
  })

  it("rejects admin requests without a valid bearer token", async () => {
    const app = createCommentsApp()

    const response = await app.request("/api/admin/comments?status=pending", {}, createEnv())

    expect(response.status).toBe(401)
  })

  it("approves pending comments through admin API", async () => {
    const env = createEnv()
    await env.DB.insertComment({
      id: "pending-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "독자",
      authorEmailHash: null,
      body: "승인해주세요",
      status: "pending",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:02.000Z",
      updatedAt: "2026-06-10T00:00:02.000Z",
      approvedAt: null,
    })
    const app = createCommentsApp()

    const response = await app.request(
      "/api/admin/comments/pending-1/approve",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${TEST_ADMIN_TOKEN}` },
      },
      env,
    )

    expect(response.status).toBe(200)
    await expect(readJson(response)).resolves.toStrictEqual({
      id: "pending-1",
      status: "approved",
    })
    const publicResponse = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )
    expect(await readJson(publicResponse)).toMatchObject({
      comments: [{ id: "pending-1" }],
    })
  })

  it("shows deleted comments as public tombstones through tokenized admin links", async () => {
    const env = createEnv()
    await env.DB.insertComment({
      id: "approved-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "독자",
      authorEmailHash: null,
      body: "숨겨주세요",
      status: "approved",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:02.000Z",
      updatedAt: "2026-06-10T00:00:02.000Z",
      approvedAt: "2026-06-10T00:00:02.000Z",
    })
    const app = createCommentsApp()

    const response = await app.request(
      `/api/admin/comments/approved-1/delete?token=${TEST_ADMIN_TOKEN}`,
      {},
      env,
    )

    expect(response.status).toBe(200)
    const publicResponse = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )
    await expect(readJson(publicResponse)).resolves.toStrictEqual({
      comments: [
        {
          id: "approved-1",
          parentId: null,
          authorName: "삭제된 댓글",
          body: "삭제된 댓글입니다.",
          status: "deleted",
          createdAt: "2026-06-10T00:00:02.000Z",
        },
      ],
    })
  })

  it("builds Discord comment notifications with moderation and reply buttons", () => {
    const message = buildDiscordMessage({
      adminHideUrl:
        "https://blog.nvim.me/api/admin/comments/comment-1/delete?token=test-admin-token",
      comment: {
        id: "comment-1",
        parentId: null,
        pagePath: "/Network/basic/01-what-is-packet/",
        pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
        pageTitle: "패킷이 뭐길래?",
        authorName: "독자",
        authorEmailHash: null,
        body: "좋은 글이에요",
        status: "approved",
        ipHash: null,
        userAgentHash: null,
        createdAt: "2026-06-10T00:00:02.000Z",
        updatedAt: "2026-06-10T00:00:02.000Z",
        approvedAt: "2026-06-10T00:00:02.000Z",
      },
    })

    expect(message.content).toBe("🔔 새로운 댓글이 등록되었습니다.")
    expect(message.embeds).toStrictEqual([
      {
        title: "패킷이 뭐길래?",
        url: "https://blog.nvim.me/Network/basic/01-what-is-packet/#comment-comment-1",
        description: "좋은 글이에요",
        color: 3447003,
        author: {
          name: "독자",
        },
      },
    ])
    expect(message.components[0]?.components).toEqual([
      {
        type: 2,
        style: 5,
        label: "댓글 숨기기",
        url: "https://blog.nvim.me/api/admin/comments/comment-1/delete?token=test-admin-token",
      },
      {
        type: 2,
        style: 5,
        label: "확인",
        url: "https://blog.nvim.me/Network/basic/01-what-is-packet/#comment-comment-1",
      },
      {
        type: 2,
        style: 1,
        label: "대댓글",
        custom_id: "comment_reply:comment-1",
      },
    ])
  })

  it("responds to signed Discord PING interactions", async () => {
    const keys = await createDiscordSigningKeys()
    const request = await signedDiscordRequest("/api/discord/interactions", { type: 1 }, keys)
    const app = createCommentsApp()

    const response = await app.request(
      request.path,
      request.init,
      createEnv({ DISCORD_PUBLIC_KEY: keys.publicKeyHex }),
    )

    expect(response.status).toBe(200)
    await expect(readJson(response)).resolves.toStrictEqual({ type: 1 })
  })

  it("rejects Discord interactions with invalid signatures", async () => {
    const keys = await createDiscordSigningKeys()
    const request = await signedDiscordRequest("/api/discord/interactions", { type: 1 }, keys)
    const app = createCommentsApp()

    const response = await app.request(
      request.path,
      {
        ...request.init,
        headers: {
          "Content-Type": "application/json",
          "X-Signature-Ed25519": "00",
          "X-Signature-Timestamp": "1790000000",
        },
      },
      createEnv({ DISCORD_PUBLIC_KEY: keys.publicKeyHex }),
    )

    expect(response.status).toBe(401)
  })

  it("opens a Discord modal from the reply button for the admin user", async () => {
    const keys = await createDiscordSigningKeys()
    const request = await signedDiscordRequest(
      "/api/discord/interactions",
      {
        type: 3,
        member: { user: { id: "admin-user-id" } },
        data: { custom_id: "comment_reply:parent-1" },
      },
      keys,
    )
    const app = createCommentsApp()

    const response = await app.request(
      request.path,
      request.init,
      createEnv({
        DISCORD_ADMIN_USER_ID: "admin-user-id",
        DISCORD_PUBLIC_KEY: keys.publicKeyHex,
      }),
    )

    expect(response.status).toBe(200)
    await expect(readJson(response)).resolves.toMatchObject({
      type: 9,
      data: {
        custom_id: "comment_reply_modal:parent-1",
        title: "대댓글 작성",
      },
    })
  })

  it("creates an admin reply from a signed Discord modal submit", async () => {
    const keys = await createDiscordSigningKeys()
    const env = createEnv({
      DISCORD_ADMIN_USER_ID: "admin-user-id",
      DISCORD_PUBLIC_KEY: keys.publicKeyHex,
    })
    await env.DB.insertComment({
      id: "parent-1",
      parentId: null,
      pagePath: "/Network/basic/01-what-is-packet/",
      pageUrl: "https://blog.nvim.me/Network/basic/01-what-is-packet/",
      pageTitle: "패킷이 뭐길래?",
      authorName: "홍길동",
      authorEmailHash: null,
      body: "부모 댓글",
      status: "approved",
      ipHash: null,
      userAgentHash: null,
      createdAt: "2026-06-10T00:00:00.000Z",
      updatedAt: "2026-06-10T00:00:00.000Z",
      approvedAt: "2026-06-10T00:00:00.000Z",
    })
    const request = await signedDiscordRequest(
      "/api/discord/interactions",
      {
        type: 5,
        member: { user: { id: "admin-user-id" } },
        data: {
          custom_id: "comment_reply_modal:parent-1",
          components: [
            {
              components: [
                {
                  custom_id: "body",
                  value: "Discord에서 바로 단 대댓글입니다.",
                },
              ],
            },
          ],
        },
      },
      keys,
    )
    const app = createCommentsApp({
      createCommentId: () => "reply-1",
    })

    const response = await app.request(request.path, request.init, env)

    expect(response.status).toBe(200)
    await expect(readJson(response)).resolves.toMatchObject({
      type: 4,
      data: {
        content: "대댓글을 등록했어요.",
        flags: 64,
      },
    })
    const publicResponse = await app.request(
      "/api/comments?page_path=/Network/basic/01-what-is-packet/",
      {},
      env,
    )
    await expect(readJson(publicResponse)).resolves.toMatchObject({
      comments: [{ id: "parent-1" }, { id: "reply-1", parentId: "parent-1" }],
    })
  })
})

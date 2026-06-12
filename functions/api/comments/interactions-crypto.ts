import type { AppBindings } from "./types"

export async function verifyRequest(
  request: Request,
  env: AppBindings,
  body: string,
): Promise<boolean> {
  if (env.DISCORD_PUBLIC_KEY === undefined) {
    return false
  }
  const signature = request.headers.get("X-Signature-Ed25519")
  const timestamp = request.headers.get("X-Signature-Timestamp")
  if (signature === null || timestamp === null) {
    return false
  }
  return verifyDiscordSignature(env.DISCORD_PUBLIC_KEY, signature, timestamp, body)
}

export async function verifyDiscordSignature(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  body: string,
): Promise<boolean> {
  try {
    const publicKey = await crypto.subtle.importKey(
      "raw",
      hexToArrayBuffer(publicKeyHex),
      { name: "Ed25519" },
      false,
      ["verify"],
    )
    return crypto.subtle.verify(
      { name: "Ed25519" },
      publicKey,
      hexToArrayBuffer(signatureHex),
      utf8ArrayBuffer(`${timestamp}${body}`),
    )
  } catch (error) {
    if (error instanceof Error) {
      return false
    }
    throw error
  }
}

function hexToArrayBuffer(value: string): ArrayBuffer {
  if (value.length % 2 !== 0 || /[^0-9a-f]/iu.test(value)) {
    throw new Error("invalid hex")
  }
  const buffer = new ArrayBuffer(value.length / 2)
  const bytes = new Uint8Array(buffer)
  for (let index = 0; index < bytes.length; index += 1) {
    const offset = index * 2
    bytes[index] = Number.parseInt(value.slice(offset, offset + 2), 16)
  }
  return buffer
}

function utf8ArrayBuffer(value: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(value)
  const buffer = new ArrayBuffer(encoded.byteLength)
  new Uint8Array(buffer).set(encoded)
  return buffer
}

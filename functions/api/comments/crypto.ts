const TEXT_ENCODER = new TextEncoder()

export async function hashPrivateValue(value: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", TEXT_ENCODER.encode(`${salt}:${value}`))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

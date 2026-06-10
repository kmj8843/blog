import ky from "ky"
import type { AppBindings, TurnstileVerificationResult } from "./types"

type TurnstileSiteverifyResponse = {
  readonly success: boolean
}

export async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
  env: AppBindings,
): Promise<TurnstileVerificationResult> {
  const payload =
    remoteIp === null
      ? { secret: env.TURNSTILE_SECRET_KEY, response: token }
      : { secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: remoteIp }
  const result = await ky
    .post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      json: payload,
      timeout: 3000,
      retry: 0,
    })
    .json<TurnstileSiteverifyResponse>()
  return { success: result.success }
}

import type { RequestHandler } from "./$types"
import { publicClient } from "$lib/mud/setupNetwork"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "$env/static/private"
import { parseSiweMessage } from "viem/siwe"
import { createSessionToken } from "$lib/server/auth"

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { message, signature } = await request.json()

  const { address: user, nonce: messageNonce } = parseSiweMessage(message)
  if (!user) return new Response("No address provided", { status: 400 })

  const token = cookies.get("siwe_nonce")
  if (!token) return new Response("No token provided", { status: 400 })

  // Decode cookie-stored nonce and verify it matches signed message nonce
  const decoded = jwt.verify(token, JWT_SECRET)
  const { nonce: jwtNonce } = decoded as { nonce: string }

  if (messageNonce !== jwtNonce) {
    throw new Error("Nonce does not match")
  }

  const valid = await publicClient.verifySiweMessage({
    message,
    signature,
  })

  if (valid) {
    // Remove nonce from headers once verified
    const headers = new Headers()
    headers.append(
      "Set-Cookie",
      `siwe_nonce=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; ${
        request.url.startsWith("https:") ? "Secure" : ""
      }`,
    )

    // Set session
    const token = createSessionToken(user)

    headers.append(
      "Set-Cookie",
      `session_token=${token}; HttpOnly; Path=/; SameSite=Strict; ${
        request.url.startsWith("https:") ? "Secure" : ""
      }`,
    )

    return new Response("Authenticated", { status: 200, headers })
  } else {
    return new Response("invalid signature", { status: 403 })
  }
}

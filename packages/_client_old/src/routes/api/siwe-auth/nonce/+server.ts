import { generateSiweNonce } from "viem/siwe"
import type { RequestHandler } from "./$types"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "$env/static/private"

export const GET: RequestHandler = (req) => {
  const nonce = generateSiweNonce()
  const token = jwt.sign({ nonce }, JWT_SECRET, { expiresIn: "15m" })

  const headers = new Headers()
  headers.append(
    "Set-Cookie",
    `siwe_nonce=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
  )

  return new Response(nonce, { status: 200, headers })
}

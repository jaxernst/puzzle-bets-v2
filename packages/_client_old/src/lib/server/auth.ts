import { JWT_SECRET } from "$env/static/private"
import jwt from "jsonwebtoken"

export function createSessionToken(user: string) {
  const expiresIn = "1h" // Token expires in 1 hour
  const payload = {
    user,
    iat: Math.floor(Date.now() / 1000), // Issued at timestamp
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyUserToken(token: string): { user: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { user: string }
  } catch (error) {
    return null
  }
}

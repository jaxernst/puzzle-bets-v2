import type { RequestHandler } from "./$types"

export const POST: RequestHandler = ({ cookies }) => {
  if (cookies.get("session_token")) {
    cookies.set("session_token", "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(0), // Expire the cookie immediately
    })

    return new Response(null, { status: 200 })
  } else {
    return new Response(null, { status: 400 })
  }
}

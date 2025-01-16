import type { RequestHandler } from "./$types"

export const POST: RequestHandler = ({ cookies, locals }) => {
  if (cookies.get("session_token")) {
    cookies.set("session_token", "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(0), // Expire the cookie immediately
    })

    locals.user = undefined
    return new Response(null, { status: 200 })
  } else {
    return new Response(null, { status: 400 })
  }
}

import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = ({ locals, url }) => {
  // Redirect to the dashboard if the user is signed in already (bypass with any search param)
  if (
    locals.user &&
    url.pathname === "/" &&
    url.searchParams.toString() === ""
  ) {
    redirect(301, "/dashboard")
  }

  return {
    user: locals.user,
  }
}

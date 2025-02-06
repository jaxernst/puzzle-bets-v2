import { redirect } from "@sveltejs/kit"

// Temp fix: Warpcast frames is not using the webhook url specifified in farcaster.json
export const POST = () => {
  return redirect(302, "https://puzzlebets.xyz/api/farcaster/webhook")
}

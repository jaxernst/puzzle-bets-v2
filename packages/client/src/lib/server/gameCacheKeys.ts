import { PUBLIC_CHAIN_ID } from "$env/static/public"
import { networkConfig } from "$lib/mud/networkConfig"

const DEFAULT_DEPLOY_SLUG = `${networkConfig.worldAddress}_${PUBLIC_CHAIN_ID}`

export const wordleGameCacheKey = (
  gameId: string,
  authedAddress: string,
  deploySlug = DEFAULT_DEPLOY_SLUG,
) => `wordleCache_${gameId}_${authedAddress}_${deploySlug}`

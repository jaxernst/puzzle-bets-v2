import { get, writable } from "svelte/store"
import type { PuzzleType } from "./types"
import { toast } from "@zerodevx/svelte-toast"

interface InviteUrlParams {
  puzzleType: PuzzleType
  gameId: number
  gameWagerUsd?: number
  inviteName?: string | null
  password?: string
}

interface InviteUrlParams {
  puzzleType: PuzzleType
  gameId: number
  gameWagerUsd?: number
  inviteName?: string | null
  password?: string
}

const makeInviteUrl = ({
  puzzleType,
  gameId,
  gameWagerUsd,
  inviteName,
  password,
}: InviteUrlParams) => {
  const urlParams = new URLSearchParams({ puzzleType })

  if (inviteName) {
    urlParams.set("from", inviteName.split(" ").join("_"))
  }

  if (gameWagerUsd) {
    urlParams.set("valUsd", gameWagerUsd.toFixed(2))
  }

  if (password) {
    urlParams.set("pw", password)
  }

  return `${window.location.origin}/join/${gameId}?${urlParams.toString()}`
}

const saveInviteUrl = async (gameId: number, url: string) => {
  localStorage.setItem(`gameInviteUrl-${gameId}`, url)
}

export const gameInviteUrls = (() => {
  const urls = writable<Record<number, string>>({})

  const getOrLoadInviteUrl = (gameId: number): string | null => {
    const loadedUrl = get(urls)[gameId]
    if (loadedUrl) return loadedUrl
    return localStorage.getItem(`gameInviteUrl-${gameId}`)
  }

  return {
    subscribe: urls.subscribe,
    create: (params: InviteUrlParams) => {
      const url = makeInviteUrl(params)

      // Save to local storage for persistant access
      saveInviteUrl(params.gameId, url)

      urls.update((urls) => {
        return {
          ...urls,
          [params.gameId]: url,
        }
      })

      return url
    },

    getOrLoadInviteUrl,

    copyForGame: (gameId: number) => {
      const url = getOrLoadInviteUrl(gameId)
      if (url) {
        toast.push(
          "No invite link found. Please create a new game to generate a new link.",
        )
      }

      navigator.clipboard.writeText(url)
    },
  }
})()

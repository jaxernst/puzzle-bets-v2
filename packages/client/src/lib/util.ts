import { browser } from "$app/environment"
import type { Entity } from "@latticexyz/recs"
import {
  encodePacked,
  formatEther,
  keccak256,
  numberToHex,
  padHex,
  toHex,
} from "viem"

export const localTzOffsetHrs = () => {
  return -new Date().getTimezoneOffset() / 60
}

export function systemTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

export const timeOfDay = (timestamp: number, timezoneOffsetHrs = 0): number => {
  const date = new Date((timestamp + timezoneOffsetHrs * HOUR) * 1000)
  return (
    date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds()
  )
}

export const SECOND = 1
export const MINUTE = SECOND * 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24
export const WEEK = DAY * 7
export const MONTH = DAY * 30

export function formatTime(timeInSeconds: number) {
  const TIME_UNITS = [
    { value: 7 * 24 * 3600, label: "week" },
    { value: 24 * 3600, label: "day" },
    { value: 3600, label: "hour" },
    { value: 60, label: "minute" },
    { value: 1, label: "second" },
  ] as const

  // Handle 0 seconds case
  if (timeInSeconds === 0) return "0 seconds"

  // Find the two largest non-zero units
  const parts: string[] = []
  let remainingTime = timeInSeconds

  for (const { value, label } of TIME_UNITS) {
    const count = Math.floor(remainingTime / value)
    if (count > 0) {
      parts.push(`${count} ${label}${count === 1 ? "" : "s"}`)
      remainingTime %= value
      if (parts.length === 2) break
    }
  }

  // Join with appropriate conjunction
  return parts.length > 1 ? `${parts[0]} and ${parts[1]}` : parts[0]
}

export function formatTimeAbbr(timeInSeconds: number) {
  const MINUTE_IN_SECONDS = 60
  const HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60
  const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24
  const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7

  if (timeInSeconds < MINUTE_IN_SECONDS) {
    return `${timeInSeconds} s`
  } else if (timeInSeconds < HOUR_IN_SECONDS) {
    const minutes = Math.floor(timeInSeconds / MINUTE_IN_SECONDS)
    const seconds = timeInSeconds % MINUTE_IN_SECONDS
    return `${minutes} m ${seconds} s`
  } else if (timeInSeconds < DAY_IN_SECONDS) {
    const hours = Math.floor(timeInSeconds / HOUR_IN_SECONDS)
    const minutes = Math.floor(
      (timeInSeconds % HOUR_IN_SECONDS) / MINUTE_IN_SECONDS,
    )
    return `${hours} h, ${minutes} m`
  } else if (timeInSeconds < WEEK_IN_SECONDS) {
    const days = Math.floor(timeInSeconds / DAY_IN_SECONDS)
    const hours = Math.floor((timeInSeconds % DAY_IN_SECONDS) / HOUR_IN_SECONDS)
    return `${days} day${days === 1 ? "" : "s"}, ${hours} hr`
  } else {
    const weeks = Math.floor(timeInSeconds / WEEK_IN_SECONDS)
    const days = Math.floor((timeInSeconds % WEEK_IN_SECONDS) / DAY_IN_SECONDS)
    return `${weeks} week${weeks === 1 ? "" : "s"}, ${days} day${
      days === 1 ? "" : "s"
    }`
  }
}

export function timeString(secondsAfterMidnight: number) {
  let hours = Math.floor(secondsAfterMidnight / 3600)
  const minutes = Math.floor((secondsAfterMidnight % 3600) / 60)
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  const minutesFormatted = minutes < 10 ? "0" + minutes : minutes
  const strTime = hours + ":" + minutesFormatted + " " + ampm
  return strTime
}

export function timeString24Hour(secondsAfterMidnight: number) {
  const hours = Math.floor(secondsAfterMidnight / 3600)
  const minutes = Math.floor((secondsAfterMidnight % 3600) / 60)
  const minutesFormatted = minutes < 10 ? "0" + minutes : minutes
  const strTime = hours + ":" + minutesFormatted
  // Pad with 0 if needed
  return strTime.padStart(5, "0")
}

export function timeStringToSeconds(timeString: string) {
  const [hours, minutes] = timeString.split(":")

  let totalSeconds = 0

  // Calculate total seconds
  totalSeconds += parseInt(hours, 10) * 3600 // 1 hour = 3600 seconds
  totalSeconds += parseInt(minutes, 10) * 60 // 1 minute = 60 seconds

  return totalSeconds
}

export const readableTimezone = (offset: number) => {
  let localTimezone
  if (offset === localTzOffsetHrs()) {
    localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  return `UTC${offset >= 0 ? `+${offset}` : offset} (${
    localTimezone ?? "non-local"
  }) `
}

export const parseTimeString = (timeString: string) => {
  const time = timeString.replace(/\s/g, "").toUpperCase()

  // Regular expression to match time formats
  const timeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?/

  const match = time.match(timeRegex)
  if (!match) {
    throw new Error("Invalid time format")
  }

  let [_, hours, minutes, seconds = "0", ampm]: any[] = match

  // Convert to numbers
  hours = parseInt(hours, 10)
  minutes = parseInt(minutes, 10)
  seconds = parseInt(seconds, 10)

  // Adjust hours for 12-hour clock, if applicable
  if (ampm) {
    if (hours < 1 || hours > 12) {
      throw new Error("Invalid hour for 12-hour format")
    }
    if (ampm === "PM" && hours < 12) hours += 12
    if (ampm === "AM" && hours === 12) hours = 0
  } else {
    if (hours < 0 || hours > 23) {
      throw new Error("Invalid hour for 24-hour format")
    }
  }

  // Calculate total seconds
  return hours * 3600 + minutes * 60 + seconds
}

export const shortenAddress = (address: string, chars = 4) => {
  return `${address.substring(0, chars + 2)}...${address.substring(
    address.length - chars,
  )}`
}

export const capitalized = (str: string) => {
  return str
    .split(" ")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ")
}

export const intToEntity = <T extends boolean = false>(
  id: string | number | undefined | "demo",
  strict?: T,
): T extends true ? Entity : Entity | undefined => {
  if (!id || id === "demo") {
    if (strict) throw new Error("No game ID provided")
    return undefined as T extends true ? Entity : Entity | undefined
  }
  return padHex(numberToHex(BigInt(id)), { size: 32 }) as Entity
}

export const entityToInt = (entity: Entity) => {
  return parseInt(entity, 16).toString()
}

export function generateRandomID(length: number) {
  let result = ""
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const timeRemaining = (deadlineTimestampSeconds: bigint | number) => {
  const curTime = systemTimestamp()
  const tDiff = Number(deadlineTimestampSeconds) - curTime
  return Math.max(0, tDiff)
}

export const formatAsDollar = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export const weiToDollarFormatted = (wei: bigint, ethPrice: number) => {
  return formatAsDollar(Number(formatEther(wei)) * ethPrice)
}

export const formatSigFig = (num: number, sigFigs = 3) => {
  if (num === 0) return 0

  const d = Math.ceil(Math.log10(num < 0 ? -num : num)) // Order of magnitude
  const power = sigFigs - d

  const magnitude = Math.pow(10, power)
  const shifted = Math.round(num * magnitude)
  return shifted / magnitude
}

export const weiToDollar = (wei: bigint, ethPrice: number) => {
  return formatAsDollar(Number(formatEther(wei)) * ethPrice)
}

export const isIosSafari = () => {
  if (!browser) return false

  const ua = window.navigator.userAgent
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  const webkit = !!ua.match(/WebKit/i)
  return iOS && webkit && !ua.match(/CriOS/i)
}

export function getPWADisplayMode() {
  if (!browser) return
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  if (document.referrer.startsWith("android-app://")) {
    return "twa"
  } else if ((navigator as any).standalone || isStandalone) {
    return "standalone"
  }
  return "browser"
}

export function hashString(str: string) {
  return keccak256(toHex(str))
}

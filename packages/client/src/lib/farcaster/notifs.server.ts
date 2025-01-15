import {
  sendNotificationResponseSchema,
  type FrameNotificationDetails,
  type SendNotificationRequest,
} from "@farcaster/frame-node"

type SendFrameNotificationResult =
  | {
      state: "error"
      error: unknown
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" }

export async function sendFrameNotification({
  title,
  body,
  notificationDetails,
}: {
  title: string
  body: string
  notificationDetails: FrameNotificationDetails
}): Promise<SendFrameNotificationResult> {
  const response = await fetch(notificationDetails.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title,
      body,
      targetUrl: "https://beta.puzzlebets.xyz/dashboard",
      tokens: [notificationDetails.token],
    } satisfies SendNotificationRequest),
  })

  const responseJson = await response.json()

  if (response.status === 200) {
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson)
    if (responseBody.success === false) {
      // Malformed response
      return { state: "error", error: responseBody.error.errors }
    }

    if (responseBody.data.result.rateLimitedTokens.length) {
      // Rate limited
      return { state: "rate_limit" }
    }

    return { state: "success" }
  } else {
    // Error response
    return { state: "error", error: responseJson }
  }
}

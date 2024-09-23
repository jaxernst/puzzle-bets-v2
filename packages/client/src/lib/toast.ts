import { toast } from "@zerodevx/svelte-toast"

export const toastError = (error: string) => {
  toast.push(error, {
    duration: 6000,
    theme: {
      "--toastColor": "#ffffff",
      "--toastBackground": "#dc2626",
      "--toastBarBackground": "#fc4646",
      "--toastBorderRadius": "8px",
    },
  })
}

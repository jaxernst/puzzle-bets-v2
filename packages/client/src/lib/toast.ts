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

export const toastInfo = (info: string) => {
  toast.push(info, {
    duration: 6000,
    theme: {
      "--toastColor": "#ffffff",
      "--toastBackground": "#2FB163",
      "--toastBarBackground": "#3Fc173",
      "--toastBorderRadius": "8px",
    },
  })
}

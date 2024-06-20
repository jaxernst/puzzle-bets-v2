// export const prerender = false;
// export const ssr = false;

import { inject } from "@vercel/analytics"
import { dev } from "$app/environment"

inject({ mode: dev ? "development" : "production" })

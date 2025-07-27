import { router } from "@inertiajs/react"

// Get CSRF token from multiple possible sources
export const getCsrfToken = (): string => {
  // Try meta tag first
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
  if (metaToken) {
    return metaToken
  }

  // Try from window object (if Laravel sets it globally)
  if (typeof window !== "undefined" && (window as any).Laravel?.csrfToken) {
    return (window as any).Laravel.csrfToken
  }

  // Try from cookie (Laravel's default XSRF-TOKEN)
  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === "XSRF-TOKEN") {
      return decodeURIComponent(value)
    }
    if (name === "laravel_session") {
      // If we have a session cookie, we should be able to get CSRF token
      break
    }
  }

  console.warn("CSRF token not found")
  return ""
}

// Use Inertia's router for POST requests (recommended approach)
export const makeInertiaRequest = (
  url: string,
  data: any,
  options: {
    method?: "post" | "put" | "patch" | "delete"
    onSuccess?: (response: any) => void
    onError?: (errors: any) => void
    preserveScroll?: boolean
  } = {},
) => {
  const { method = "post", onSuccess, onError, preserveScroll = true } = options

  return router[method](url, data, {
    preserveScroll,
    preserveState: true,
    only: [], // Don't reload any props
    onSuccess: (page) => {
      if (onSuccess) {
        // Extract response data from page props or handle success
        onSuccess(page)
      }
    },
    onError: (errors) => {
      if (onError) {
        onError(errors)
      }
    },
  })
}

// Alternative: Use fetch with proper CSRF handling
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const csrfToken = getCsrfToken()

  if (!csrfToken) {
    throw new Error("CSRF token not found. Please refresh the page.")
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-CSRF-TOKEN": csrfToken,
    "X-Requested-With": "XMLHttpRequest",
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "same-origin",
  }

  const response = await fetch(url, mergedOptions)

  if (response.status === 419) {
    // CSRF token mismatch - refresh the page to get a new token
    window.location.reload()
    throw new Error("CSRF token expired. Page will refresh.")
  }

  return response
}

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL

function resolveApiBaseUrl() {
  if (envApiBaseUrl) {
    return envApiBaseUrl
  }

  const { hostname, protocol } = window.location

  if (hostname.endsWith('.app.github.dev')) {
    return `${protocol}//${hostname.replace('-5173.app.github.dev', '-8000.app.github.dev')}`
  }

  return 'http://localhost:8000'
}

export const API_BASE_URL = resolveApiBaseUrl()

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message ?? `Request failed with status ${response.status}`)
  }

  return data
}
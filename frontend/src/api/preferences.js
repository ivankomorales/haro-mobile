// src/api/preferences.js
import { fx } from './_fetcher'

export async function getMyPreference(namespace, { fetcher } = {}) {
  return fx(fetcher)(`/api/me/preferences/${encodeURIComponent(namespace)}`)
}

export async function setMyPreference(namespace, value, { fetcher } = {}) {
  return fx(fetcher)(`/api/me/preferences/${encodeURIComponent(namespace)}`, {
    method: 'PUT',
    body: { value },
  })
}

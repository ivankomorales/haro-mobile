// src/utils/navigationUtils.js
const EXCLUDED_PATHS = [
  '/orders/new',
  '/orders/edit',
  '/orders/confirmation',
  '/users/add',
  '/glazes/add',
]

/**
 * Determines a valid origin path to return to, ignoring excluded pages.
 * - If current path is excluded, fallback is used (UNLESS originPath is passed explicitly).
 */
export function getOriginPath(originCandidate, fallback = '/home') {
  if (!originCandidate) return fallback
  return EXCLUDED_PATHS.some((prefix) => originCandidate.startsWith(prefix))
    ? fallback
    : originCandidate
}

export function getCurrentFullPath() {
  try {
    return window.location.pathname + window.location.search + window.location.hash
  } catch {
    return '/'
  }
}

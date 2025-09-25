// src/api/_fetcher.js
// comments in English only
import fetchWithAuth from '../utils/fetchWithAuth'

/**
 * Returns the provided fetcher or the default authenticated fetcher.
 * @param {(url: string, options?: RequestInit) => Promise<any> | null | undefined} fetcher
 * @returns {(url: string, options?: RequestInit) => Promise<any>}
 */
export function fx(fetcher) {
  return fetcher ?? fetchWithAuth
}

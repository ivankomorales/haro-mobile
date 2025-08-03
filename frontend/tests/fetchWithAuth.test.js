import { describe, it, expect, vi, beforeEach } from 'vitest'
import fetchWithAuth from '../src/utils/fetchWithAuth'

global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null
  },
  setItem(key, value) {
    this.store[key] = value.toString()
  },
  removeItem(key) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  },
}

describe('fetchWithAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('should return JSON data on 200 OK', async () => {
    const mockData = { success: true }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
      clone: () => ({
        text: async () => JSON.stringify(mockData),
      }),
    })

    const data = await fetchWithAuth('/fake-endpoint')
    expect(data).toEqual(mockData)
  })

  it('should handle non-JSON response (e.g. HTML)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON')
      },
      clone: () => ({
        text: async () => '<html>Error 500</html>',
      }),
    })

    await expect(fetchWithAuth('/fail')).rejects.toThrow('auth.unknownError')
  })

  it('should handle 401 and call logout()', async () => {
    const logout = vi.fn()

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
      clone: () => ({
        text: async () => 'Unauthorized',
      }),
    })

    await expect(
      fetchWithAuth('/unauthorized', {}, { logout })
    ).rejects.toThrow('auth.sessionExpired')

    expect(logout).toHaveBeenCalledWith(true)
  })
})

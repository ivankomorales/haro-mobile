// src/utils/getMessage.js
// comments in English only
import * as enMod from '../locales/en'
import * as esMod from '../locales/es'

// Pick the dictionary object from a module regardless of how it was exported
function pickDict(mod, preferKey) {
  if (mod?.default && typeof mod.default === 'object') return mod.default
  if (preferKey && mod?.[preferKey] && typeof mod[preferKey] === 'object') return mod[preferKey]
  if (mod?.en && typeof mod.en === 'object') return mod.en
  if (mod?.es && typeof mod.es === 'object') return mod.es
  // Fallback: first object-like export
  const firstObj = Object.values(mod).find((v) => v && typeof v === 'object')
  return firstObj || {}
}

const en = pickDict(enMod, 'en')
const es = pickDict(esMod, 'es')

const DICTS = { en, es }

// Persisted or default locale
let CURRENT_LOCALE = (() => {
  try {
    return localStorage.getItem('locale') || 'es'
  } catch {
    return 'es'
  }
})()

export function setLocale(next) {
  if (typeof next === 'string' && DICTS[next]) {
    CURRENT_LOCALE = next
    try {
      localStorage.setItem('locale', next)
    } catch {}
  }
}

export function getLocale() {
  return CURRENT_LOCALE
}

// Safe nested lookup with dot-notation
function resolve(dict, key) {
  return key
    .split('.')
    .reduce(
      (obj, part) =>
        obj && Object.prototype.hasOwnProperty.call(obj, part) ? obj[part] : undefined,
      dict
    )
}

/**
 * getMessage(key, vars?)
 * Resolves from CURRENT_LOCALE, falls back to 'en', then to the key itself.
 */
export function getMessage(key, vars) {
  const active = DICTS[CURRENT_LOCALE] || DICTS.es || {}
  let msg = resolve(active, key)
  if (msg === undefined) msg = resolve(DICTS.en || {}, key)
  if (msg === undefined) msg = key

  if (vars && typeof msg === 'string') {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return msg
}

export const AVAILABLE_LOCALES = Object.keys(DICTS)

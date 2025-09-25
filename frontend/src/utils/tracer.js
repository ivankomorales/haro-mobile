// src/utils/tracer.js
// comments in English only

/**
 * Logs a snapshot of the given object with a stage label.
 * @param {string} label - Stage name (e.g. "UIProduct normalized").
 * @param {any} obj - Object to snapshot.
 * @returns {any} The same object (for fluent chaining).
 */
export function traceStage(label, obj) {
  try {
    const snapshot = JSON.parse(JSON.stringify(obj))
    console.groupCollapsed(`[TRACE] ${label}`)
    console.table(snapshot)
    console.groupEnd()
  } catch (err) {
    console.warn(`[TRACE] ${label} (failed to serialize)`, obj)
  }
  return obj
}

/**
 * Throws if UI-only fields leaked into DomainProduct.
 * @param {object} p - Product to validate.
 */
export function assertDomainProductInvariant(p) {
  if (import.meta.env.MODE === 'production') return

  const forbidden = ['glazeLabels', 'imagesLocal', 'uiOnly', 'label', 'displayName']
  const leaked = forbidden.filter((k) => k in p)
  if (leaked.length) {
    console.error('Forbidden UI fields leaked into DomainProduct:', leaked, p)
    throw new Error(`DomainProduct invariant violated: ${leaked.join(', ')}`)
  }

  if (p.glazes) {
    for (const side of ['exterior', 'interior']) {
      const v = p.glazes[side]
      if (v && typeof v !== 'string') {
        throw new Error('DomainProduct.glazes must contain string IDs only')
      }
    }
  }
}

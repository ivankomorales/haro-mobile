// comments in English only

// ----- UI display / parsing (react-datepicker / date-fns) -----
export const UI_DMY = 'dd-MM-yyyy'
export const UI_LONG = 'MMM dd, yyyy'

// ----- Excel number formats (ExcelJS numFmt) -----
export const XLSX_ISO = 'yyyy-mm-dd'
export const XLSX_DMY = 'dd-mm-yyyy'

// Basic validation
export function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime())
}

// Create a local-midnight Date from numbers
export function makeLocalDate(y, m, d) {
  const dt = new Date(y, m - 1, d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

// Parse "DD-MM-YYYY" into local Date
export function parseDMY(str) {
  if (!str || typeof str !== 'string') return null
  const [dd, mm, yyyy] = str.split('-').map((x) => parseInt(x, 10))
  if (!dd || !mm || !yyyy) return null
  return makeLocalDate(yyyy, mm, dd)
}

// Parse "YYYY-MM-DD" into local Date
export function parseYMD(str) {
  if (!str || typeof str !== 'string') return null
  const [yyyy, mm, dd] = str.split('-').map((x) => parseInt(x, 10))
  if (!yyyy || !mm || !dd) return null
  return makeLocalDate(yyyy, mm, dd)
}

// Detect format and parse accordingly
export function parseFlexible(str) {
  if (!str || typeof str !== 'string') return null
  const s = str.trim()
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return parseDMY(s) // DD-MM-YYYY
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return parseYMD(s.slice(0, 10)) // YYYY-MM-DD
  return null
}

// Convert Date -> "YYYY-MM-DD" (local)
export function toYMD(date) {
  if (!(date instanceof Date) || !isValidDate(date)) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Parse "YYYY-MM-DD" string into Date (alias for parseYMD)
export function fromYMD(ymd) {
  return parseYMD(ymd)
}

// Format "YYYY-MM-DD" -> "DD-MM-YYYY"
export function ymdToDMY(ymd) {
  if (!ymd || typeof ymd !== 'string') return ''
  const [y, m, d] = ymd.split('-')
  if (!y || !m || !d) return ''
  return `${d}-${m}-${y}`
}

// Format Date -> "DD-MM-YYYY"
export function formatDMY(value) {
  if (!value) return ''
  let d = null
  if (value instanceof Date) {
    d = value
  } else if (typeof value === 'string') {
    d = parseFlexible(value)
  } else {
    d = new Date(value)
  }
  if (!isValidDate(d)) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

// Start/end of day
export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

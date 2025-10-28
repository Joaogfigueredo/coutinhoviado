// backend/src/lib/strings.js
export function normalizeEmail (email) {
  return String(email).trim().toLowerCase()
}

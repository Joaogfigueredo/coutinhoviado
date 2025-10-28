// backend/src/lib/password.js
import bcrypt from 'bcrypt'

const ROUNDS = 12

export async function hashPassword (password) {
  const salt = await bcrypt.genSalt(ROUNDS)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword (password, hash) {
  return bcrypt.compare(password, hash)
}

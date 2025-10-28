// backend/src/lib/jwt.js
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev-secret'
const ACCESS_EXPIRES_IN = '24h'

export function signAccess (payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN })
}

export async function issueRefresh (userId) {
  // Retorna um JWT simples como refresh token
  const jti = crypto.randomUUID()
  return jwt.sign({ sub: userId, jti }, ACCESS_SECRET, { expiresIn: '7d' })
}

export async function verifyRefresh (token) {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET)
    if (!payload.sub) {
      throw new Error('Refresh token inválido')
    }
    return payload
  } catch (error) {
    throw new Error('Refresh token inválido')
  }
}

export async function rotateRefresh (jti, userId) {
  // Simplesmente emite um novo refresh token
  return issueRefresh(userId)
}

export function signToken (payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN })
}

export function verifyToken (token) {
  try {
    return jwt.verify(token, ACCESS_SECRET)
  } catch {
    return null
  }
}

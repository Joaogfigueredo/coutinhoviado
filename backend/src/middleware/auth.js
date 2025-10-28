// backend/src/middleware/auth.js
import { verifyToken } from '../lib/jwt.js'
import prisma from '../lib/prisma.js'

export async function requireAuth (req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token ausente' })
    }

    const token = header.slice(7).trim()
    if (!token) return res.status(401).json({ error: 'Token ausente' })

    const payload = verifyToken(token)
    // Aceita tanto 'id' quanto 'sub' como identificador de usuário
    const userId = payload?.id ? Number(payload.id) : (payload?.sub ? Number(payload.sub) : NaN)
    if (!payload || Number.isNaN(userId)) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' })

    req.user = user
    return next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ error: 'Falha na autenticação' })
  }
}

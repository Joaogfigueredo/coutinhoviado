// backend/src/routes/auth.js
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import crypto from 'crypto'
import { z } from 'zod'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { normalizeEmail } from '../lib/strings.js'
import prisma from '../lib/prisma.js'
import { signAccess, issueRefresh, verifyRefresh, rotateRefresh } from '../lib/jwt.js'
import { requireAuth } from '../middleware/auth.js'
import { sendMail } from '../lib/mailer.js'

const router = Router()

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 })

// Aceita password OU senha (para evitar 422 por nome de campo)
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).optional(),
  senha: z.string().min(1).optional(),
})

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  avatarUrl: z.string().url().optional(),
})

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
})

const respondWithTokens = async (user) => {
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }
  const access = signAccess({ id: user.id })
  const refresh = await issueRefresh(user.id)
  return { user: safeUser, access, refresh }
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, avatarUrl } = RegisterSchema.parse(req.body)
    const emailNorm = normalizeEmail(email)

    const existing = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (existing) return res.status(409).json({ error: 'E-mail já cadastrado' })

    const passwordHash = await hashPassword(password)
    const created = await prisma.user.create({
      data: { name, email: emailNorm, passwordHash, avatarUrl },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    })

    const payload = await respondWithTokens(created)
    res.status(201).json(payload)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Register error:', error)
    res.status(500).json({ error: 'Falha ao registrar' })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password, senha } = LoginSchema.parse(req.body)
    const pwd = password ?? senha
    if (!pwd) return res.status(422).json({ error: 'Senha obrigatória' })

    const emailNorm = normalizeEmail(email)
    const user = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

    const ok = await verifyPassword(pwd, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

    const payload = await respondWithTokens(user)
    res.json(payload)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Falha no login' })
  }
})

router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const { refresh } = z.object({ refresh: z.string().min(10) }).parse(req.body ?? {})
    const payload = await verifyRefresh(refresh)
    const access = signAccess({ id: payload.sub })
    const nextRefresh = await rotateRefresh(payload.jti, payload.sub)
    res.json({ access, refresh: nextRefresh })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({ code: 'REFRESH_INVALID', message: 'Sessão expirada.' })
  }
})

router.post('/password/forgot', authLimiter, async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body ?? {})
    const emailNorm = normalizeEmail(email)
    const user = await prisma.user.findUnique({ where: { email: emailNorm }, select: { id: true } })

    if (user) {
      const token = crypto.randomBytes(24).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      })

      const appUrl = process.env.APP_URL || 'http://localhost:5173'
      const url = `${appUrl.replace(/\/$/, '')}/reset?token=${token}`
      await sendMail(emailNorm, 'Redefinição de senha', `<p>Clique para redefinir: <a href="${url}">${url}</a></p>`)
    }

    res.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Falha ao enviar e-mail de redefinição' })
  }
})

router.post('/password/reset', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = z
      .object({ token: z.string().min(10), newPassword: z.string().min(8).max(72) })
      .parse(req.body ?? {})

    const row = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return res.status(400).json({ code: 'TOKEN_INVALID' })
    }

    const hashed = await hashPassword(newPassword)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: row.userId }, data: { passwordHash: hashed } })
      await tx.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } })
      await tx.refreshToken.updateMany({ where: { userId: row.userId, revokedAt: null }, data: { revokedAt: new Date() } })
    })

    res.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Falha ao redefinir senha' })
  }
})

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = ChangePasswordSchema.parse(req.body)
    if (oldPassword === newPassword) {
      return res.status(422).json({ error: 'A nova senha deve ser diferente da atual.' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, passwordHash: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const valid = await verifyPassword(oldPassword, user.passwordHash)
    if (!valid) {
      return res.status(400).json({ error: 'Senha atual incorreta' })
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } })
      await tx.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })
    })

    return res.status(204).send()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: 'Dados inválidos', issues: error.flatten() })
    }
    console.error('Change password error:', error)
    return res.status(500).json({ error: 'Falha ao alterar a senha' })
  }
})

router.post('/logout', requireAuth, async (req, res) => {
  try {
    await prisma.refreshToken.updateMany({ where: { userId: req.user.id, revokedAt: null }, data: { revokedAt: new Date() } })
    res.json({ ok: true })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Falha ao encerrar sessão' })
  }
})

export default router

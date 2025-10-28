import nodemailer from 'nodemailer'

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
})

export async function sendMail(to, subject, html) {
  if (!process.env.SMTP_HOST || !to) return
  const from = process.env.SMTP_USER ? `"MoneyMap" <${process.env.SMTP_USER}>` : 'MoneyMap <no-reply@moneymap>'
  await mailer.sendMail({ from, to, subject, html })
}

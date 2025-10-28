import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'dev@moneymapp.test'
  const plain = 'senha12345'
  const passwordHash = await bcrypt.hash(plain, 10)

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name: 'Dev User',
      email,
      passwordHash,
      avatarUrl: null,
    },
    update: { passwordHash },
  })

  console.log('Seed user ensured:', { id: user.id, email: user.email })

  // create sample accounts if none
  const accounts = await prisma.account.findMany({ where: { userId: user.id } })
  if (accounts.length === 0) {
    await prisma.account.createMany({
      data: [
        { name: 'Carteira', color: '#3b82f6', isDefault: true, initialBalance: '250.00', userId: user.id },
        { name: 'Banco Principal', color: '#22c55e', initialBalance: '4800.00', userId: user.id },
      ],
    })
    console.log('Created sample accounts')
  }

  // sample goals
  const existing = await prisma.goal.findMany({ where: { userId: user.id } })
  if (existing.length === 0) {
    await prisma.goal.createMany({
      data: [
        { title: 'Reserva de Emergência', targetAmount: 12000.0, currentAmount: 8500.0, currency: 'BRL', status: 'active', userId: user.id },
        { title: 'Viagem', targetAmount: 8000.0, currentAmount: 3200.0, currency: 'BRL', status: 'active', userId: user.id },
      ],
    })
    console.log('Created sample goals')
  } else {
    console.log('Goals already present, skipping')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


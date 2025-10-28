import { Prisma } from '@prisma/client'

const SCHEMA_ERROR_CODES = new Set([
  'P2010',
  'P2014',
  'P2021',
  'P2023',
  'P2024',
])

export const isSchemaOutOfSyncError = (error) =>
  error instanceof Prisma.PrismaClientKnownRequestError && SCHEMA_ERROR_CODES.has(error.code)

export async function withPrismaFallback(queryFn, fallbackValue) {
  try {
    return await queryFn()
  } catch (error) {
    if (isSchemaOutOfSyncError(error)) {
      console.warn('[prismaSafe] Ignoring schema mismatch error:', error.message)
      return typeof fallbackValue === 'function' ? fallbackValue(error) : fallbackValue
    }
    throw error
  }
}

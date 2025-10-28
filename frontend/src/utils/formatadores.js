import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarMoedaBRL(valor) {
  const n = Number(valor)
  if (!isFinite(n)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

export function formatarDataISOParaBR(iso) {
  if (!iso) return ''
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : new Date(iso)
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return ''
  }
}

export function anoMesAtual() {
  return format(new Date(), 'yyyy-MM')
}

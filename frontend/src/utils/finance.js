export function jurosCompostos(pv, i, n) {
  return pv * Math.pow(1 + i, n)
}

export function parcelaPrice(P, i, n) {
  if (i === 0) return P / n
  return P * (i / (1 - Math.pow(1 + i, -n)))
}

export function cronogramaSAC(P, i, n) {
  const amortizacao = P / n
  let saldo = P
  return Array.from({ length: n }).map((_, index) => {
    const juros = saldo * i
    const parcela = amortizacao + juros
    saldo -= amortizacao
    return {
      parcela,
      juros,
      amortizacao,
      saldo: Math.max(0, saldo),
      periodo: index + 1,
    }
  })
}

export function custoDeVida(baseAnual, inflacao, anos) {
  return baseAnual * Math.pow(1 + inflacao, anos)
}

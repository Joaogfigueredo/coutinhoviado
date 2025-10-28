export function validarEmail(email) {
  const re = /[^@\s]+@[^@\s]+\.[^@\s]+/
  return re.test(email)
}

export function validarValorPositivo(valor) {
  return Number(valor) > 0
}

export function validarSenhaMinima(senha, minimo = 6) {
  return typeof senha === 'string' && senha.length >= minimo
}

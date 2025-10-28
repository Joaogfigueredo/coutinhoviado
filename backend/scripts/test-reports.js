import fetch from 'node-fetch'

const API = process.env.API_URL || 'http://localhost:3000'
const CREDENTIALS = { email: 'dev@moneymapp.test', password: 'senha12345' }

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Login failed: ${data.error || res.status}`)
  return data.token
}

async function assertOk(response, message) {
  if (!response.ok) {
    const payload = await response.text()
    throw new Error(`${message}: ${response.status} - ${payload}`)
  }
}

async function run() {
  try {
    const token = await login()
    console.log('Logged in, token length:', token.length)

    const headers = { Authorization: `Bearer ${token}` }

    const totalsRes = await fetch(`${API}/relatorios/totais?periodo=6meses`, { headers })
    await assertOk(totalsRes, 'Totals endpoint failed')
    const totalsData = await totalsRes.json()
    console.log('Totals keys:', Object.keys(totalsData.totals || {}))

    const mensalRes = await fetch(`${API}/relatorios/mensal?periodo=6meses`, { headers })
    await assertOk(mensalRes, 'Monthly endpoint failed')
    const mensalData = await mensalRes.json()
    console.log('Monthly samples:', (mensalData.receitasVsDespesas || []).length)

    const categoriasRes = await fetch(`${API}/relatorios/categorias?periodo=6meses`, { headers })
    await assertOk(categoriasRes, 'Categories endpoint failed')
    const categoriasData = await categoriasRes.json()
    console.log('Categories found:', (categoriasData.categorias || []).length)

    console.log('All report endpoints OK')
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

run()

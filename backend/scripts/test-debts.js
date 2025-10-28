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
  if (!res.ok) throw new Error('Login failed: ' + (data.error || JSON.stringify(data)))
  return data.token
}

async function run() {
  try {
    const token = await login()
    console.log('Logged in, token length:', token.length)

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    // create
    const createRes = await fetch(`${API}/debts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: 'Teste Debt Script', principal: '1000.00', interestRate: '0.05', installments: 12 }),
    })
    const createData = await createRes.json()
    if (!createRes.ok) throw new Error('Create failed: ' + JSON.stringify(createData))
    console.log('Created debt:', createData.debt.id)

    const debtId = createData.debt.id

    // list
    const listRes = await fetch(`${API}/debts`, { headers })
    const listData = await listRes.json()
    if (!listRes.ok) throw new Error('List failed: ' + JSON.stringify(listData))
    console.log('Total debts:', (listData.debts || []).length)

    // update
    const updRes = await fetch(`${API}/debts/${debtId}`, {
      method: 'PUT', headers, body: JSON.stringify({ title: 'Teste Debt Atualizado', principal: '900.00' })
    })
    const updData = await updRes.json()
    if (!updRes.ok) throw new Error('Update failed: ' + JSON.stringify(updData))
    console.log('Updated debt:', updData.debt.id)

    // delete
    const delRes = await fetch(`${API}/debts/${debtId}`, { method: 'DELETE', headers })
    if (delRes.status !== 204) {
      const d = await delRes.json()
      throw new Error('Delete failed: ' + JSON.stringify(d))
    }
    console.log('Deleted debt:', debtId)

    console.log('All tests passed')
  } catch (e) {
    console.error('Test failed:', e)
    process.exit(1)
  }
}

run()

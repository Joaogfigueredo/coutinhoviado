import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

const instancia = axios.create({ baseURL })

// Interceptor REQUEST para adicionar token em TODAS as requisições
instancia.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mm_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Wrappers de endpoints
const api = {
  instancia,
  auth: {
    login: (payload) => instancia.post('/auth/login', payload),
    register: (payload) => instancia.post('/auth/register', payload),
    changePassword: (payload) => instancia.post('/auth/change-password', payload),
  },
  transacoes: {
    listar: (filtros = {}) => instancia.get('/transacoes', { params: filtros }),
    criar: (payload) => instancia.post('/transacoes', payload),
    atualizar: (id, payload) => instancia.put(`/transacoes/${id}`, payload),
    remover: (id) => instancia.delete(`/transacoes/${id}`),
    migrar: (payload) => instancia.post('/transacoes/migrate', payload),
    transferir: (payload) => instancia.post('/transacoes/transfer', payload),
    importar: (formData) => instancia.post('/transacoes/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    recorrentes: {
      listar: () => instancia.get('/transacoes/recorrentes'),
      criar: (payload) => instancia.post('/transacoes/recorrentes', payload),
      atualizar: (id, payload) => instancia.put(`/transacoes/recorrentes/${id}`, payload),
      remover: (id) => instancia.delete(`/transacoes/recorrentes/${id}`),
      executar: (id) => instancia.post(`/transacoes/recorrentes/${id}/executar`),
      processarPendentes: () => instancia.post('/transacoes/recorrentes/processar'),
    },
  },
  metas: {
    listar: () => instancia.get('/metas'),
    criar: (payload) => instancia.post('/metas', payload),
    atualizar: (id, payload) => instancia.put(`/metas/${id}`, payload),
    remover: (id) => instancia.delete(`/metas/${id}`),
  },
  relatorios: {
    totais: (periodo) => instancia.get('/relatorios/totais', { params: periodo ? { periodo } : undefined }),
    categorias: (periodo) => instancia.get('/relatorios/categorias', { params: periodo ? { periodo } : undefined }),
    mensal: (periodo) => instancia.get('/relatorios/mensal', { params: { periodo } }),
  },
  dashboard: {
    overview: (periodo) => instancia.get('/dashboard', { params: periodo ? { periodo } : undefined }),
  },
  budgets: {
    listar: () => instancia.get('/budgets'),
    criar: (payload) => instancia.post('/budgets', payload),
    atualizar: (id, payload) => instancia.put(`/budgets/${id}`, payload),
    remover: (id) => instancia.delete(`/budgets/${id}`),
  },
  debts: {
    listar: () => instancia.get('/debts'),
    criar: (payload) => instancia.post('/debts', payload),
    atualizar: (id, payload) => instancia.put(`/debts/${id}`, payload),
    remover: (id) => instancia.delete(`/debts/${id}`),
  },
  accounts: {
    list: (params = {}) => instancia.get('/accounts', { params }),
    create: (payload) => instancia.post('/accounts', payload),
    update: (id, payload) => instancia.put(`/accounts/${id}`, payload),
    remove: (id) => instancia.delete(`/accounts/${id}`),
  },
  categories: {
    list: () => instancia.get('/categories'),
    create: (payload) => instancia.post('/categories', payload),
    update: (id, payload) => instancia.put(`/categories/${id}`, payload),
    remove: (id) => instancia.delete(`/categories/${id}`),
  },
  notifications: {
    listar: (params = {}) => instancia.get('/notifications', { params }),
    criar: (payload) => instancia.post('/notifications', payload),
    marcarTodasComoLidas: () => instancia.post('/notifications/mark-all-read'),
    marcarComoLida: (id) => instancia.post(`/notifications/${id}/read`),
    marcarComoNaoLida: (id) => instancia.post(`/notifications/${id}/unread`),
    remover: (id) => instancia.delete(`/notifications/${id}`),
    preferencias: {
      obter: () => instancia.get('/notifications/prefs'),
      salvar: (payload) => instancia.put('/notifications/prefs', payload),
    },
    executarAgora: () => instancia.post('/notifications/run-now'),
  },
  settings: {
    obter: () => instancia.get('/settings'),
    salvar: (payload) => instancia.put('/settings', payload),
  },
  education: {
    progresso: () => instancia.get('/education/progress'),
    salvarProgresso: (payload) => instancia.post('/education/progress', payload),
  },
}

export default api

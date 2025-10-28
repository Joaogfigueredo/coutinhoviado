// src/context/AuthContext.jsx
import { createContext, useEffect, useMemo, useState, useContext } from 'react'
import api from '../services/api'

const AuthContexto = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mm_usuario') ?? 'null')
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('mm_token') ?? '')

  // Propaga/remova o Authorization no axios quando o token mudar
  useEffect(() => {
    if (token) {
      api.instancia.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.instancia.defaults.headers.common['Authorization']
    }
  }, [token])

  // LOGIN — aceita { email, senha } OU { email, password }
  async function entrar({ email, senha, password }) {
    const pwd = password ?? senha
    if (!email || !pwd) throw new Error('Credenciais incompletas')

    const { data } = await api.auth.login({ email, password: pwd })

    // Compatível com { user, access } ou { user, token } ou { usuario, token }
    const u = data?.user ?? data?.usuario ?? null
    const t = data?.access ?? data?.token ?? ''

    setToken(t)
    setUsuario(u)

    if (t) localStorage.setItem('mm_token', t)
    else localStorage.removeItem('mm_token')

    if (u) localStorage.setItem('mm_usuario', JSON.stringify(u))
    else localStorage.removeItem('mm_usuario')

    return data
  }

  // CADASTRO — aceita { nome/name, email, senha/password, avatarUrl/avatar }
  async function registrar(dados) {
    const payload = {
      name: dados?.nome ?? dados?.name ?? '',
      email: dados?.email ?? '',
      password: dados?.senha ?? dados?.password ?? '',
      avatarUrl: dados?.avatarUrl ?? dados?.avatar ?? undefined,
    }

    const { data } = await api.auth.register(payload)

    // Se o backend já devolver token + user/usuario, efetua login automático
    const u = data?.user ?? data?.usuario ?? null
    const t = data?.access ?? data?.token ?? ''

    if (t || u) {
      setToken(t)
      setUsuario(u)

      if (t) localStorage.setItem('mm_token', t)
      else localStorage.removeItem('mm_token')

      if (u) localStorage.setItem('mm_usuario', JSON.stringify(u))
      else localStorage.removeItem('mm_usuario')
    }

    // Se vier só { user }, mantém compatível com quem consome o retorno
    return data?.user ? { user: data.user } : data
  }

  function sair() {
    setToken('')
    setUsuario(null)
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_usuario')
    delete api.instancia.defaults.headers.common['Authorization']
  }

  const permissoes = useMemo(() => {
    if (!usuario) return []
    const raw = usuario.permissions ?? usuario.permissoes
    if (Array.isArray(raw) && raw.length) return raw
    if (typeof raw === 'string' && raw.trim()) {
      return raw.split(',').map((p) => p.trim()).filter(Boolean)
    }
    return ['dashboard:read', 'transactions:write', 'reports:read']
  }, [usuario])

  const value = useMemo(() => ({ usuario, token, permissoes, entrar, registrar, sair }), [usuario, token, permissoes])

  return <AuthContexto.Provider value={value}>{children}</AuthContexto.Provider>
}

// Hook de acesso
export function useAuth() {
  return useContext(AuthContexto)
}

// Default export mantido
export default AuthContexto

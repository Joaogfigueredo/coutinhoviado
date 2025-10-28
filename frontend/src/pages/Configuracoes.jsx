// frontend/src/pages/Configuracoes.jsx
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { formatarMoedaBRL, formatarDataISOParaBR } from '../utils/formatadores.js'
import api from '../services/api'
import {
  Settings,
  User,
  Shield,
  Palette,
  Globe,
  Lock,
  Download,
  Moon,
  Sun,
  Database,
  CheckCircle,
  Camera,
  Wallet,
  ArrowLeftRight,
  Tag,
  Star,
  StarOff,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Eraser
} from 'lucide-react'

const SECTIONS = [
  { id: 'Perfil', label: 'Perfil', icon: User },
  { id: 'Segurança', label: 'Segurança', icon: Shield },
  { id: 'Preferências', label: 'Preferências', icon: Palette },
  { id: 'Dados', label: 'Dados', icon: Database },
  { id: 'Contas', label: 'Contas', icon: Wallet },
  { id: 'Categorias', label: 'Categorias', icon: Tag }
]

// Componente para Switch customizado
function CustomSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 dark:bg-zinc-800/50 dark:border-white/10">
      <div className="flex-1">
        <div className="font-medium text-zinc-800 dark:text-zinc-200">{label}</div>
        {description && <div className="text-sm text-zinc-500 dark:text-zinc-400">{description}</div>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
          checked ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-zinc-300 dark:bg-zinc-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

// Componente para Toast de feedback
function Toast({ message, onClose }) {
  if (!message) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white shadow-lg backdrop-blur-sm">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
          ×
        </button>
      </div>
    </div>
  )
}

export default function Configuracoes() {
  const { usuario } = useAuth() // ← sem token (não há mais sincronizar)
  const [tab, setTab] = useState('Perfil')
  const [toast, setToastMessage] = useState('')
  const setToast = useCallback((msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }, [])

  // --------- PERFIL ----------
  const [formPerfil, setFormPerfil] = useState({ name: '', email: '', avatarUrl: '' })
  const [perfilEditando, setPerfilEditando] = useState(false)
  const [perfilSalvando, setPerfilSalvando] = useState(false)
  const fileInputRef = useRef(null)
  
  useEffect(() => {
    setFormPerfil({
      name: usuario?.name ?? '',
      email: usuario?.email ?? '',
      avatarUrl: usuario?.avatarUrl ?? '',
    })
  }, [usuario])

  const handleImageChange = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setToast('Por favor, selecione uma imagem.')
      return
    }
    
    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast('A imagem deve ter menos de 5MB.')
      return
    }
    
    // Converter para base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result
      if (typeof base64 === 'string') {
        setFormPerfil(p => ({ ...p, avatarUrl: base64 }))
      }
    }
    reader.readAsDataURL(file)
  }, [setToast])

  const handleSalvarPerfil = useCallback(async () => {
    if (!formPerfil.name.trim()) return setToast('Nome não pode estar vazio.')
    if (!formPerfil.email.trim()) return setToast('Email não pode estar vazio.')
    
    setPerfilSalvando(true)
    try {
      // Aqui você precisaria de um endpoint para salvar o perfil
      // Por enquanto, vamos simular salvando no localStorage
      const usuarioAtualizado = {
        ...usuario,
        name: formPerfil.name,
        email: formPerfil.email,
        avatarUrl: formPerfil.avatarUrl,
      }
      localStorage.setItem('mm_usuario', JSON.stringify(usuarioAtualizado))
      setToast('Perfil atualizado com sucesso.')
      setPerfilEditando(false)
    } catch (error) {
      console.error('save perfil error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível salvar o perfil.'
      setToast(msg)
    } finally {
      setPerfilSalvando(false)
    }
  }, [formPerfil, usuario, setToast])

  const inicial = useMemo(
    () => (formPerfil.name?.trim()?.[0]?.toUpperCase() ?? 'U'),
    [formPerfil.name]
  )

  // --------- SEGURANÇA ----------
  const [pwd, setPwd] = useState({ atual: '', nova: '', confirma: '' })
  const [pwdLoading, setPwdLoading] = useState(false)

  async function salvarSenha(e) {
    e.preventDefault()
    if (!pwd.atual || !pwd.nova || !pwd.confirma) return setToast('Preencha todos os campos.')
    if (pwd.nova !== pwd.confirma) return setToast('A confirmação não confere.')
    if (pwd.nova.length < 8) return setToast('A nova senha deve ter ao menos 8 caracteres.')
    setPwdLoading(true)
    try {
      await api.auth.changePassword({
        oldPassword: pwd.atual,
        newPassword: pwd.nova,
      })
      setToast('Senha alterada com sucesso.')
      setPwd({ atual: '', nova: '', confirma: '' })
    } catch (error) {
      console.error('change password error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível alterar a senha.'
      setToast(msg)
    } finally {
      setPwdLoading(false)
    }
  }

  // --------- PREFERÊNCIAS ----------
  const { isDark, toggleTheme } = useTheme()
  const [settingsForm, setSettingsForm] = useState({
    currency: 'BRL',
    locale: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    notifyBudgetPct: 80,
    notifyDebtDays: 3,
  })
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      setSettingsLoading(true)
      const { data } = await api.settings.obter()
      if (data) {
        const pct = Number(data.notifyBudgetPct ?? 0.8) * 100
        const debt = Number(data.notifyDebtDays ?? 3)
        setSettingsForm({
          currency: data.currency ?? 'BRL',
          locale: data.locale ?? 'pt-BR',
          timezone: data.timezone ?? 'America/Sao_Paulo',
          notifyBudgetPct: Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 80,
          notifyDebtDays: Number.isFinite(debt) ? Math.max(0, Math.min(60, debt)) : 3,
        })
      }
      setSettingsLoaded(true)
    } catch (error) {
      console.error('load settings error', error)
      setToast('Não foi possível carregar preferências')
    } finally {
      setSettingsLoading(false)
    }
  }, [setToast])

  useEffect(() => {
    if (tab === 'Preferências' && !settingsLoaded && !settingsLoading) {
      loadSettings()
    }
  }, [tab, settingsLoaded, settingsLoading, loadSettings])

  const handleSettingsChange = useCallback((field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSettingsSave = useCallback(async (event) => {
    event.preventDefault()
    setSettingsSaving(true)
    try {
      const pct = Math.max(0, Math.min(100, Number(settingsForm.notifyBudgetPct) || 0))
      const debtDays = Math.max(0, Math.min(60, Number(settingsForm.notifyDebtDays) || 0))
      await api.settings.salvar({
        currency: settingsForm.currency,
        locale: settingsForm.locale,
        timezone: settingsForm.timezone,
        notifyBudgetPct: pct / 100,
        notifyDebtDays: debtDays,
      })
      setSettingsForm((prev) => ({
        ...prev,
        notifyBudgetPct: pct,
        notifyDebtDays: debtDays,
      }))
      setToast('Preferências salvas com sucesso.')
    } catch (error) {
      console.error('save settings error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível salvar as preferências.'
      setToast(msg)
    } finally {
      setSettingsSaving(false)
    }
  }, [settingsForm, setToast])

  // --------- DADOS ----------
  function baixarDados() {
    const data = {
      usuario: usuario ?? null,
      preferencias: {
        temaEscuro: isDark,
      },
      geradoEm: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meus-dados-moneymapp.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // --------- CONTAS ----------
  const [accounts, setAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [accountForm, setAccountForm] = useState({ id: null, name: '', color: '#6366f1', isDefault: false, initialBalance: '' })
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountActionId, setAccountActionId] = useState(null)
  const [migrationForm, setMigrationForm] = useState({ fromAccountId: '', toAccountId: '' })
  const [migrationLoading, setMigrationLoading] = useState(false)

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', color: '#6366f1', colorEnabled: false })
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryActionId, setCategoryActionId] = useState(null)

  const resetAccountForm = useCallback(() => {
    setAccountForm({ id: null, name: '', color: '#6366f1', isDefault: false, initialBalance: '' })
  }, [])

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({ id: null, name: '', color: '#6366f1', colorEnabled: false })
  }, [])

  const fetchAccounts = useCallback(async () => {
    try {
      setAccountsLoading(true)
      const params = showArchived ? { includeArchived: true } : {}
  const { data } = await api.accounts.list(params)
  setAccounts(data?.accounts ?? [])
    } catch (error) {
      console.error('fetch accounts error', error)
      setToast('Falha ao carregar contas.')
    } finally {
      setAccountsLoading(false)
    }
  }, [showArchived])

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const { data } = await api.categories.list()
      setCategories(data?.categories ?? [])
    } catch (error) {
      console.error('fetch categories error', error)
      setToast('Falha ao carregar categorias.')
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  const activeAccounts = useMemo(() => accounts.filter((account) => !account.archivedAt), [accounts])
  const migrationAccountOptions = useMemo(
    () => activeAccounts.map((account) => ({ id: String(account.id), nome: account.name })),
    [activeAccounts]
  )
  const migrationAvailable = migrationAccountOptions.length >= 2

  useEffect(() => {
    if (tab === 'Contas') {
      fetchAccounts()
    }
  }, [tab, showArchived, fetchAccounts])

  useEffect(() => {
    if (tab === 'Categorias') {
      fetchCategories()
    }
  }, [tab, fetchCategories])

  useEffect(() => {
    setMigrationForm((prev) => {
      const activeIds = activeAccounts.map((account) => String(account.id))
      if (!activeIds.length) {
        return prev.fromAccountId === '' && prev.toAccountId === '' ? prev : { fromAccountId: '', toAccountId: '' }
      }

      let nextFrom = prev.fromAccountId
      let nextTo = prev.toAccountId

      if (!activeIds.includes(nextFrom)) {
        nextFrom = activeIds[0] ?? ''
      }

      const remaining = activeIds.filter((id) => id !== nextFrom)
      if (!remaining.includes(nextTo)) {
        nextTo = remaining[0] ?? ''
      }

      if (nextFrom === prev.fromAccountId && nextTo === prev.toAccountId) {
        return prev
      }

      return { fromAccountId: nextFrom, toAccountId: nextTo }
    })
  }, [activeAccounts])

  const normalizeInitialBalance = useCallback((value) => {
    const raw = `${value ?? ''}`.trim()
    if (!raw) return { value: null }
    const usesComma = raw.includes(',')
    const usesDot = raw.includes('.')
    let normalized = raw
    if (usesComma && usesDot) {
      normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else if (usesComma) {
      normalized = normalized.replace(',', '.')
    }
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) {
      return { error: true }
    }
    return { value: parsed }
  }, [])

  const handleAccountSubmit = useCallback(async (event) => {
    event.preventDefault()
    const name = accountForm.name.trim()
    if (!name) {
      setToast('Informe um nome para a conta.')
      return
    }

    const payload = { name, color: accountForm.color, isDefault: accountForm.isDefault }
    const { value: balanceValue, error: balanceError } = normalizeInitialBalance(accountForm.initialBalance)
    if (balanceError) {
      setToast('Informe um saldo inicial válido.')
      return
    }
    if (accountForm.id) {
      payload.initialBalance = balanceValue ?? 0
    } else if (balanceValue !== null) {
      payload.initialBalance = balanceValue
    }
    setAccountSaving(true)

    try {
      if (accountForm.id) {
        await api.accounts.update(accountForm.id, payload)
        setToast('Conta atualizada com sucesso.')
      } else {
        await api.accounts.create(payload)
        setToast('Conta criada com sucesso.')
      }
      await fetchAccounts()
      resetAccountForm()
    } catch (error) {
      console.error('account submit error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível salvar a conta.'
      setToast(msg)
    } finally {
      setAccountSaving(false)
    }
  }, [accountForm, fetchAccounts, normalizeInitialBalance, resetAccountForm])

  const startEditAccount = useCallback((account) => {
    const balanceNumber = Number(account.initialBalance)
    const formattedBalance = Number.isFinite(balanceNumber)
      ? balanceNumber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ''

    setAccountForm({
      id: account.id,
      name: account.name,
      color: account.color || '#6366f1',
      isDefault: !!account.isDefault,
      initialBalance: formattedBalance,
    })
  }, [])

  const handleDeleteAccount = useCallback(async (account) => {
    if (!window.confirm(`Excluir conta "${account.name}"?`)) return

    try {
      setAccountActionId(account.id)
      await api.accounts.remove(account.id)
      setToast('Conta removida.')
  await fetchAccounts()
      if (accountForm.id === account.id) resetAccountForm()
    } catch (error) {
      console.error('delete account error', error)
      setToast('Falha ao remover conta.')
    } finally {
      setAccountActionId(null)
    }
  }, [accountForm.id, fetchAccounts, resetAccountForm])

  const handleSetDefaultAccount = useCallback(async (account) => {
    try {
      setAccountActionId(account.id)
      await api.accounts.update(account.id, { isDefault: true })
      setToast(`"${account.name}" definida como padrão.`)
  await fetchAccounts()
      if (accountForm.id === account.id) {
        setAccountForm(prev => ({ ...prev, isDefault: true }))
      } else {
        resetAccountForm()
      }
    } catch (error) {
      console.error('default account error', error)
      setToast('Não foi possível definir a conta como padrão.')
    } finally {
      setAccountActionId(null)
    }
  }, [accountForm.id, fetchAccounts, resetAccountForm])

  const handleUnsetDefaultAccount = useCallback(async (account) => {
    try {
      setAccountActionId(account.id)
      await api.accounts.update(account.id, { isDefault: false })
      setToast(`"${account.name}" não é mais a conta padrão.`)
  await fetchAccounts()
      if (accountForm.id === account.id) {
        setAccountForm(prev => ({ ...prev, isDefault: false }))
      }
    } catch (error) {
      console.error('unset default account error', error)
      setToast('Não foi possível remover o padrão da conta.')
    } finally {
      setAccountActionId(null)
    }
  }, [accountForm.id, fetchAccounts])

  const handleArchiveAccount = useCallback(async (account) => {
    if (!window.confirm(`Arquivar conta "${account.name}"?`)) return

    try {
      setAccountActionId(account.id)
      await api.accounts.update(account.id, { isArchived: true })
      setToast(`"${account.name}" foi arquivada.`)
      await fetchAccounts()
      if (accountForm.id === account.id) {
        setAccountForm(prev => ({ ...prev, isDefault: false }))
      }
    } catch (error) {
      console.error('archive account error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível arquivar a conta.'
      setToast(msg)
    } finally {
      setAccountActionId(null)
    }
  }, [accountForm.id, fetchAccounts])

  const handleRestoreAccount = useCallback(async (account) => {
    try {
      setAccountActionId(account.id)
      await api.accounts.update(account.id, { isArchived: false })
      setToast(`"${account.name}" foi restaurada.`)
      await fetchAccounts()
      if (accountForm.id === account.id) {
        setAccountForm(prev => ({ ...prev, isDefault: account.isDefault ?? false }))
      }
    } catch (error) {
      console.error('restore account error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível restaurar a conta.'
      setToast(msg)
    } finally {
      setAccountActionId(null)
    }
  }, [accountForm.id, fetchAccounts])

  const handleMigrationChange = useCallback((event) => {
    const { name, value } = event.target
    setMigrationForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSwapMigrationAccounts = useCallback(() => {
    setMigrationForm((prev) => ({ fromAccountId: prev.toAccountId || '', toAccountId: prev.fromAccountId || '' }))
  }, [])

  const handleMigrationSubmit = useCallback(async (event) => {
    event.preventDefault()

    const fromAccountId = migrationForm.fromAccountId
    const toAccountId = migrationForm.toAccountId

    if (!fromAccountId || !toAccountId) {
      setToast('Selecione as contas de origem e destino.')
      return
    }

    if (fromAccountId === toAccountId) {
      setToast('Escolha contas diferentes para migrar as transações.')
      return
    }

    const origem = activeAccounts.find((account) => String(account.id) === fromAccountId)
    const destino = activeAccounts.find((account) => String(account.id) === toAccountId)

    if (!origem || !destino) {
      setToast('Contas selecionadas inválidas ou arquivadas.')
      return
    }

    if (!window.confirm(`Migrar todas as transações de "${origem.name}" para "${destino.name}"?`)) {
      return
    }

    try {
      setMigrationLoading(true)
      await api.transacoes.migrar({ fromAccountId: Number(fromAccountId), toAccountId: Number(toAccountId) })
      setToast('Transações migradas com sucesso.')
    } catch (error) {
      console.error('transactions migrate error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível migrar as transações.'
      setToast(msg)
    } finally {
      setMigrationLoading(false)
    }
  }, [activeAccounts, migrationForm, setToast])

  const handleCategorySubmit = useCallback(async (event) => {
    event.preventDefault()
    const name = categoryForm.name.trim()
    if (!name) {
      setToast('Informe um nome para a categoria.')
      return
    }

    const colorEnabled = !!categoryForm.colorEnabled
    const colorValue = (categoryForm.color || '').trim()
    if (colorEnabled && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorValue)) {
      setToast('Escolha uma cor válida no seletor.')
      return
    }

    setCategorySaving(true)

    try {
      if (categoryForm.id) {
        const payload = { name }
        payload.color = colorEnabled ? colorValue : ''
        await api.categories.update(categoryForm.id, payload)
        setToast('Categoria atualizada com sucesso.')
      } else {
        const payload = { name }
        if (colorEnabled) {
          payload.color = colorValue
        }
        await api.categories.create(payload)
        setToast('Categoria criada com sucesso.')
      }

      await fetchCategories()
      resetCategoryForm()
    } catch (error) {
      console.error('category submit error', error)
      const msg = error?.response?.data?.error ?? 'Não foi possível salvar a categoria.'
      setToast(msg)
    } finally {
      setCategorySaving(false)
    }
  }, [categoryForm, fetchCategories, resetCategoryForm])

  const startEditCategory = useCallback((category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      color: category.color || '#6366f1',
      colorEnabled: Boolean(category.color),
    })
  }, [])

  const handleDeleteCategory = useCallback(async (category) => {
    if (!window.confirm(`Remover categoria "${category.name}"? As transações ficarão sem vínculo.`)) return

    try {
      setCategoryActionId(category.id)
      await api.categories.remove(category.id)
      setToast('Categoria removida.')
      await fetchCategories()
      if (categoryForm.id === category.id) {
        resetCategoryForm()
      }
    } catch (error) {
      console.error('delete category error', error)
      setToast('Não foi possível remover a categoria.')
    } finally {
      setCategoryActionId(null)
    }
  }, [categoryForm.id, fetchCategories, resetCategoryForm])

  const handleToggleCategoryColor = useCallback(() => {
    setCategoryForm((prev) => {
      if (prev.colorEnabled) {
        return { ...prev, colorEnabled: false }
      }
      return { ...prev, colorEnabled: true, color: prev.color || '#6366f1' }
    })
  }, [])

  const handleClearCategoryForm = useCallback(() => {
    resetCategoryForm()
  }, [resetCategoryForm])

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fundo full-bleed */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-indigo-200 to-blue-300 dark:from-zinc-950 dark:via-violet-950/20 dark:to-purple-950/30" />
        <div className="absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-violet-400/20 to-purple-500/20 blur-3xl" />
        <div
          className="absolute -bottom-32 -right-32 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-indigo-400/20 to-violet-500/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute left-1/4 top-1/3 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-purple-400/10 to-fuchsia-400/10 blur-2xl"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.9) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 w-full border-b border-zinc-200/60 bg-white/90 backdrop-blur-xl shadow-lg shadow-zinc-100/50 dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-zinc-900/50">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">⚙️ Configurações</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie suas preferências e informações pessoais</p>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      <Toast message={toast} onClose={() => setToast('')} />

      {/* Conteúdo */}
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de seções */}
          <aside className="lg:w-72">
            <nav className="rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-lg overflow-hidden dark:border-white/10 dark:bg-zinc-900/70">
              {SECTIONS.map((section, i) => {
                const Icon = section.icon
                const isActive = section.id === tab
                return (
                  <button
                    key={section.id}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-300 border-r-2 border-violet-500' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                    } ${i !== SECTIONS.length - 1 ? 'border-b border-zinc-200/60 dark:border-white/10' : ''}`}
                    onClick={() => setTab(section.id)}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-500'}`} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Conteúdo das seções */}
          <main className="flex-1">
            <div className="rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-lg p-6 dark:border-white/10 dark:bg-zinc-900/70">
              {tab === 'Perfil' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Informações do Perfil</h2>
                  </div>

                  {/* Avatar e info */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg transition-transform duration-300 hover:scale-105 overflow-hidden"
                      >
                        {formPerfil.avatarUrl ? (
                          <img 
                            src={formPerfil.avatarUrl} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          inicial
                        )}
                      </button>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border-2 border-violet-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Camera className="h-3 w-3 text-violet-600" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={!perfilEditando}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-zinc-800 dark:text-white">{formPerfil.name || 'Usuário'}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">{formPerfil.email}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">Membro desde 2024</p>
                    </div>
                  </div>

                  {/* Formulário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        value={formPerfil.name}
                        onChange={(e) => setFormPerfil(p => ({ ...p, name: e.target.value }))}
                        readOnly={!perfilEditando}
                        className={`w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                          perfilEditando 
                            ? 'cursor-text focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500' 
                            : 'cursor-not-allowed text-zinc-500 dark:text-zinc-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">E-mail</label>
                      <input
                        type="email"
                        value={formPerfil.email}
                        onChange={(e) => setFormPerfil(p => ({ ...p, email: e.target.value }))}
                        readOnly={!perfilEditando}
                        className={`w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                          perfilEditando 
                            ? 'cursor-text focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500' 
                            : 'cursor-not-allowed text-zinc-500 dark:text-zinc-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    {perfilEditando && (
                      <button
                        type="button"
                        onClick={() => {
                          setPerfilEditando(false)
                          setFormPerfil({
                            name: usuario?.name ?? '',
                            email: usuario?.email ?? '',
                            avatarUrl: usuario?.avatarUrl ?? '',
                          })
                        }}
                        className="bg-gray-400 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => perfilEditando ? handleSalvarPerfil() : setPerfilEditando(true)}
                      disabled={perfilSalvando}
                      className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {perfilSalvando ? 'Salvando…' : perfilEditando ? 'Salvar Alterações' : 'Editar Perfil'}
                    </button>
                  </div>
                </div>
              )}

              {tab === 'Segurança' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Segurança</h2>
                  </div>

                  <form onSubmit={salvarSenha} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Senha atual</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                          <input
                            type="password"
                            value={pwd.atual}
                            onChange={(e) => setPwd(p => ({ ...p, atual: e.target.value }))}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                            placeholder="Digite sua senha atual"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nova senha</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                          <input
                            type="password"
                            value={pwd.nova}
                            onChange={(e) => setPwd(p => ({ ...p, nova: e.target.value }))}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                            placeholder="Digite sua nova senha"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Confirmar nova senha</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                          <input
                            type="password"
                            value={pwd.confirma}
                            onChange={(e) => setPwd(p => ({ ...p, confirma: e.target.value }))}
                            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                            placeholder="Confirme sua nova senha"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={pwdLoading}
                        className="bg-gradient-to-r from-indigo-500 to-sky-400 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {pwdLoading ? 'Salvando…' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </form>
                  
                </div>
              )}

              {tab === 'Preferências' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Preferências</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tema */}
                    <div className="rounded-2xl border border-zinc-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-md hover:shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-zinc-800/50">
                      <div className="flex items-center gap-3 mb-4">
                        {isDark ? <Moon className="h-5 w-5 text-indigo-600" /> : <Sun className="h-5 w-5 text-amber-500" />}
                        <h3 className="font-semibold text-zinc-800 dark:text-white">🌙 Tema</h3>
                      </div>
                      <CustomSwitch
                        checked={isDark}
                        onChange={toggleTheme}
                        label="Modo escuro"
                        description="Ative para uma experiência visual mais suave"
                      />
                    </div>

                    {/* Idioma removido — manter preferências sem seleção de língua */}

                    <div className="rounded-2xl border border-zinc-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-md transition-all duration-300 dark:border-white/10 dark:bg-zinc-800/50 md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <Settings className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-semibold text-zinc-800 dark:text-white">⚙️ Preferências de conta</h3>
                      </div>
                      {settingsLoading && !settingsLoaded ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando preferências...</p>
                      ) : (
                        <form className="space-y-4" onSubmit={handleSettingsSave}>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Moeda padrão</label>
                              <select
                                value={settingsForm.currency}
                                onChange={(event) => handleSettingsChange('currency', event.target.value)}
                                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 p-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/50"
                                disabled={settingsSaving}
                              >
                                <option value="BRL">Real (BRL)</option>
                                <option value="USD">Dólar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Fuso horário</label>
                              <input
                                type="text"
                                value={settingsForm.timezone}
                                onChange={(event) => handleSettingsChange('timezone', event.target.value)}
                                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                                placeholder="Ex.: America/Sao_Paulo"
                                disabled={settingsSaving}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Alerta de orçamento (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={settingsForm.notifyBudgetPct}
                                onChange={(event) => handleSettingsChange('notifyBudgetPct', Number(event.target.value))}
                                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                                disabled={settingsSaving}
                              />
                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Porcentagem do orçamento mensal para enviar alerta.</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Dias antes do vencimento da dívida</label>
                              <input
                                type="number"
                                min="0"
                                max="60"
                                value={settingsForm.notifyDebtDays}
                                onChange={(event) => handleSettingsChange('notifyDebtDays', Number(event.target.value))}
                                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                                disabled={settingsSaving}
                              />
                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Quantidade de dias para antecipar alertas de dívidas.</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={settingsSaving}
                              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-medium shadow-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {settingsSaving ? 'Salvando…' : 'Salvar preferências'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {tab === 'Dados' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Seus Dados</h2>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-md hover:shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-semibold text-zinc-800 dark:text-white">📥 Download dos Dados</h3>
                    </div>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                      Faça o download de um arquivo JSON contendo todos os dados básicos do seu perfil salvos no aplicativo. 
                      Isso inclui suas preferências, configurações e informações pessoais.
                    </p>
                    
                    <button
                      onClick={baixarDados}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
                    >
                      <Download className="h-4 w-4" />
                      Baixar meus dados
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Privacidade:</strong> Seus dados são processados localmente e você tem controle total sobre eles.
                    </p>
                  </div>
                </div>
              )}

              {tab === 'Contas' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Wallet className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Contas bancárias</h2>
                  </div>

                  <form onSubmit={handleAccountSubmit} className="rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-sm p-6 shadow-md space-y-6 dark:border-white/10 dark:bg-zinc-800/60">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nome da conta</label>
                      <input
                        type="text"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex.: Conta corrente Nubank"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cor</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={accountForm.color}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, color: e.target.value }))}
                          className="h-12 w-16 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 cursor-pointer"
                        />
                        <span className="font-mono text-sm text-zinc-600 dark:text-zinc-300">{accountForm.color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Saldo inicial</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={accountForm.initialBalance}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, initialBalance: e.target.value }))}
                        placeholder="Ex.: 1.500,00"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
                      />
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Valor considerado como ponto de partida da conta.</p>
                    </div>

                    <CustomSwitch
                      checked={accountForm.isDefault}
                      onChange={() => setAccountForm(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                      label="Definir como conta padrão"
                      description="Essa conta será utilizada por padrão em novos lançamentos."
                    />

                    <div className="flex flex-wrap justify-end gap-3 pt-2">
                      {accountForm.id && (
                        <button
                          type="button"
                          onClick={resetAccountForm}
                          className="px-5 py-3 rounded-xl border border-zinc-300 text-zinc-600 hover:bg-zinc-100 transition-colors dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={accountSaving}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-medium shadow-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {accountSaving ? 'Salvando…' : accountForm.id ? 'Atualizar conta' : 'Criar conta'}
                      </button>
                    </div>
                  </form>

                  <div className="rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-md p-6 space-y-5 dark:border-white/10 dark:bg-zinc-800/60">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                        <ArrowLeftRight className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Migrar transações entre contas</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Realoque todos os lançamentos de uma conta ativa para outra sem perder o histórico, ideal para consolidar contas antes de arquivar.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleMigrationSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Conta de origem</label>
                          <select
                            name="fromAccountId"
                            value={migrationForm.fromAccountId}
                            onChange={handleMigrationChange}
                            disabled={!migrationAvailable || migrationLoading}
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                          >
                            <option value="">Selecione</option>
                            {migrationAccountOptions.map((option) => (
                              <option key={`from-${option.id}`} value={option.id}>{option.nome}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end justify-center">
                          <button
                            type="button"
                            onClick={handleSwapMigrationAccounts}
                            disabled={!migrationAvailable || migrationLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:-translate-y-0.5 hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-500/40 dark:bg-zinc-800 dark:text-indigo-300"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                            Inverter
                          </button>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Conta de destino</label>
                          <select
                            name="toAccountId"
                            value={migrationForm.toAccountId}
                            onChange={handleMigrationChange}
                            disabled={!migrationAvailable || migrationLoading}
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                          >
                            <option value="">Selecione</option>
                            {migrationAccountOptions.map((option) => (
                              <option key={`to-${option.id}`} value={option.id}>{option.nome}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        A migração considera apenas contas ativas. Caso a conta esteja arquivada, restaure-a temporariamente ou utilize a transferência direta.
                      </p>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!migrationAvailable || migrationLoading}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {migrationLoading ? 'Migrando…' : 'Migrar transações'}
                        </button>
                      </div>
                    </form>

                    {!migrationAvailable && (
                      <div className="rounded-xl border border-zinc-200/60 bg-zinc-100/60 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
                        Cadastre ao menos duas contas ativas para habilitar a migração.
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-md p-6 space-y-4 dark:border-white/10 dark:bg-zinc-800/60">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Minhas contas</h3>
                    <div className="flex flex-col gap-2 rounded-xl bg-white/60 p-3 text-sm text-zinc-500 shadow-sm dark:bg-zinc-900/50 dark:text-zinc-400 md:flex-row md:items-center md:justify-between">
                      <span>Gerencie contas ativas e arquive ou restaure quando necessário.</span>
                      <label className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={showArchived}
                          onChange={() => setShowArchived(prev => !prev)}
                          className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-800"
                        />
                        Mostrar contas arquivadas
                      </label>
                    </div>

                    {accountsLoading ? (
                      <div className="py-10 text-center text-zinc-500 dark:text-zinc-400">Carregando contas…</div>
                    ) : accounts.length === 0 ? (
                      <div className="py-10 text-center text-zinc-500 dark:text-zinc-400">
                        {showArchived ? 'Nenhuma conta arquivada encontrada.' : 'Nenhuma conta cadastrada ainda. Crie a primeira usando o formulário acima.'}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {accounts.map((account) => {
                          const acting = accountActionId === account.id
                          const arquivada = Boolean(account.archivedAt)
                          const arquivadaEm = arquivada ? formatarDataISOParaBR(account.archivedAt) : ''
                          return (
                            <div
                              key={account.id}
                              className={`flex flex-col gap-4 rounded-xl border p-4 shadow-sm md:flex-row md:items-center md:justify-between ${
                                arquivada
                                  ? 'border-rose-200/70 bg-rose-50/70 dark:border-rose-500/40 dark:bg-rose-950/20'
                                  : 'border-zinc-200/60 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/70'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="h-10 w-10 rounded-full border border-white shadow-inner"
                                  style={{ backgroundColor: account.color || '#6366f1' }}
                                />
                                <div>
                                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">{account.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                    <span className="font-mono">{account.color}</span>
                                    {account.isDefault && !arquivada && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                                        <Star className="h-3 w-3 fill-current" />
                                        Padrão
                                      </span>
                                    )}
                                    {arquivada && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
                                        <Archive className="h-3 w-3" />
                                        Arquivada{arquivadaEm ? ` • ${arquivadaEm}` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Saldo inicial: {formatarMoedaBRL(account.initialBalance ?? 0)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 justify-end">
                                {!arquivada && !account.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAccount(account)}
                                    disabled={acting}
                                    className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 transition dark:border-violet-500/40 dark:text-violet-300 dark:hover:bg-violet-500/10 disabled:opacity-50"
                                  >
                                    <Star className="h-4 w-4" />
                                    Padrão
                                  </button>
                                )}
                                {!arquivada && account.isDefault && (
                                  <button
                                    onClick={() => handleUnsetDefaultAccount(account)}
                                    disabled={acting}
                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 transition dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10 disabled:opacity-50"
                                  >
                                    <StarOff className="h-4 w-4" />
                                    Remover padrão
                                  </button>
                                )}
                                <button
                                  onClick={() => startEditAccount(account)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </button>
                                {!arquivada ? (
                                  <>
                                    <button
                                      onClick={() => handleArchiveAccount(account)}
                                      disabled={acting}
                                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10 disabled:opacity-50"
                                    >
                                      <Archive className="h-4 w-4" />
                                      Arquivar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAccount(account)}
                                      disabled={acting}
                                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10 disabled:opacity-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Excluir
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleRestoreAccount(account)}
                                    disabled={acting}
                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10 disabled:opacity-50"
                                  >
                                    <ArchiveRestore className="h-4 w-4" />
                                    Restaurar
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === 'Categorias' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Tag className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Categorias de transação</h2>
                  </div>

                  <form onSubmit={handleCategorySubmit} className="rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-sm p-6 shadow-md space-y-6 dark:border-white/10 dark:bg-zinc-800/60">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nome da categoria</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex.: Alimentação"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-2 rounded-xl bg-white/60 p-4 shadow-sm dark:bg-zinc-900/40">
                        <label className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          <span>Cor personalizada</span>
                          <button
                            type="button"
                            onClick={handleToggleCategoryColor}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
                              categoryForm.colorEnabled ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-zinc-300 dark:bg-zinc-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                                categoryForm.colorEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>

                        {categoryForm.colorEnabled ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type="color"
                              value={categoryForm.color}
                              onChange={(e) => setCategoryForm((prev) => ({ ...prev, color: e.target.value }))}
                              className="h-12 w-16 rounded-xl border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800 cursor-pointer"
                            />
                            <span className="font-mono text-sm text-zinc-600 dark:text-zinc-300">{categoryForm.color}</span>
                            <button
                              type="button"
                              onClick={() => setCategoryForm((prev) => ({ ...prev, colorEnabled: false }))}
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 transition dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10"
                            >
                              <Eraser className="h-4 w-4" />
                              Remover cor
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Categorias sem cor usam o visual padrão nos relatórios.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 pt-2">
                      {categoryForm.id && (
                        <button
                          type="button"
                          onClick={handleClearCategoryForm}
                          className="px-5 py-3 rounded-xl border border-zinc-300 text-zinc-600 hover:bg-zinc-100 transition-colors dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={categorySaving}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-medium shadow-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {categorySaving ? 'Salvando…' : categoryForm.id ? 'Atualizar categoria' : 'Criar categoria'}
                      </button>
                    </div>
                  </form>

                  <div className="rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-md p-6 space-y-4 dark:border-white/10 dark:bg-zinc-800/60">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Minhas categorias</h3>

                    {categoriesLoading ? (
                      <div className="py-10 text-center text-zinc-500 dark:text-zinc-400">Carregando categorias…</div>
                    ) : categories.length === 0 ? (
                      <div className="py-10 text-center text-zinc-500 dark:text-zinc-400">
                        Nenhuma categoria cadastrada ainda. Crie suas categorias para organizar os lançamentos.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categories.map((category) => {
                          const acting = categoryActionId === category.id
                          return (
                            <div
                              key={category.id}
                              className="flex flex-col gap-4 rounded-xl border border-zinc-200/60 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-zinc-700 dark:bg-zinc-900/70"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white shadow-inner" style={{ backgroundColor: category.color || '#e5e7eb' }}>
                                  <Tag className={`h-5 w-5 ${category.color ? 'text-white' : 'text-zinc-500'}`} />
                                </div>
                                <div>
                                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">{category.name}</p>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                    {category.color ? (
                                      <span className="font-mono">{category.color}</span>
                                    ) : (
                                      <span className="italic text-xs text-zinc-400 dark:text-zinc-500">Sem cor definida</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 justify-end">
                                <button
                                  onClick={() => startEditCategory(category)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category)}
                                  disabled={acting}
                                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10 disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Frase Motivacional */}
        <div className="text-center italic text-zinc-500 dark:text-zinc-400 mt-10">
          💡 "Personalize sua experiência no MoneyMapp do seu jeito."
        </div>

        {/* Rodapé */}
        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
          © {new Date().getFullYear()} MoneyMapp. Todos os direitos reservados.
        </div>
      </div>

      <Toast message={toast} onClose={() => setToastMessage('')} />
    </div>
  )
}

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Anchor, LogOut, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PENDING_LOGOUT_BANNER_KEY, useAuth } from '../contexts/AuthContext'

type AuthTab = 'signin' | 'signup'

function readLogoutBannerFlag(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(PENDING_LOGOUT_BANNER_KEY) === '1'
}

function clearLogoutBannerFlag() {
  sessionStorage.removeItem(PENDING_LOGOUT_BANNER_KEY)
}

export function LoginPage() {
  const { user, mode, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<AuthTab>('signin')
  const [sessionEndedBanner, setSessionEndedBanner] = useState(readLogoutBannerFlag)

  useEffect(() => {
    const reason = searchParams.get('motivo')
    if (reason === 'sessao') {
      sessionStorage.setItem(PENDING_LOGOUT_BANNER_KEY, '1')
      setSessionEndedBanner(true)
      const next = new URLSearchParams(searchParams)
      next.delete('motivo')
      setSearchParams(next, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- só ao montar; limpa a URL uma vez

  if (mode === 'local') {
    return <Navigate to="/" replace />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      clearLogoutBannerFlag()
      toast.success('Bem-vindo de volta')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao entrar')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password)
      clearLogoutBannerFlag()
      toast.success('Conta criada')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden surface-page px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_50%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-md"
      >
        {sessionEndedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary-ink dark:border-primary/30 dark:bg-primary/15"
            role="status"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <LogOut className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-medium">Sessão encerrada</p>
              <p className="mt-0.5 text-secondary-ink">
                Entre de novo com seu e-mail e senha para continuar de onde parou.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearLogoutBannerFlag()
                setSessionEndedBanner(false)
              }}
              className="shrink-0 rounded-lg p-1 text-secondary-ink transition-colors hover:bg-black/5 hover:text-primary-ink dark:hover:bg-white/10"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        <div className="rounded-2xl border border-subtle surface-card p-8 shadow-elevated">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Anchor className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-primary-ink">Âncora</h1>
              <p className="text-sm text-secondary-ink">Acesse sua conta para sincronizar os espaços</p>
            </div>
          </div>

          <div className="mb-6 flex rounded-xl bg-slate-100/90 p-1 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setTab('signin')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                tab === 'signin'
                  ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-secondary-ink hover:text-primary-ink'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                tab === 'signup'
                  ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-secondary-ink hover:text-primary-ink'
              }`}
            >
              Criar conta
            </button>
          </div>

          {tab === 'signin' ? (
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleRegister}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Senha (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <p className="text-xs text-secondary-ink">
                Ao criar uma conta, você poderá usar os mesmos dados para entrar neste ou em outro
                dispositivo.
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando…' : 'Criar conta e entrar'}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-secondary-ink">
          Problemas para acessar? Verifique o e-mail e a senha ou crie uma conta nova na aba acima.
        </p>
      </motion.div>
    </div>
  )
}

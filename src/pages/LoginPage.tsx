import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Anchor } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => import.meta.env.VITE_USUARIO ?? '')
  const [password, setPassword] = useState(() => import.meta.env.VITE_SENHA ?? '')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('Bem-vindo de volta')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao entrar')
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
        <div className="rounded-2xl border border-subtle surface-card p-8 shadow-elevated">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Anchor className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-primary-ink">Âncora</h1>
              <p className="text-sm text-secondary-ink">Entre para acessar seus dados</p>
            </div>
          </div>
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
        </div>

        {import.meta.env.DEV && (import.meta.env.VITE_USUARIO || import.meta.env.VITE_SENHA) ? (
          <p className="mt-6 text-center text-xs text-secondary-ink">
            Credenciais de desenvolvimento carregadas de <code className="text-secondary-ink">.env</code> (
            <code className="text-secondary-ink">VITE_USUARIO</code> / <code className="text-secondary-ink">VITE_SENHA</code>).
          </p>
        ) : null}
      </motion.div>
    </div>
  )
}

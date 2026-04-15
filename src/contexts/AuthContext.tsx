import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiLogin, apiLogout, apiMe, apiRegister } from '../services/api/authApi'
import { isBackendConfigured } from '../services/api/backend'
import { clearAccessToken, getAccessToken, setAccessToken } from '../services/api/token'
import type { ApiAuthUser } from '../services/api/types'

const ADMIN_EMAIL = 'admancora@ancora.com'
const ADMIN_PASSWORD = 'flowup'
const ADMIN_UID = 'ancora_admin'
const SESSION_AUTH_KEY = 'ancora-authenticated'

export type AuthUser = {
  uid: string
  email: string | null
  isAnonymous: boolean
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  mode: 'local' | 'remote'
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapApiUser(u: ApiAuthUser): AuthUser {
  return { uid: u.id, email: u.email, isAnonymous: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isRemote = isBackendConfigured()
  const mode: 'local' | 'remote' = isRemote ? 'remote' : 'local'
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isRemote) {
      let cancelled = false
      setLoading(true)
      void (async () => {
        const token = getAccessToken()
        if (!token) {
          if (!cancelled) {
            setUser(null)
            setLoading(false)
          }
          return
        }
        try {
          const { user: u } = await apiMe()
          if (!cancelled) setUser(mapApiUser(u))
        } catch {
          clearAccessToken()
          if (!cancelled) setUser(null)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => {
        cancelled = true
      }
    }

    const isAuthenticated = sessionStorage.getItem(SESSION_AUTH_KEY) === '1'
    if (!isAuthenticated) {
      setUser(null)
      setLoading(false)
      return
    }
    setUser({ uid: ADMIN_UID, email: ADMIN_EMAIL, isAnonymous: false })
    setLoading(false)
  }, [isRemote])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isRemote) {
        const { token, user: u } = await apiLogin(email, password)
        setAccessToken(token)
        setUser(mapApiUser(u))
        return
      }
      if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error('Credenciais inválidas')
      }
      sessionStorage.setItem(SESSION_AUTH_KEY, '1')
      setUser({ uid: ADMIN_UID, email: ADMIN_EMAIL, isAnonymous: false })
    },
    [isRemote],
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (isRemote) {
        const { token, user: u } = await apiRegister(email, password)
        setAccessToken(token)
        setUser(mapApiUser(u))
        return
      }
      throw new Error('Cadastro desativado. Use as credenciais de administrador.')
    },
    [isRemote],
  )

  const logout = useCallback(async () => {
    if (isRemote) {
      try {
        await apiLogout()
      } catch {
        /* sessão já inválida ou rede */
      }
      clearAccessToken()
      setUser(null)
      window.location.assign('/login')
      return
    }
    sessionStorage.removeItem(SESSION_AUTH_KEY)
    setUser(null)
    window.location.assign('/login')
  }, [isRemote])

  const value = useMemo(
    () => ({ user, loading, mode, signIn, signUp, logout }),
    [user, loading, mode, signIn, signUp, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

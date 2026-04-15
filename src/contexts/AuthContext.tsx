import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

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
  mode: 'local'
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const mode: 'local' = 'local'

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem(SESSION_AUTH_KEY) === '1'
    if (!isAuthenticated) {
      setUser(null)
      setLoading(false)
      return
    }
    setUser({ uid: ADMIN_UID, email: ADMIN_EMAIL, isAnonymous: false })
    setLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Credenciais inválidas')
    }
    sessionStorage.setItem(SESSION_AUTH_KEY, '1')
    setUser({ uid: ADMIN_UID, email: ADMIN_EMAIL, isAnonymous: false })
  }, [])

  const signUp = useCallback(async (_email: string, _password: string) => {
    throw new Error('Cadastro desativado. Use as credenciais de administrador.')
  }, [])

  const logout = useCallback(async () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY)
    setUser(null)
    window.location.assign('/login')
  }, [])

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

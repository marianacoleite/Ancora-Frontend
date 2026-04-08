import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase/config'
import { clearLocalData } from '../services/local/storage'

const LOCAL_UID_KEY = 'lampiao-local-uid'

/** Definido antes do signOut para a tela de login mostrar o aviso de sessão encerrada. */
export const PENDING_LOGOUT_BANNER_KEY = 'lampiao-pending-logout-banner'

function getOrCreateLocalUid(): string {
  let id = localStorage.getItem(LOCAL_UID_KEY)
  if (!id) {
    id = `local_${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem(LOCAL_UID_KEY, id)
  }
  return id
}

export type AuthUser = {
  uid: string
  email: string | null
  isAnonymous: boolean
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  mode: 'firebase' | 'local'
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const mode: 'firebase' | 'local' = isFirebaseConfigured() ? 'firebase' : 'local'

  useEffect(() => {
    if (mode === 'local') {
      const uid = getOrCreateLocalUid()
      setUser({ uid, email: 'demo@lampiao.local', isAnonymous: true })
      setLoading(false)
      return
    }

    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      if (!u) {
        setUser(null)
      } else {
        setUser({ uid: u.uid, email: u.email, isAnonymous: u.isAnonymous })
      }
      setLoading(false)
    })
    return () => unsub()
  }, [mode])

  const signIn = useCallback(async (email: string, password: string) => {
    if (mode !== 'firebase') return
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  }, [mode])

  const signUp = useCallback(async (email: string, password: string) => {
    if (mode !== 'firebase') return
    await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
  }, [mode])

  const logout = useCallback(async () => {
    if (mode === 'firebase') {
      sessionStorage.setItem(PENDING_LOGOUT_BANNER_KEY, '1')
      await signOut(getFirebaseAuth())
      return
    }
    localStorage.removeItem(LOCAL_UID_KEY)
    clearLocalData()
    window.location.assign('/')
  }, [mode])

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

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getBackendBaseUrl, getBackendHealth, isBackendConfigured } from '../services/api/backend'

export type BackendStatus = 'idle' | 'checking' | 'ok' | 'error'

type BackendContextValue = {
  configured: boolean
  baseUrl: string | null
  status: BackendStatus
  errorMessage: string | null
  refetch: () => void
}

const BackendContext = createContext<BackendContextValue | null>(null)

export function BackendProvider({ children }: { children: ReactNode }) {
  const configured = isBackendConfigured()
  const [status, setStatus] = useState<BackendStatus>(() => (configured ? 'checking' : 'idle'))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const baseUrl = getBackendBaseUrl()

  const refetch = useCallback(() => {
    if (!configured) {
      setStatus('idle')
      setErrorMessage(null)
      return
    }
    setStatus('checking')
    setErrorMessage(null)
    void getBackendHealth()
      .then(() => {
        setStatus('ok')
      })
      .catch((e: unknown) => {
        setStatus('error')
        setErrorMessage(e instanceof Error ? e.message : String(e))
      })
  }, [configured])

  useEffect(() => {
    refetch()
  }, [refetch])

  const value = useMemo(
    (): BackendContextValue => ({
      configured,
      baseUrl,
      status,
      errorMessage,
      refetch,
    }),
    [configured, baseUrl, status, errorMessage, refetch],
  )

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
}

export function useBackend(): BackendContextValue {
  const ctx = useContext(BackendContext)
  if (!ctx) throw new Error('useBackend must be used within BackendProvider')
  return ctx
}

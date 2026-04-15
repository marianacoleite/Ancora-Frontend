import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './contexts/AppDataContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BackendProvider } from './contexts/BackendContext'
import { AppShell } from './components/layout/AppShell'
import { ThemeBootstrap } from './components/layout/ThemeProvider'
import { HomeRedirect } from './pages/HomeRedirect'
import { LoginPage } from './pages/LoginPage'
import { SubspacePage } from './pages/SubspacePage'
import { WorkspaceRedirect } from './pages/WorkspaceRedirect'
import { Skeleton } from './components/ui/Skeleton'

function AppGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center surface-page">
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <ThemeBootstrap>
      <BackendProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <AppGate>
                  <AppDataProvider>
                    <AppShell />
                  </AppDataProvider>
                </AppGate>
              }
            >
              <Route index element={<HomeRedirect />} />
              <Route path="w/:workspaceId" element={<WorkspaceRedirect />} />
              <Route path="w/:workspaceId/s/:subspaceId" element={<SubspacePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BackendProvider>
    </ThemeBootstrap>
  )
}

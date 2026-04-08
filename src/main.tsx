import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              'surface-card! border border-subtle! shadow-elevated! text-primary-ink!',
            description: 'text-secondary-ink!',
          },
        }}
        richColors
        closeButton
      />
    </BrowserRouter>
  </StrictMode>,
)

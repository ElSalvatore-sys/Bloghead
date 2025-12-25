import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Defer Sentry initialization to avoid blocking initial render
if (import.meta.env.PROD) {
  // Load Sentry after page is interactive (non-blocking)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('./lib/sentry').then(({ initSentry }) => {
        initSentry()
      })
    }, { timeout: 3000 })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      import('./lib/sentry').then(({ initSentry }) => {
        initSentry()
      })
    }, 1000)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

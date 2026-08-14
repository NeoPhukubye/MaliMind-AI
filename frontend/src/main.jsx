import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { NoAuthProvider } from './context/AuthContext'
import App from './App'
import './i18n'
import './styles/index.css'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const ClerkApp = lazy(() => import('./ClerkApp'))

function Root() {
  if (!clerkKey) {
    return (
      <BrowserRouter basename="/MaliMind-AI">
        <NoAuthProvider>
          <App />
        </NoAuthProvider>
      </BrowserRouter>
    )
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ClerkApp />
    </Suspense>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

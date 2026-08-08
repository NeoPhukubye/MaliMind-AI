import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AuthProvider, NoAuthProvider } from './context/AuthContext'
import App from './App'
import './styles/index.css'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

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
    <ClerkProvider publishableKey={clerkKey}>
      <BrowserRouter basename="/MaliMind-AI">
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

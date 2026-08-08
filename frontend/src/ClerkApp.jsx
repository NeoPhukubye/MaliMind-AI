import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ClerkAuthProvider } from './context/ClerkAuthProvider'
import App from './App'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export default function ClerkApp() {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <BrowserRouter basename="/MaliMind-AI">
        <ClerkAuthProvider>
          <App />
        </ClerkAuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  )
}

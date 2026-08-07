import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, PiggyBank, MessageSquare, User, Crown } from 'lucide-react'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/budget', icon: Wallet, label: 'Budget' },
  { to: '/app/savings', icon: PiggyBank, label: 'Savings' },
  { to: '/app/coach', icon: MessageSquare, label: 'AI Coach' },
  { to: '/app/premium', icon: Crown, label: 'Premium' },
  { to: '/app/profile', icon: User, label: 'Profile' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary-700">MaliMind AI</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center px-6 md:hidden">
          <h1 className="text-lg font-bold text-primary-700">MaliMind AI</h1>
        </header>
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 text-xs ${isActive ? 'text-primary-600' : 'text-gray-400'}`
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

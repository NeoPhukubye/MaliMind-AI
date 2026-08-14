import { Outlet, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Wallet, PiggyBank, MessageSquare, User, Crown } from 'lucide-react'
import LanguageSelector from './LanguageSelector'

export default function Layout() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/app', icon: LayoutDashboard, label: t('nav.dashboard'), end: true },
    { to: '/app/budget', icon: Wallet, label: t('nav.budget') },
    { to: '/app/savings', icon: PiggyBank, label: t('nav.savings') },
    { to: '/app/coach', icon: MessageSquare, label: t('nav.aiCoach') },
    { to: '/app/premium', icon: Crown, label: t('nav.premium') },
    { to: '/app/profile', icon: User, label: t('nav.profile') },
  ]

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
        <div className="p-4 border-t">
          <LanguageSelector />
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6">
          <h1 className="text-lg font-bold text-primary-700 md:hidden">MaliMind AI</h1>
          <div className="hidden md:block" />
          <LanguageSelector />
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

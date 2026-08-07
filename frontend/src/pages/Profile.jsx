import { useAuth } from '../context/AuthContext'
import { User, LogOut, Mail, Calendar } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name || 'User'}</h2>
            <p className="text-gray-500 text-sm">{user?.email || ''}</p>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{user?.email || 'No email'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Member since {user?.createdAt || 'N/A'}</span>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  )
}

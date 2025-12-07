import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  User,
  FileText,
  Calendar,
  Users,
  MessageCircle,
  Coins,
  HelpCircle,
  LogOut,
  ClipboardList,
  Menu,
  X
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

const menuItems = [
  { icon: User, label: 'Mein Profil', path: '/dashboard/profile' },
  { icon: FileText, label: 'Meine Anfragen', path: '/dashboard/requests' },
  { icon: ClipboardList, label: 'Meine Buchungen', path: '/dashboard/bookings' },
  { icon: Calendar, label: 'Mein Kalender', path: '/dashboard/calendar' },
  { icon: Users, label: 'Meine Community', path: '/dashboard/community' },
  { icon: MessageCircle, label: 'Meine Chats', path: '/dashboard/chat' },
  { icon: Coins, label: 'Meine Coins', path: '/dashboard/coins' },
  { icon: HelpCircle, label: 'Support', path: '/support' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top bar for mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-bg-secondary border-b border-white/10 z-40 flex items-center justify-between px-4">
        <Link to="/" className="text-2xl font-display text-white">BLOGHEAD</Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`
        lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary border-r border-white/10 z-50
        transform transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="text-2xl font-display text-white">BLOGHEAD</Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold">
              {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {user?.user_metadata?.username || user?.email?.split('@')[0]}
              </p>
              <p className="text-gray-500 text-sm truncate capitalize">
                {user?.user_metadata?.user_type?.replace('_', ' ') || 'Member'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-orange-600/20 text-white border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex pt-16 lg:pt-0">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary border-r border-white/10 hidden lg:flex flex-col z-50">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="text-2xl font-display text-white">BLOGHEAD</Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold">
                {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user?.user_metadata?.username || user?.email?.split('@')[0]}
                </p>
                <p className="text-gray-500 text-sm truncate capitalize">
                  {user?.user_metadata?.user_type?.replace('_', ' ') || 'Member'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-purple-600/20 to-orange-600/20 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-white/10 z-40">
        <div className="flex justify-around py-2">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 ${isActive ? 'text-purple-500' : 'text-gray-500'}`}
              >
                <item.icon size={20} />
                <span className="text-xs mt-1">{item.label.replace('Meine ', '').replace('Mein ', '')}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

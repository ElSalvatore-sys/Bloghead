import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children?: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#171717]">
      {/* Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Support both children prop and Outlet for React Router nested routes */}
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

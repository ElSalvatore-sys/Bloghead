import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type UserType = 'fan' | 'artist' | 'service_provider' | 'event_organizer' | 'veranstalter' | 'customer' | 'community'

interface RoleGuardProps {
  children: React.ReactNode
  allowedUserTypes: UserType[]
  fallbackPath?: string
}

/**
 * RoleGuard - Protects routes based on user_type
 *
 * Usage:
 * <RoleGuard allowedUserTypes={['fan']}>
 *   <FanOnlyPage />
 * </RoleGuard>
 *
 * <RoleGuard allowedUserTypes={['artist', 'service_provider']}>
 *   <ArtistOrProviderPage />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedUserTypes,
  fallbackPath = '/dashboard'
}: RoleGuardProps) {
  const { user, userProfile, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/?login=true" state={{ from: location }} replace />
  }

  // No profile yet - redirect to dashboard (onboarding will handle it)
  if (!userProfile) {
    return <Navigate to="/dashboard" replace />
  }

  // Admins can access all pages
  if (userProfile.role === 'admin') {
    return <>{children}</>
  }

  // Check if user's type is in the allowed list
  if (!allowedUserTypes.includes(userProfile.user_type)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

import { useAuth } from "@/hooks/use-auth"
import { getHomePathForRole } from "@/lib/auth-utils"
import { Navigate } from "react-router-dom"

interface GuestRouteProps {
  children: React.ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, profile, loading, profileLoading } = useAuth()

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (user && profile) {
    return <Navigate to={getHomePathForRole(profile.role)} replace />
  }

  return <>{children}</>
}

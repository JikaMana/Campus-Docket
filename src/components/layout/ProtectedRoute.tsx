import { useAuth } from "@/hooks/use-auth"
import { getHomePathForRole } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Navigate, useNavigate } from "react-router-dom"
import type { UserRole } from "@/lib/database.types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const { user, profile, loading, profileLoading, profileError, signOut, refreshProfile } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate("/login", { replace: true })
  }

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="font-display text-xl font-bold">Account setup incomplete</h1>
          <p className="text-sm text-muted-foreground">
            {profileError ?? "We could not load your profile. This usually means your account was created without a profile record."}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" onClick={() => refreshProfile()}>
              Retry
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getHomePathForRole(profile.role)} replace />
  }

  return <>{children}</>
}

import type { UserRole } from "@/lib/database.types"

export function getHomePathForRole(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/super-admin/universities"
    case "src_officer":
      return "/admin/dashboard"
    default:
      return "/dashboard"
  }
}

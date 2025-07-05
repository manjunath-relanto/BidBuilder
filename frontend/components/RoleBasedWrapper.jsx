"use client"

import { useSelector } from "react-redux"

export default function RoleBasedWrapper({ children, allowedRoles = [], fallback = null, requireAuth = true }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  if (requireAuth && !isAuthenticated) {
    return fallback || <div>Please log in to access this content.</div>
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return fallback || <div>You don't have permission to access this content.</div>
  }

  return children
}

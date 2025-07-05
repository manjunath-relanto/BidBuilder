import { useSelector } from "react-redux"

export const useAuth = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const hasRole = (role) => user?.role === role
  const hasAnyRole = (roles) => roles.includes(user?.role)
  const canEdit = (item) => {
    return user?.role === "admin" || user?.role === "manager" || item?.createdBy === user?.email
  }

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    canEdit,
  }
}

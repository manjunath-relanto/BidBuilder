// Role-based access control utilities

// Get user role from localStorage
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.role || null
}

// Get user role with fallback to provided user object
export const getUserRoleWithFallback = (userObject = null) => {
  // First try localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user?.role) {
    return user.role
  }
  
  // Fallback to provided user object
  if (userObject?.role) {
    return userObject.role
  }
  
  return null
}

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const userRole = getUserRole()
  return userRole === requiredRole
}

// Check if user has any of the required roles
export const hasAnyRole = (requiredRoles) => {
  const userRole = getUserRole()
  return requiredRoles.includes(userRole)
}

// Check if user can create proposals (manager and admin only)
export const canCreateProposals = () => {
  return hasAnyRole(['manager', 'admin'])
}

// Check if user can create templates (manager and admin only)
export const canCreateTemplates = () => {
  return hasAnyRole(['manager', 'admin'])
}

// Check if user can assign proposals (manager and admin only)
export const canAssignProposals = () => {
  return hasAnyRole(['manager', 'admin'])
}

// Check if user can edit proposals (all authenticated users)
export const canEditProposals = () => {
  const userRole = getUserRole()
  return userRole && ['user', 'manager', 'admin'].includes(userRole)
}

// Check if user can update proposal status (all authenticated users)
export const canUpdateProposalStatus = () => {
  const userRole = getUserRole()
  return userRole && ['user', 'manager', 'admin'].includes(userRole)
}

// Check if user can submit back to manager (users only)
export const canSubmitBackToManager = () => {
  return hasRole('user')
}

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'user': 'User',
    'manager': 'Manager',
    'admin': 'Administrator'
  }
  return roleNames[role] || role
}

// Get role color for badges
export const getRoleColor = (role) => {
  const roleColors = {
    'user': 'bg-blue-100 text-blue-800',
    'manager': 'bg-orange-100 text-orange-800',
    'admin': 'bg-red-100 text-red-800'
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800'
} 
// API utility functions for making authenticated requests

const API_BASE_URL = 'http://localhost:8000'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token')
}

// Create headers with authentication
const createAuthHeaders = (additionalHeaders = {}) => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...additionalHeaders
  }
}

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = createAuthHeaders(options.headers)
  
  const config = {
    ...options,
    headers
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Auth API functions
export const authAPI = {
  // Login
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed')
    }

    return data
  },

  // Register
  register: async (userData) => {
    return apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }
}

// Proposals API functions
export const proposalsAPI = {
  // Get all proposals
  getAll: async () => {
    return apiRequest('/list_proposal')
  },

  // Get single proposal
  getById: async (id) => {
    return apiRequest(`/get_proposal_by_id/${id}`)
  },

  // Create proposal
  create: async (proposalData) => {
    return apiRequest('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData)
    })
  },

  // Update proposal
  update: async (id, proposalData) => {
    return apiRequest(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(proposalData)
    })
  },

  // Delete proposal
  delete: async (id) => {
    return apiRequest(`/proposals/${id}`, {
      method: 'DELETE'
    })
  }
}

// Templates API functions
export const templatesAPI = {
  // Get all templates
  getAll: async () => {
    return apiRequest('/templates')
  },

  // Create template
  create: async (templateData) => {
    return apiRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData)
    })
  }
}

// Analytics API functions
export const analyticsAPI = {
  // Get analytics data
  getAnalytics: async () => {
    return apiRequest('/analytics')
  }
}

// Notifications API functions
export const notificationsAPI = {
  // Get all notifications
  getAll: async () => {
    return apiRequest('/notifications')
  },

  // Mark notification as read (you might want to add this endpoint)
  markAsRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  }
}

// AI Summary API functions
export const aiSummaryAPI = {
  // Get AI generated summary from title and description
  getSummary: async (title, description) => {
    return apiRequest('/get_summary', {
      method: 'POST',
      body: JSON.stringify({ title, description })
    })
  },

  // Read data from PDF and get summary
  readPdfData: async (pdfFile) => {
    const formData = new FormData()
    formData.append('file', pdfFile)
    
    const url = `${API_BASE_URL}/read_data_from_pdf`
    const token = getAuthToken()
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`)
    }

    return data
  }
}

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Utility function to logout
export const logout = () => {
  localStorage.removeItem('access_token')
}

export default {
  authAPI,
  proposalsAPI,
  templatesAPI,
  analyticsAPI,
  notificationsAPI,
  aiSummaryAPI,
  isAuthenticated,
  logout
} 
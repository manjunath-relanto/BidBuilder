"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setUser, logout } from "./lib/features/authSlice"
import { fetchProposalById } from "./lib/features/proposalSlice"
import { canCreateProposals, canCreateTemplates, getUserRoleWithFallback } from "./lib/roleUtils"
import LoginForm from "./components/LoginForm"
import SignupForm from "./components/SignupForm"
import ProposalList from "./components/ProposalList"
import ProposalForm from "./components/ProposalForm"
import ProposalDetails from "./components/ProposalDetails"
import AnalyticsDashboard from "./components/AnalyticsDashboard"
import ProposalTemplates from "./components/ProposalTemplates"
import TeamPage from "./components/TeamPage"
import EnhancedHeader from "./components/EnhancedHeader"

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [authMode, setAuthMode] = useState("login") // "login" or "signup"

  // Check for existing token and user data on app load
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user")
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        dispatch(setUser(user))
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
        // Fallback to default user if parsing fails
        const user = {
          id: "1",
          name: "User",
          email: "user@example.com",
          role: "user",
          avatar: "/placeholder.svg?height=40&width=40",
        }
        dispatch(setUser(user))
      }
    }
  }, [dispatch])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    dispatch(logout())
    setCurrentView("dashboard")
    setSelectedProposal(null)
  }

  const handleSwitchToSignup = () => {
    setAuthMode("signup")
  }

  const handleSwitchToLogin = () => {
    setAuthMode("login")
  }

  if (!isAuthenticated) {
    return authMode === "login" ? (
      <LoginForm onSwitchToSignup={handleSwitchToSignup} />
    ) : (
      <SignupForm onSwitchToLogin={handleSwitchToLogin} />
    )
  }

  const handleCreateProposal = () => {
    if (!canCreateProposals()) {
      alert("You don't have permission to create proposals. Only managers and administrators can create proposals.")
      return
    }
    setSelectedProposal(null)
    setSelectedTemplate(null)
    setCurrentView("create")
  }

  const handleEditProposal = (proposal) => {
    // Role-based edit permission is handled in ProposalDetails component
    setSelectedProposal(proposal)
    setCurrentView("edit")
  }

  const handleViewProposal = (proposal) => {
    // Fetch detailed proposal data from API
    dispatch(fetchProposalById(proposal.id))
    setSelectedProposal(proposal)
    setCurrentView("details")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedProposal(null)
    setSelectedTemplate(null)
  }

  const handleNavigate = (view) => {
    const userRole = getUserRoleWithFallback()
    
    // Check if user is trying to access restricted pages
    if (userRole === "user" && (view === "templates" || view === "team")) {
      alert("You don't have permission to access this page. Only managers and administrators can access Templates and Team pages.")
      return
    }
    
    setCurrentView(view)
    setSelectedProposal(null)
  }

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template)
    setSelectedProposal(null)
    setCurrentView("create")
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <AnalyticsDashboard />
      case "templates":
        return <ProposalTemplates onUseTemplate={handleUseTemplate} />
      case "team":
        return <TeamPage />
      case "create":
      case "edit":
        return <ProposalForm 
          proposal={currentView === "edit" ? selectedProposal : null} 
          template={currentView === "create" ? selectedTemplate : null}
          onClose={handleBackToList} 
        />
      case "details":
        return <ProposalDetails proposal={selectedProposal} onEdit={handleEditProposal} onBack={handleBackToList} />
      default:
        return <ProposalList onViewProposal={handleViewProposal} onEditProposal={handleEditProposal} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <EnhancedHeader 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onCreateProposal={handleCreateProposal}
        onLogout={handleLogout}
        canCreateProposals={canCreateProposals()}
        canCreateTemplates={canCreateTemplates()}
        userRole={getUserRoleWithFallback()}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderCurrentView()}</main>
    </div>
  )
}

export default App

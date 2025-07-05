"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setUser, logout } from "./lib/features/authSlice"
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
  const [authMode, setAuthMode] = useState("login") // "login" or "signup"

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      // If token exists, assume user is authenticated
      // We'll get user info from the token or use default values
      const user = {
        id: "1",
        name: "User",
        email: "user@example.com",
        role: "user",
        avatar: "/placeholder.svg?height=40&width=40",
      }
      dispatch(setUser(user))
    }
  }, [dispatch])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
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
    setSelectedProposal(null)
    setCurrentView("create")
  }

  const handleEditProposal = (proposal) => {
    setSelectedProposal(proposal)
    setCurrentView("edit")
  }

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal)
    setCurrentView("details")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedProposal(null)
  }

  const handleNavigate = (view) => {
    setCurrentView(view)
    setSelectedProposal(null)
  }

  const handleUseTemplate = (template) => {
    setSelectedProposal({
      title: template.name,
      description: template.description,
      requirements: template.sections,
      value: template.estimatedValue,
      timeline: template.timeline,
    })
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
        return <ProposalForm proposal={currentView === "edit" ? selectedProposal : null} onClose={handleBackToList} />
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
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderCurrentView()}</main>
    </div>
  )
}

export default App

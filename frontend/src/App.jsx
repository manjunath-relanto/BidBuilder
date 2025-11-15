"use client"

import { useState, useEffect, useCallback } from "react"
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
import WebSocketPage from "./components/WebSocketPage"
import EnhancedHeader from "./components/EnhancedHeader"

function getInitialView() {
  const userData = localStorage.getItem("user")
  if (userData) {
    try {
      const user = JSON.parse(userData)
      if (user.role === "user") return "list"
    } catch {}
  }
  return "dashboard"
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [currentView, setCurrentView] = useState(getInitialView())
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [authMode, setAuthMode] = useState("login")

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user")
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        dispatch(setUser(user))
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
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
    setSelectedProposal(proposal)
    setCurrentView("edit")
  }

  const handleViewProposal = (proposal) => {
    dispatch(fetchProposalById(proposal.id))
    setSelectedProposal(proposal)
    setCurrentView("details")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedProposal(null)
    setSelectedTemplate(null)
  }

  const handleNavigate = useCallback((view) => {
    const userRole = getUserRoleWithFallback()
    
    if (userRole === "user" && (view === "templates" || view === "team" || view === "websocket")) {
      alert("You don't have permission to access this page. Only managers and administrators can access Templates, Team, and WebSocket pages.")
      return
    }
    
    setCurrentView(view)
    setSelectedProposal(null)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return
    if (window.location.pathname === "/websocket" && currentView !== "websocket") {
      handleNavigate("websocket")
    }
  }, [isAuthenticated, currentView, handleNavigate])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (currentView === "websocket" && window.location.pathname !== "/websocket") {
      window.history.replaceState(null, "", "/websocket")
    } else if (currentView !== "websocket" && window.location.pathname === "/websocket") {
      window.history.replaceState(null, "", "/")
    }
  }, [currentView])

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
      case "websocket":
        return <WebSocketPage />
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

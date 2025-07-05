"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import LoginForm from "./components/LoginForm"
import ProposalList from "./components/ProposalList"
import ProposalForm from "./components/ProposalForm"
import ProposalDetails from "./components/ProposalDetails"
import AnalyticsDashboard from "./components/AnalyticsDashboard"
import ProposalTemplates from "./components/ProposalTemplates"
import TeamPage from "./components/TeamPage"
import EnhancedHeader from "./components/EnhancedHeader"

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedProposal, setSelectedProposal] = useState(null)

  if (!isAuthenticated) {
    return <LoginForm />
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
      <EnhancedHeader currentView={currentView} onNavigate={handleNavigate} onCreateProposal={handleCreateProposal} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderCurrentView()}</main>
    </div>
  )
}

export default App

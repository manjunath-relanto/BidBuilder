"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { proposalsAPI } from "../lib/api"
import { canAssignProposals, canEditProposals, canUpdateProposalStatus, canSubmitBackToManager, getRoleColor, getRoleDisplayName, getUserRoleWithFallback } from "../lib/roleUtils"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { DollarSign, Calendar, User, Clock, CheckCircle, Edit, ArrowLeft, Users, Send, RefreshCw } from "lucide-react"
import CommentSection from "./CommentSection"
import ProgressTracker from "./ProgressTracker"
import AssignTeamMemberModal from "./AssignTeamMemberModal"

export default function ProposalDetails({ proposal, onEdit, onBack }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { selectedProposal, loading } = useSelector((state) => state.proposals)
  
  // Use selectedProposal from Redux if available, otherwise use the passed proposal
  const currentProposal = selectedProposal || proposal
  
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isSubmittingToManager, setIsSubmittingToManager] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentProposal?.status || '')

  // Initialize selectedStatus when proposal changes
  useEffect(() => {
    setSelectedStatus(currentProposal?.status || '')
  }, [currentProposal])

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Loading proposal details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentProposal) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Proposal not found.</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status] || colors.draft
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800",
    }
    return colors[priority] || colors.medium
  }

  const canEdit = () => {
    const userRole = getUserRoleWithFallback(user)
    return canEditProposals() && (userRole === "admin" || userRole === "manager" || currentProposal.owner_id === user?.id)
  }

  const handleStatusSelection = (newStatus) => {
    setSelectedStatus(newStatus)
  }

  const handleStatusSubmit = async () => {
    if (!canUpdateProposalStatus()) return
    if (!selectedStatus || selectedStatus === currentProposal.status) {
      alert("Please select a different status to update.")
      return
    }
    
    setIsUpdatingStatus(true)
    try {
      await proposalsAPI.updateStatus(currentProposal.id, selectedStatus)
      alert("Status updated successfully!")
      // Refresh the proposal data
      window.location.reload()
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status. Please try again.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSubmitBackToManager = async () => {
    if (!canSubmitBackToManager()) return
    
    setIsSubmittingToManager(true)
    try {
      await proposalsAPI.submitBackToManager(currentProposal.id)
      alert("Proposal submitted back to manager successfully!")
      // Refresh the proposal data
      window.location.reload()
    } catch (error) {
      console.error("Error submitting to manager:", error)
      alert("Failed to submit to manager. Please try again.")
    } finally {
      setIsSubmittingToManager(false)
    }
  }

  const handleAssignSuccess = () => {
    // Refresh the proposal data
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentProposal.title}</h1>
            <p className="text-muted-foreground">{currentProposal.client_name || 'No client'}</p>
          </div>
        </div>
        {canEdit() && (
          <Button onClick={() => onEdit(currentProposal)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit Proposal
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentProposal.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-semibold">${currentProposal.estimatedValue?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-semibold">{currentProposal.timeline || 'No timeline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge className={getPriorityColor(currentProposal.priority?.toLowerCase())}>{currentProposal.priority || 'Medium'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(currentProposal.status?.toLowerCase())}>{currentProposal.status || 'Draft'}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentProposal.requirements ? (
                  typeof currentProposal.requirements === 'string' ? (
                    <p className="text-sm text-muted-foreground">{currentProposal.requirements}</p>
                  ) : (
                    currentProposal.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{requirement}</span>
                      </div>
                    ))
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">No requirements specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <ProgressTracker proposal={currentProposal} />

          {/* Comments */}
          <CommentSection proposalId={currentProposal.id} comments={currentProposal.comments || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Proposal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Created by</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback>{(currentProposal.owner_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{currentProposal.owner_name || 'Unknown'}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{proposal.createdAt}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">{proposal.updatedAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Assign Team Member - Only for managers and admins */}
              {canAssignProposals() && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent hover:bg-blue-50"
                  onClick={() => setShowAssignModal(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assign Team Member
                </Button>
              )}

              {/* Status Update - For all authenticated users */}
              {canUpdateProposalStatus() && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Update Status</p>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={handleStatusSelection}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Submit Button - Only show if status is different from current */}
                  {selectedStatus && selectedStatus !== currentProposal.status && (
                    <Button 
                      onClick={handleStatusSubmit}
                      disabled={isUpdatingStatus}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Update Status
                        </>
                      )}
                    </Button>
                  )}
                  
                  {isUpdatingStatus && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      Updating status...
                    </div>
                  )}
                </div>
              )}

              {/* Submit Back to Manager - Only for users */}
              {canSubmitBackToManager() && currentProposal.status === "Under Review" && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent hover:bg-green-50 text-green-700 border-green-300"
                  onClick={handleSubmitBackToManager}
                  disabled={isSubmittingToManager}
                >
                  {isSubmittingToManager ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Back to Manager
                    </>
                  )}
                </Button>
              )}

              {/* User Role Display */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-muted-foreground">Your Role:</span>
                  <Badge className={getRoleColor(getUserRoleWithFallback(user))}>
                    {getRoleDisplayName(getUserRoleWithFallback(user))}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Team Member Modal */}
      {showAssignModal && (
        <AssignTeamMemberModal
          proposal={currentProposal}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  )
}

"use client"

import { useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DollarSign, Calendar, User, Clock, CheckCircle, Edit, ArrowLeft } from "lucide-react"
import CommentSection from "./CommentSection"
import ProgressTracker from "./ProgressTracker"

export default function ProposalDetails({ proposal, onEdit, onBack }) {
  const { user } = useSelector((state) => state.auth)

  if (!proposal) {
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
    return user?.role === "admin" || user?.role === "manager" || proposal.createdBy === user?.email
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
            <h1 className="text-2xl font-bold">{proposal.title}</h1>
            <p className="text-muted-foreground">{proposal.client}</p>
          </div>
        </div>
        {canEdit() && (
          <Button onClick={() => onEdit(proposal)}>
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
              <p className="text-muted-foreground">{proposal.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-semibold">${proposal.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-semibold">{proposal.timeline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge className={getPriorityColor(proposal.priority)}>{proposal.priority}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
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
                {proposal.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <ProgressTracker proposal={proposal} />

          {/* Comments */}
          <CommentSection proposalId={proposal.id} comments={proposal.comments} />
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
                    <AvatarFallback>{proposal.createdBy.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{proposal.createdBy}</span>
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
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <User className="h-4 w-4 mr-2" />
                Assign Team Member
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <DollarSign className="h-4 w-4 mr-2" />
                Update Budget
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

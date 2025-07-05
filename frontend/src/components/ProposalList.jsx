"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchProposals, setFilters } from "../lib/features/proposalSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Eye, Edit, DollarSign, Calendar, User } from "lucide-react"

export default function ProposalList({ onViewProposal, onEditProposal }) {
  const dispatch = useDispatch()
  const { items: proposals, loading, filters } = useSelector((state) => state.proposals)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchProposals())
  }, [dispatch])

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
  }

  const filteredProposals = proposals.filter((proposal) => {
    const matchesStatus = filters.status === "all" || proposal.status === filters.status
    const matchesPriority = filters.priority === "all" || proposal.priority === filters.priority
    const matchesSearch =
      !filters.search ||
      proposal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      proposal.client.toLowerCase().includes(filters.search.toLowerCase())

    return matchesStatus && matchesPriority && matchesSearch
  })

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
      low: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800",
      medium: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800",
      high: "bg-gradient-to-r from-red-100 to-red-200 text-red-800",
    }
    return colors[priority] || colors.medium
  }

  const canEdit = (proposal) => {
    return user?.role === "admin" || user?.role === "manager" || proposal.createdBy === user?.email
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading proposals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search proposals..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredProposals.length} of {proposals.length} proposals
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProposals.map((proposal) => (
          <Card
            key={proposal.id}
            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-200 bg-white/80 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{proposal.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {proposal.client}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge className={getPriorityColor(proposal.priority)}>{proposal.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />${proposal.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {proposal.timeline}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                <div className="text-xs text-muted-foreground">Updated {proposal.updatedAt}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewProposal(proposal)}
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {canEdit(proposal) && (
                  <Button
                    size="sm"
                    onClick={() => onEditProposal(proposal)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No proposals found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { createProposal, updateProposal } from "@/lib/features/proposalSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

export default function ProposalForm({ proposal = null, onClose }) {
  const dispatch = useDispatch()
  const isEditing = !!proposal

  const [formData, setFormData] = useState({
    title: proposal?.title || "",
    client: proposal?.client || "",
    description: proposal?.description || "",
    value: proposal?.value || "",
    priority: proposal?.priority || "medium",
    status: proposal?.status || "draft",
    timeline: proposal?.timeline || "",
    requirements: proposal?.requirements || [],
  })

  const [newRequirement, setNewRequirement] = useState("")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isEditing) {
      await dispatch(updateProposal({ id: proposal.id, updates: formData }))
    } else {
      await dispatch(createProposal(formData))
    }

    onClose?.()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-2 border-blue-100">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Proposal" : "Create New Proposal"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update proposal details" : "Fill in the details to create a new proposal"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter proposal title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client Name</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange("client", e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the proposal..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange("value", Number.parseInt(e.target.value) || 0)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              value={formData.timeline}
              onChange={(e) => handleInputChange("timeline", e.target.value)}
              placeholder="e.g., 6 months"
            />
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.requirements.map((req, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800"
                >
                  {req}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeRequirement(index)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isEditing ? "Update Proposal" : "Create Proposal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

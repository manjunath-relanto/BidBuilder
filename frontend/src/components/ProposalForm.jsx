"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { createProposal, updateProposal } from "../lib/features/proposalSlice"
import { aiSummaryAPI } from "../lib/api"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { X, Plus, Sparkles, Upload, Copy } from "lucide-react"

export default function ProposalForm({ proposal = null, template = null, onClose }) {
  const dispatch = useDispatch()
  const isEditing = !!proposal

  const [formData, setFormData] = useState({
    title: proposal?.title || template?.name || "",
    client_name: proposal?.client_name || "",
    description: proposal?.description || template?.description || "",
    estimatedValue: proposal?.estimatedValue || template?.estimatedValue || "",
    priority: proposal?.priority || "Medium",
    status: proposal?.status || "Draft",
    timeline: proposal?.timeline || template?.timeline || "",
    requirements: proposal?.requirements || template?.sections || [],
    category: proposal?.category || template?.category || "",
    template_id: template?.id || null,
  })

  const [newRequirement, setNewRequirement] = useState("")
  const [detailedSummary, setDetailedSummary] = useState("")
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

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

  const generateAISummary = async () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in both title and description to generate AI summary")
      return
    }

    setIsGeneratingSummary(true)
    try {
      const response = await aiSummaryAPI.getSummary(formData.title, formData.description)
      setDetailedSummary(response.summary || response)
    } catch (error) {
      console.error("Error generating AI summary:", error)
      alert("Failed to generate AI summary. Please try again.")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file first")
      return
    }

    setIsUploadingPdf(true)
    try {
      const response = await aiSummaryAPI.readPdfData(selectedFile)
      setDetailedSummary(response.summary || response)
    } catch (error) {
      console.error("Error reading PDF:", error)
      alert("Failed to read PDF. Please try again.")
    } finally {
      setIsUploadingPdf(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    } else {
      alert("Please select a valid PDF file")
      e.target.value = null
    }
  }

  const copyToDescription = () => {
    if (detailedSummary) {
      setFormData((prev) => ({
        ...prev,
        description: detailedSummary
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convert requirements array to string for API
    const apiData = {
      ...formData,
      requirements: Array.isArray(formData.requirements) 
        ? formData.requirements.join(", ")
        : formData.requirements
    }

    if (isEditing) {
      await dispatch(updateProposal({ id: proposal.id, updates: apiData }))
    } else {
      await dispatch(createProposal(apiData))
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
        {template && (
          <div className="mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Using template: {template.name}
            </Badge>
          </div>
        )}
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
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleInputChange("client_name", e.target.value)}
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
              <Label htmlFor="estimatedValue">Value ($)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange("estimatedValue", Number.parseInt(e.target.value) || 0)}
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
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
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
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange("timeline", e.target.value)}
                placeholder="e.g., 2025-08-15 to 2025-12-31"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Public Safety">Public Safety</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          {/* AI Summary Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <Label className="text-lg font-semibold text-blue-900">AI-Powered Summary Generation</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text-based Summary */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-800">Generate from Title & Description</Label>
                <Button
                  type="button"
                  onClick={generateAISummary}
                  disabled={isGeneratingSummary || !formData.title || !formData.description}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGeneratingSummary ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-800">Upload PDF for Analysis</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={isUploadingPdf || !selectedFile}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    {isUploadingPdf ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Analyze PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Detailed Summary Display */}
            {detailedSummary && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-blue-800">Detailed Summary</Label>
                  <Button
                    type="button"
                    onClick={copyToDescription}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy to Description
                  </Button>
                </div>
                <Textarea
                  value={detailedSummary}
                  onChange={(e) => setDetailedSummary(e.target.value)}
                  placeholder="AI-generated detailed summary will appear here..."
                  rows={6}
                  className="bg-white border-blue-300 focus:border-blue-500"
                />
                <p className="text-xs text-blue-600">
                  💡 You can edit this summary and then copy it to the description field above
                </p>
              </div>
            )}
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

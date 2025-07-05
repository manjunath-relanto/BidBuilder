"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

export default function CreateTemplateModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    sections: [],
    estimatedValue: "",
    timeline: "",
  })
  const [newSection, setNewSection] = useState("")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSection = () => {
    if (newSection.trim()) {
      setFormData((prev) => ({
        ...prev,
        sections: [...prev.sections, newSection.trim()],
      }))
      setNewSection("")
    }
  }

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Here you would dispatch an action to create the template
    console.log("Creating template:", formData)

    // Reset form and close modal
    setFormData({
      name: "",
      category: "",
      description: "",
      sections: [],
      estimatedValue: "",
      timeline: "",
    })
    onClose()
  }

  const categories = ["Software", "Infrastructure", "Consulting", "Marketing", "Finance", "Operations"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Template
          </DialogTitle>
          <DialogDescription>
            Design a reusable proposal template for your team to streamline future proposals
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Enterprise Software Implementation"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what this template is used for..."
              rows={3}
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated-value">Estimated Value ($)</Label>
              <Input
                id="estimated-value"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                placeholder="250000"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Typical Timeline</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange("timeline", e.target.value)}
                placeholder="e.g., 6-12 months"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template Sections</Label>
            <div className="flex gap-2">
              <Input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="Add a section (e.g., Executive Summary)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSection())}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button type="button" onClick={addSection} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sections.map((section, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200"
                >
                  {section}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeSection(index)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Create Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

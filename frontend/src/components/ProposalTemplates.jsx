"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchTemplates } from "../lib/features/templatesSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { FileIcon as FileTemplate, Users, Clock, DollarSign, Search, Plus } from "lucide-react"
import CreateTemplateModal from "./CreateTemplateModal"

export default function ProposalTemplates({ onUseTemplate }) {
  const dispatch = useDispatch()
  const { items: templates, loading } = useSelector((state) => state.templates)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchTemplates())
  }, [dispatch])

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(templates.map((t) => t.category))]

  const getTemplateStyle = (category, index) => {
    const styles = {
      Software: {
        bg: "bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100",
        border: "border-blue-300 hover:border-blue-400",
        icon: "💻",
        accent: "bg-blue-600 text-white",
        iconBg: "bg-blue-100",
      },
      Infrastructure: {
        bg: "bg-gradient-to-br from-green-50 via-green-100 to-emerald-100",
        border: "border-green-300 hover:border-green-400",
        icon: "🏗️",
        accent: "bg-green-600 text-white",
        iconBg: "bg-green-100",
      },
      Consulting: {
        bg: "bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100",
        border: "border-purple-300 hover:border-purple-400",
        icon: "🎯",
        accent: "bg-purple-600 text-white",
        iconBg: "bg-purple-100",
      },
    }
    return styles[category] || styles.Software
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Proposal Templates</h2>
          <p className="text-muted-foreground">Choose from pre-built templates to accelerate your proposal creation</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Add the modal */}
      <CreateTemplateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
          const style = getTemplateStyle(template.category, index)
          return (
            <Card
              key={template.id}
              className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${style.bg} ${style.border} relative overflow-hidden`}
            >
              {/* Add decorative element */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${style.iconBg} rounded-bl-full opacity-50`} />

              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${style.iconBg} text-xl`}>{style.icon}</div>
                    <Badge className={style.accent}>{template.category}</Badge>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white/80">
                    <Users className="h-3 w-3 mr-1" />
                    {template.usageCount} uses
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Sections */}
                <div>
                  <p className="text-sm font-medium mb-2">Included Sections:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.sections.slice(0, 3).map((section) => (
                      <Badge key={section} variant="outline" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                    {template.sections.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.sections.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Template Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-muted-foreground">Est. Value:</span>
                  </div>
                  <div className="font-medium">${(template.estimatedValue / 1000).toFixed(0)}K</div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-muted-foreground">Timeline:</span>
                  </div>
                  <div className="font-medium">{template.timeline}</div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onUseTemplate(template)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No templates found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

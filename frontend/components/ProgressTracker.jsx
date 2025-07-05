"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react"

export default function ProgressTracker({ proposal }) {
  const getWorkflowSteps = (status) => {
    const allSteps = [
      { id: "draft", label: "Draft Created", description: "Initial proposal draft" },
      { id: "review", label: "Under Review", description: "Team review and feedback" },
      { id: "approved", label: "Approved", description: "Proposal approved by stakeholders" },
      { id: "implementation", label: "Implementation", description: "Project implementation phase" },
    ]

    const statusOrder = ["draft", "review", "approved", "implementation"]
    const currentIndex = statusOrder.indexOf(status)

    return allSteps.map((step, index) => ({
      ...step,
      status: index <= currentIndex ? "completed" : "pending",
      isActive: index === currentIndex,
    }))
  }

  const steps = getWorkflowSteps(proposal.status)

  const getStepIcon = (step) => {
    if (step.status === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    if (step.isActive) {
      return <Clock className="h-5 w-5 text-blue-600" />
    }
    return <Circle className="h-5 w-5 text-gray-400" />
  }

  const getStepColor = (step) => {
    if (step.status === "completed") return "text-green-600"
    if (step.isActive) return "text-blue-600"
    return "text-gray-400"
  }

  const calculateProgress = () => {
    const completedSteps = steps.filter((step) => step.status === "completed").length
    return Math.round((completedSteps / steps.length) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Progress Tracker</span>
          <Badge variant="outline">{calculateProgress()}% Complete</Badge>
        </CardTitle>
        <CardDescription>Track the proposal through its workflow stages</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {getStepIcon(step)}
                {index < steps.length - 1 && (
                  <div className={`w-px h-8 mt-2 ${step.status === "completed" ? "bg-green-200" : "bg-gray-200"}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${getStepColor(step)}`}>{step.label}</h4>
                  {step.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                {step.isActive && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                    <AlertCircle className="h-3 w-3" />
                    Action required
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-1">Next Steps</h5>
          <p className="text-sm text-blue-700">
            {proposal.status === "draft" && "Submit proposal for team review"}
            {proposal.status === "review" && "Awaiting stakeholder approval"}
            {proposal.status === "approved" && "Ready for implementation planning"}
            {proposal.status === "rejected" && "Review feedback and revise proposal"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

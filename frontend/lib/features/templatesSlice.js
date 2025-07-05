import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const mockTemplates = [
  {
    id: "1",
    name: "Enterprise Software Implementation",
    category: "Software",
    description:
      "Comprehensive template for large-scale enterprise software deployments with detailed technical specifications and implementation roadmaps",
    sections: [
      "Executive Summary",
      "Technical Architecture",
      "Implementation Plan",
      "Budget Analysis",
      "Risk Assessment",
      "Timeline",
    ],
    estimatedValue: 500000,
    timeline: "6-12 months",
    usageCount: 24,
  },
  {
    id: "2",
    name: "Cloud Migration Strategy",
    category: "Infrastructure",
    description:
      "Complete cloud transformation proposal template including security compliance, data migration strategies, and cost optimization plans",
    sections: [
      "Current State Analysis",
      "Migration Strategy",
      "Security Framework",
      "Cost Analysis",
      "Risk Mitigation",
      "Training Plan",
    ],
    estimatedValue: 300000,
    timeline: "3-6 months",
    usageCount: 18,
  },
  {
    id: "3",
    name: "Digital Transformation Consulting",
    category: "Consulting",
    description:
      "End-to-end digital transformation proposal with business process optimization, technology modernization, and change management strategies",
    sections: [
      "Business Analysis",
      "Technology Roadmap",
      "Process Optimization",
      "Change Management",
      "Training Program",
      "Success Metrics",
    ],
    estimatedValue: 750000,
    timeline: "12-18 months",
    usageCount: 12,
  },
  {
    id: "4",
    name: "Mobile App Development",
    category: "Software",
    description:
      "Native and cross-platform mobile application development proposal with UI/UX design, backend integration, and app store deployment",
    sections: ["App Concept", "UI/UX Design", "Development Plan", "Testing Strategy", "Deployment", "Maintenance"],
    estimatedValue: 150000,
    timeline: "4-8 months",
    usageCount: 31,
  },
  {
    id: "5",
    name: "Network Infrastructure Upgrade",
    category: "Infrastructure",
    description:
      "Complete network modernization proposal including hardware upgrades, security enhancements, and performance optimization",
    sections: [
      "Network Assessment",
      "Hardware Specifications",
      "Security Protocols",
      "Implementation Schedule",
      "Testing Plan",
      "Documentation",
    ],
    estimatedValue: 200000,
    timeline: "2-4 months",
    usageCount: 15,
  },
  {
    id: "6",
    name: "Business Process Optimization",
    category: "Consulting",
    description:
      "Comprehensive business process analysis and optimization proposal with workflow automation and efficiency improvements",
    sections: [
      "Process Analysis",
      "Optimization Strategy",
      "Automation Plan",
      "Training Requirements",
      "Implementation",
      "ROI Analysis",
    ],
    estimatedValue: 125000,
    timeline: "3-6 months",
    usageCount: 22,
  },
]

export const fetchTemplates = createAsyncThunk("templates/fetchTemplates", async () => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return mockTemplates
})

const templatesSlice = createSlice({
  name: "templates",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default templatesSlice.reducer

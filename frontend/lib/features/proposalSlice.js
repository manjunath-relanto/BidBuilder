import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Mock data
const mockProposals = [
  {
    id: "1",
    title: "Enterprise CRM Implementation",
    client: "TechCorp Solutions",
    status: "draft",
    priority: "high",
    value: 250000,
    createdBy: "anil.kumawat@company.com",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    description: "Comprehensive CRM solution for enterprise client management",
    requirements: ["User management", "Data migration", "Custom integrations"],
    timeline: "6 months",
    comments: [
      {
        id: "1",
        author: "Jane Smith",
        content: "Need to review the technical requirements section",
        timestamp: "2024-01-18T10:30:00Z",
      },
    ],
  },
  {
    id: "2",
    title: "Cloud Migration Strategy",
    client: "Global Manufacturing Inc",
    status: "review",
    priority: "medium",
    value: 180000,
    createdBy: "sarah.wilson@company.com",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-22",
    description: "Complete cloud infrastructure migration and optimization",
    requirements: ["AWS setup", "Security compliance", "Staff training"],
    timeline: "4 months",
    comments: [],
  },
  {
    id: "3",
    title: "AI Analytics Platform",
    client: "DataDriven Corp",
    status: "approved",
    priority: "high",
    value: 320000,
    createdBy: "mike.anilson@company.com",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-25",
    description: "Custom AI-powered analytics platform for business intelligence",
    requirements: ["Machine learning models", "Real-time dashboards", "API integrations"],
    timeline: "8 months",
    comments: [
      {
        id: "2",
        author: "Alex Chen",
        content: "Excellent work on the technical specifications",
        timestamp: "2024-01-20T14:15:00Z",
      },
    ],
  },
]

// Async thunks
export const fetchProposals = createAsyncThunk("proposals/fetchProposals", async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockProposals
})

export const createProposal = createAsyncThunk("proposals/createProposal", async (proposalData) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  const newProposal = {
    ...proposalData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    comments: [],
  }
  return newProposal
})

export const updateProposal = createAsyncThunk("proposals/updateProposal", async ({ id, updates }) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { id, updates: { ...updates, updatedAt: new Date().toISOString().split("T")[0] } }
})

export const addComment = createAsyncThunk("proposals/addComment", async ({ proposalId, comment }) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))
  const newComment = {
    id: Date.now().toString(),
    ...comment,
    timestamp: new Date().toISOString(),
  }
  return { proposalId, comment: newComment }
})

const proposalSlice = createSlice({
  name: "proposals",
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {
      status: "all",
      priority: "all",
      search: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch proposals
      .addCase(fetchProposals.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Create proposal
      .addCase(createProposal.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      // Update proposal
      .addCase(updateProposal.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload.updates }
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const proposal = state.items.find((item) => item.id === action.payload.proposalId)
        if (proposal) {
          proposal.comments.push(action.payload.comment)
        }
      })
  },
})

export const { setFilters, clearError } = proposalSlice.actions
export default proposalSlice.reducer

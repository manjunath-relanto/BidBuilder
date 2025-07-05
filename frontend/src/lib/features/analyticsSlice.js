import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Mock analytics data with proper structure
const mockAnalytics = {
  proposalsByStatus: [
    { name: "Draft", value: 8, color: "#94a3b8" },
    { name: "Review", value: 4, color: "#fbbf24" },
    { name: "Approved", value: 12, color: "#10b981" },
    { name: "Rejected", value: 3, color: "#ef4444" },
  ],
  proposalsByPriority: [
    { name: "High", value: 15, color: "#ef4444" },
    { name: "Medium", value: 8, color: "#f97316" },
    { name: "Low", value: 4, color: "#3b82f6" },
  ],
  monthlyProposals: [
    { month: "Jan", created: 4, approved: 2, value: 180000 },
    { month: "Feb", created: 6, approved: 4, value: 320000 },
    { month: "Mar", created: 8, approved: 5, value: 450000 },
    { month: "Apr", created: 5, approved: 3, value: 280000 },
    { month: "May", created: 9, approved: 7, value: 520000 },
    { month: "Jun", created: 7, approved: 4, value: 380000 },
  ],
  teamPerformance: [
    { name: "anil kumawat", proposals: 12, approved: 8, value: 850000, winRate: 67 },
    { name: "Manjunatha A", proposals: 10, approved: 7, value: 720000, winRate: 70 },
    { name: "Rukesh S", proposals: 8, approved: 6, value: 640000, winRate: 75 },
    { name: "Bharath jpv", proposals: 6, approved: 4, value: 480000, winRate: 67 },
  ],
  recentActivity: [
    { id: 1, type: "created", user: "anil kumawat", proposal: "Enterprise CRM", time: "2 hours ago" },
    { id: 2, type: "approved", user: "Manjunatha A", proposal: "Cloud Migration", time: "4 hours ago" },
    { id: 3, type: "commented", user: "Rukesh S", proposal: "AI Analytics", time: "6 hours ago" },
    { id: 4, type: "updated", user: "Bharath jpv", proposal: "Mobile App Dev", time: "1 day ago" },
  ],
}

export const fetchAnalytics = createAsyncThunk("analytics/fetchAnalytics", async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockAnalytics
})

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default analyticsSlice.reducer

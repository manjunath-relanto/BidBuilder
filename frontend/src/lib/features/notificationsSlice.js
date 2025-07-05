import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { notificationsAPI } from "../api"

// Async thunk to fetch notifications from API
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getAll()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk to mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      return notificationId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const mockNotifications = [
  {
    id: "1",
    type: "approval",
    title: "Proposal Approved",
    message: "Your Enterprise CRM proposal has been approved by the review committee",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "comment",
    title: "New Comment",
    message: "Manjunatha A commented on your Cloud Migration proposal",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: "medium",
  },
  {
    id: "3",
    type: "deadline",
    title: "Deadline Reminder",
    message: "AI Analytics proposal review deadline is in 2 days",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: "high",
  },
]

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: mockNotifications,
    unreadCount: 2,
    loading: false,
    error: null,
  },
  reducers: {
    markAsRead: (state, action) => {
      const notification = state.items.find((item) => item.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((item) => {
        item.read = true
      })
      state.unreadCount = 0
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload)
      if (!action.payload.read) {
        state.unreadCount += 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.unreadCount = action.payload.filter(item => !item.read).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.items.find((item) => item.id === action.payload)
        if (notification && !notification.read) {
          notification.read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
  },
})

export const { markAsRead, markAllAsRead, addNotification } = notificationsSlice.actions
export default notificationsSlice.reducer

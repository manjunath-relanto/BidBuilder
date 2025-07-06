import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      // Clear localStorage
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
    },
    updateUserRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload
      }
    },
  },
})

export const { setUser, logout, updateUserRole } = authSlice.actions
export default authSlice.reducer

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

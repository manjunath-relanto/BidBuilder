import { configureStore } from "@reduxjs/toolkit"
import proposalSlice from "./features/proposalSlice"
import authSlice from "./features/authSlice"
import analyticsSlice from "./features/analyticsSlice"
import templatesSlice from "./features/templatesSlice"
import notificationsSlice from "./features/notificationsSlice"

export const store = configureStore({
  reducer: {
    proposals: proposalSlice,
    auth: authSlice,
    analytics: analyticsSlice,
    templates: templatesSlice,
    notifications: notificationsSlice,
  },
})

export default store

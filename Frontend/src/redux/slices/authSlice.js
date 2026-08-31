import { createSlice } from "@reduxjs/toolkit"

const loadUserFromStorage = () => {
  try {
    const saved = localStorage.getItem("shopsphere_user")
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    return null
  }
}

const initialState = {
  user: loadUserFromStorage(),
  token: localStorage.getItem("shopsphere_token") || null,
  isAuthenticated: !!localStorage.getItem("shopsphere_token"),
  isAdmin: loadUserFromStorage()?.role === "admin",
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = !!token
      state.isAdmin = user?.role === "admin"
      state.error = null

      if (user && token) {
        localStorage.setItem("shopsphere_user", JSON.stringify(user))
        localStorage.setItem("shopsphere_token", token)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isAdmin = false
      state.error = null
      localStorage.removeItem("shopsphere_user")
      localStorage.removeItem("shopsphere_token")
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
    }
  }
})

export const { setCredentials, logout, setAuthLoading, setAuthError } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsAdmin = (state) => state.auth.isAdmin

export default authSlice.reducer

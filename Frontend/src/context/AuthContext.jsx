import React, { createContext, useContext } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  setCredentials as setCredentialsAction,
  logout as logoutAction,
  setAuthLoading as setAuthLoadingAction,
  setAuthError as setAuthErrorAction,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin
} from "../redux/slices/authSlice"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const token = useSelector((state) => state.auth.token)
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)

  const register = async (userData) => {
    dispatch(setAuthLoadingAction(true))
    dispatch(setAuthErrorAction(null))
    try {
      const res = await authAPI.register(userData)
      dispatch(setAuthLoadingAction(false))
      return res
    } catch (err) {
      dispatch(setAuthErrorAction(err.message))
      dispatch(setAuthLoadingAction(false))
      throw err
    }
  }

  const verifyEmail = async (email, otp) => {
    dispatch(setAuthLoadingAction(true))
    dispatch(setAuthErrorAction(null))
    try {
      const res = await authAPI.verifyEmail({ email, otp })
      const userObj = res.user || res
      const tokenVal = userObj.token || res.token

      if (tokenVal) {
        const parsedUser = {
          id: userObj._id || userObj.id,
          name: userObj.name || email.split("@")[0],
          email: userObj.email || email,
          role: userObj.role || "user"
        }
        dispatch(setCredentialsAction({ user: parsedUser, token: tokenVal }))
      }
      dispatch(setAuthLoadingAction(false))
      return userObj
    } catch (err) {
      dispatch(setAuthErrorAction(err.message))
      dispatch(setAuthLoadingAction(false))
      throw err
    }
  }

  const resendOTP = async (email) => {
    dispatch(setAuthLoadingAction(true))
    dispatch(setAuthErrorAction(null))
    try {
      const res = await authAPI.resendOTP(email)
      dispatch(setAuthLoadingAction(false))
      return res
    } catch (err) {
      dispatch(setAuthErrorAction(err.message))
      dispatch(setAuthLoadingAction(false))
      throw err
    }
  }

  const login = async (credentials) => {
    dispatch(setAuthLoadingAction(true))
    dispatch(setAuthErrorAction(null))
    try {
      const res = await authAPI.login(credentials)
      const userObj = res.user || res
      const tokenVal = userObj.token || res.token

      if (tokenVal) {
        const parsedUser = {
          id: userObj._id || userObj.id,
          name: userObj.name || credentials.email.split("@")[0],
          email: userObj.email || credentials.email,
          role: userObj.role || "user"
        }
        dispatch(setCredentialsAction({ user: parsedUser, token: tokenVal }))
      }
      dispatch(setAuthLoadingAction(false))
      return userObj
    } catch (err) {
      dispatch(setAuthErrorAction(err.message))
      dispatch(setAuthLoadingAction(false))
      throw err
    }
  }

  const loginWithGoogle = () => {
    const mockUser = {
      id: "usr_google_1",
      name: "Vaibhav Pokhriyal",
      email: "vaibhav@shopsphere.in",
      role: "user"
    }
    const mockToken = "jwt_google_token_" + Date.now()
    dispatch(setCredentialsAction({ user: mockUser, token: mockToken }))
    return mockUser
  }

  const logout = async () => {
    await authAPI.logout()
    dispatch(logoutAction())
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        register,
        verifyEmail,
        resendOTP,
        login,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

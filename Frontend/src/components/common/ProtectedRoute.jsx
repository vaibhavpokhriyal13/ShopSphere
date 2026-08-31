import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

/**
 * ProtectedRoute Gate
 * Strictly requires authentication before rendering child components.
 * If unauthenticated, immediately redirects to /login with the target URL preserved.
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="stitch-loader" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnPath = location.pathname === "/" ? "" : `?redirect=${encodeURIComponent(location.pathname + location.search)}`
    return <Navigate to={`/login${returnPath}`} replace />
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

import React, { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "../../styles/auth.css"

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/profile"

  const { login, loginWithGoogle, verifyEmail, resendOTP, isAuthenticated, user, loading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState("")

  // OTP Verification state if unverified user attempts to log in
  const [needsVerification, setNeedsVerification] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpMsg, setOtpMsg] = useState("")

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" && redirectUrl === "/profile") {
        navigate("/admin")
      } else {
        navigate(redirectUrl)
      }
    }
  }, [isAuthenticated, user, navigate, redirectUrl])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")
    setOtpMsg("")
    try {
      const loggedUser = await login(formData)
      if (loggedUser.role === "admin" && redirectUrl === "/profile") {
        navigate("/admin")
      } else {
        navigate(redirectUrl)
      }
    } catch (err) {
      const errMsg = err.message || "Invalid email or password"
      setLocalError(errMsg)
      if (errMsg.toLowerCase().includes("verify your email")) {
        setNeedsVerification(true)
      }
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLocalError("")
    setOtpMsg("")
    try {
      const loggedUser = await verifyEmail(formData.email, otpCode)
      if (loggedUser.role === "admin" && redirectUrl === "/profile") {
        navigate("/admin")
      } else {
        navigate(redirectUrl)
      }
    } catch (err) {
      setLocalError(err.message || "Invalid OTP code")
    }
  }

  const handleResendOTP = async () => {
    setLocalError("")
    try {
      await resendOTP(formData.email)
      setOtpMsg("A new 6-digit OTP code has been sent to your email.")
    } catch (err) {
      setLocalError(err.message || "Failed to resend code")
    }
  }

  const handleGoogleLogin = () => {
    const loggedUser = loginWithGoogle()
    if (loggedUser.role === "admin" && redirectUrl === "/profile") {
      navigate("/admin")
    } else {
      navigate(redirectUrl)
    }
  }

  return (
    <div className="stitch-auth-page">
      <main className="stitch-auth-main">
        {/* Left Column: Authentication Form */}
        <div className="stitch-auth-form-col">
          <div className="stitch-auth-inner-box">
            {/* Brand Anchor */}
            <div>
              <Link to="/" className="stitch-auth-brand">
                SHOPSPHERE
              </Link>
            </div>

            {/* Welcome Text */}
            <div style={{ marginBottom: "2rem" }}>
              <h2 className="stitch-auth-heading">
                {needsVerification ? "Verify Your Email" : "Welcome Back"}
              </h2>
              <p className="stitch-auth-subheading">
                {needsVerification
                  ? `Please enter the 6-digit OTP sent to ${formData.email} to complete verification.`
                  : redirectUrl === "/checkout"
                  ? "Please sign in to complete your checkout and delivery."
                  : "Enter your details to access your curated selections."}
              </p>
            </div>

            {/* Error / Info banner */}
            {(error || localError) && (
              <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "14px", marginBottom: "1.5rem" }}>
                {localError || error}
              </div>
            )}
            {otpMsg && (
              <div style={{ background: "#dcfce7", color: "#15803d", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "14px", marginBottom: "1.5rem" }}>
                {otpMsg}
              </div>
            )}

            {/* If user needs OTP verification */}
            {needsVerification ? (
              <form onSubmit={handleVerifyOTP}>
                <div className="stitch-auth-field">
                  <label className="stitch-auth-label" htmlFor="otpCode">
                    6-DIGIT OTP CODE
                  </label>
                  <input
                    id="otpCode"
                    type="text"
                    maxLength="6"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="• • • • • •"
                    className="stitch-auth-input"
                    style={{ letterSpacing: "0.2em", fontSize: "18px", textAlign: "center" }}
                  />

                </div>

                <button type="submit" disabled={loading} className="stitch-auth-submit-btn">
                  {loading ? "VERIFYING..." : "VERIFY & SIGN IN"}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem", fontSize: "13px" }}>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    style={{ background: "none", border: "none", color: "#000", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNeedsVerification(false)
                      setLocalError("")
                    }}
                    style={{ background: "none", border: "none", color: "#5d5f5f", cursor: "pointer" }}
                  >
                    Back to Password Login
                  </button>
                </div>
              </form>
            ) : (
              /* Standard Login Form */
              <form onSubmit={handleSubmit}>
                <div className="stitch-auth-field">
                  <label className="stitch-auth-label" htmlFor="email">
                    EMAIL
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.in"
                    className="stitch-auth-input"
                  />
                </div>

                <div className="stitch-auth-field">
                  <div className="stitch-auth-label-row">
                    <label className="stitch-auth-label" htmlFor="password" style={{ marginBottom: 0 }}>
                      PASSWORD
                    </label>
                  </div>
                  <div className="stitch-auth-input-wrap">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="stitch-auth-input"
                      style={{ paddingRight: "3.5rem" }}
                    />
                    <button
                      type="button"
                      className="stitch-auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="stitch-auth-submit-btn">
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </form>
            )}

            {!needsVerification && (
              <>
                {/* Divider */}
                <div className="stitch-auth-divider">
                  <div className="stitch-auth-divider-line" />
                  <span className="stitch-auth-divider-text">OR</span>
                  <div className="stitch-auth-divider-line" />
                </div>

                {/* Social Login: Google */}
                <div className="stitch-auth-social-stack">
                  <button
                    type="button"
                    className="stitch-auth-social-btn"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5" style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    CONTINUE WITH GOOGLE
                  </button>
                </div>

                <div className="stitch-auth-footer-link">
                  Don't have an account?{" "}
                  <Link to={redirectUrl !== "/profile" ? `/register?redirect=${redirectUrl}` : "/register"}>
                    Create one
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Showcase Panel */}
        <div className="stitch-auth-showcase-col">
          <div className="stitch-showcase-bg-img" />

          {/* Floating Glassmorphism Card */}
          <div className="stitch-glass-showcase-card">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "48px", color: "#000000", marginBottom: "1.5rem" }}
            >
              diamond
            </span>
            <h3 className="stitch-showcase-card-title">
              Elevate Your Shopping Journey.
            </h3>
            <p className="stitch-showcase-card-desc">
              Experience a curated selection of premium goods, designed for the discerning individual across India. Less, but better.
            </p>

            {/* Mini UI Mockup */}
            <div className="stitch-showcase-mockup-bar">
              <div className="stitch-showcase-mock-icon">
                <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#5d5f5f" }}>
                  shopping_bag
                </span>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ height: "14px", width: "75%", backgroundColor: "#e2e2e2", borderRadius: "4px", marginBottom: "8px" }} />
                <div style={{ height: "10px", width: "50%", backgroundColor: "#cfc4c5", borderRadius: "4px" }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Login

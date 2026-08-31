import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "../../styles/auth.css"

const Register = () => {
  const navigate = useNavigate()
  const { register, verifyEmail, loading, error } = useAuth()

  const [step, setStep] = useState(1) // 1 = Form, 2 = OTP Verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [localMsg, setLocalMsg] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Step 1: Register and trigger OTP
  const handleRegister = async (e) => {
    e.preventDefault()
    setLocalMsg("")
    try {
      await register(formData)
      setStep(2)
    } catch (err) {
      setLocalMsg(err.message || "Registration failed")
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLocalMsg("")
    try {
      await verifyEmail(formData.email, otp)
      navigate("/profile")
    } catch (err) {
      setLocalMsg(err.message || "Invalid OTP verification code")
    }
  }

  return (
    <div className="stitch-auth-page">
      <main className="stitch-auth-main">
        {/* Left Column: Register / OTP Form */}
        <div className="stitch-auth-form-col">
          <div className="stitch-auth-inner-box">
            {/* Brand Anchor */}
            <div>
              <Link to="/" className="stitch-auth-brand">
                SHOPSPHERE
              </Link>
            </div>

            {step === 1 ? (
              <>
                {/* Title Block */}
                <div style={{ marginBottom: "2rem" }}>
                  <h2 className="stitch-auth-heading">Create Account</h2>
                  <p className="stitch-auth-subheading">
                    Join the collective for private drops and global tracking.
                  </p>
                </div>

                {/* Error Banner */}
                {(error || localMsg) && (
                  <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "14px", marginBottom: "1.5rem" }}>
                    {error || localMsg}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleRegister}>
                  <div className="stitch-auth-field">
                    <label className="stitch-auth-label" htmlFor="name">
                      FULL NAME
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alex Morgan"
                      className="stitch-auth-input"
                    />
                  </div>

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
                      placeholder="name@example.com"
                      className="stitch-auth-input"
                    />
                  </div>

                  <div className="stitch-auth-field">
                    <label className="stitch-auth-label" htmlFor="password">
                      PASSWORD
                    </label>
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
                    {loading ? "CREATING..." : "CREATE ACCOUNT"}
                  </button>
                </form>

                {/* Divider */}
                <div className="stitch-auth-divider">
                  <div className="stitch-auth-divider-line" />
                  <span className="stitch-auth-divider-text">OR</span>
                  <div className="stitch-auth-divider-line" />
                </div>

                {/* Google Sign In Shortcut */}
                <div className="stitch-auth-social-stack">
                  <button
                    type="button"
                    className="stitch-auth-social-btn"
                    onClick={() => navigate("/profile")}
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
                  Already have an account? <Link to="/login">Sign in</Link>
                </div>
              </>
            ) : (
              /* Step 2: OTP Verification */
              <div>
                <div style={{ marginBottom: "2rem" }}>
                  <h2 className="stitch-auth-heading">Verify Email</h2>
                  <p className="stitch-auth-subheading">
                    We sent a 6-digit verification code to <strong>{formData.email}</strong>.
                  </p>
                </div>

                {(error || localMsg) && (
                  <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "14px", marginBottom: "1.5rem" }}>
                    {error || localMsg}
                  </div>
                )}

                <form onSubmit={handleVerifyOTP}>
                  <div className="stitch-auth-field">
                    <label className="stitch-auth-label" htmlFor="otp">
                      ENTER OTP CODE
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="stitch-auth-input"
                      style={{ letterSpacing: "0.2em", fontSize: "18px", textAlign: "center" }}
                    />

                  </div>

                  <button type="submit" disabled={loading} className="stitch-auth-submit-btn">
                    {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
                  </button>
                </form>

                <div className="stitch-auth-footer-link">
                  Didn't receive code?{" "}
                  <button
                    onClick={() => setLocalMsg("New code resent!")}
                    style={{ background: "none", border: "none", color: "#000", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
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
              Join The ShopSphere Club.
            </h3>
            <p className="stitch-showcase-card-desc">
              Enjoy private member sales, early drop alerts, and bespoke white-glove customer care.
            </p>

            <div className="stitch-showcase-mockup-bar">
              <div className="stitch-showcase-mock-icon">
                <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#5d5f5f" }}>
                  card_membership
                </span>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ height: "14px", width: "70%", backgroundColor: "#e2e2e2", borderRadius: "4px", marginBottom: "8px" }} />
                <div style={{ height: "10px", width: "40%", backgroundColor: "#cfc4c5", borderRadius: "4px" }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Register

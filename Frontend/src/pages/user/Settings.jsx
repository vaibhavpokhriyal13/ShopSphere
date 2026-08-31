import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { userAPI } from "../../services/api"
import "../../styles/pages.css"

const Settings = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth()
  const { showToast } = useToast()

  // Profile Form
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  // Notifications
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [newDrops, setNewDrops] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/settings")
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setPhone(user.phone || "")
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert("Name is required.")
      return
    }

    setSavingProfile(true)
    try {
      const res = await userAPI.updateProfile({ name, phone })
      if (updateUser) {
        updateUser({ ...user, name, phone })
      }
      showToast(null, "Profile information updated successfully")
    } catch (err) {
      alert(err.message || "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      alert("Please enter current and new passwords.")
      return
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.")
      return
    }

    setChangingPassword(true)
    try {
      await userAPI.changePassword({ currentPassword, newPassword })
      showToast(null, "Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      alert(err.message || "Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Header */}
      <section className="stitch-hero">
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <Link to="/profile" className="stitch-breadcrumb-link">Account</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <span className="stitch-breadcrumb-current">Settings</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          PREFERENCES &amp; SECURITY
        </div>

        <h1 className="stitch-hero-title">
          Account Settings
        </h1>

        <p className="stitch-hero-desc">
          Update personal details, change security credentials, and manage notification preferences.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", marginBottom: "4rem" }}>
        {/* Profile Details */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.08)", padding: "1.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px", color: "#000" }}>
            Personal Profile
          </h2>
          <p style={{ fontSize: "13px", color: "#5d5f5f", marginBottom: "1.5rem" }}>
            Your basic contact information used on invoices and delivery packages.
          </p>

          <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#f4f4f5", color: "#71717a" }}
              />
              <span style={{ fontSize: "11px", color: "#8c8e8e", marginTop: "2px", display: "block" }}>
                Email address is verified and permanently linked to this account.
              </span>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="stitch-checkout-btn"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {savingProfile ? "Saving..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Security & Password */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.08)", padding: "1.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px", color: "#000" }}>
            Security &amp; Password
          </h2>
          <p style={{ fontSize: "13px", color: "#5d5f5f", marginBottom: "1.5rem" }}>
            Ensure your account is protected with a strong, distinct password.
          </p>

          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                New Password (Min 6 Characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="stitch-checkout-btn"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {changingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Notifications & Logout */}
        <div style={{ gridColumn: "1 / -1", background: "#fafafa", borderRadius: "16px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Communication Preferences</h3>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "8px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#18181b", cursor: "pointer" }}>
                <input type="checkbox" checked={orderUpdates} onChange={e => setOrderUpdates(e.target.checked)} />
                Order tracking and invoice notifications via email
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#18181b", cursor: "pointer" }}>
                <input type="checkbox" checked={newDrops} onChange={e => setNewDrops(e.target.checked)} />
                Curated quarterly lookbooks &amp; early drop access
              </label>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="stitch-filter-pill"
            style={{ color: "#b91c1c", borderColor: "#fecaca", padding: "0.6rem 1.4rem" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
            <span>Sign Out of ShopSphere</span>
          </button>
        </div>
      </div>
    </main>
  )
}

export default Settings

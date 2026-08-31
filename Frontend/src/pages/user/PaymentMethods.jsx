import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { userAPI } from "../../services/api"
import "../../styles/pages.css"

const PaymentMethods = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { showToast } = useToast()

  const [preferredMethod, setPreferredMethod] = useState("UPI")
  const [upiId, setUpiId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/payment-methods")
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true)
      try {
        const data = await userAPI.getPaymentPreferences()
        if (data) {
          setPreferredMethod(data.preferredMethod || "UPI")
          setUpiId(data.upiId || "")
        }
      } catch (err) {
        console.error("Error fetching payment preferences:", err)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchPreferences()
    }
  }, [isAuthenticated])

  const handleSavePreferences = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userAPI.updatePaymentPreferences({ preferredMethod, upiId })
      showToast(null, "Payment preferences updated successfully")
    } catch (err) {
      alert(err.message || "Failed to update payment preferences")
    } finally {
      setSaving(false)
    }
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
          <span className="stitch-breadcrumb-current">Payment Methods</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          CHECKOUT PREFERENCES
        </div>

        <h1 className="stitch-hero-title">
          Payment Methods
        </h1>

        <p className="stitch-hero-desc">
          Manage your preferred checkout rails and tokenized payment modes powered securely by Razorpay.
        </p>
      </section>

      {/* Security Banner */}
      <div
        style={{
          background: "#f4f4f5",
          borderRadius: "16px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          border: "1px solid rgba(0,0,0,0.06)"
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#15803d" }}>
          verified_user
        </span>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 2px", color: "#000" }}>
            PCI-DSS Level 1 Certified Security
          </h3>
          <p style={{ fontSize: "12px", color: "#5d5f5f", margin: 0, lineHeight: 1.4 }}>
            ShopSphere complies with RBI regulations and does not store raw credit card numbers or CVVs. All sensitive tokenization is managed through Razorpay’s encrypted payment gateway.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
        {/* Preferred Payment Settings */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.08)", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px", color: "#000" }}>
            Default Payment Preferences
          </h2>
          <p style={{ fontSize: "13px", color: "#5d5f5f", marginBottom: "1.5rem" }}>
            Select your preferred payment method to streamline the one-click checkout flow.
          </p>

          <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "8px" }}>
                Primary Checkout Method
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { id: "UPI", title: "UPI (Google Pay, PhonePe, Paytm, BHIM)", desc: "Instant zero-friction UPI authorization" },
                  { id: "CARD", title: "Credit / Debit Cards", desc: "Visa, Mastercard, RuPay & Amex supported" },
                  { id: "NETBANKING", title: "NetBanking", desc: "50+ Indian banks including HDFC, ICICI, SBI" },
                  { id: "COD", title: "Cash on Delivery", desc: "Pay cash upon doorstep package handover" }
                ].map(mode => (
                  <label
                    key={mode.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: preferredMethod === mode.id ? "#000" : "#e5e5e5",
                      background: preferredMethod === mode.id ? "#f9fafb" : "#fff",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={preferredMethod === mode.id}
                      onChange={() => setPreferredMethod(mode.id)}
                      style={{ marginTop: "3px" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>{mode.title}</div>
                      <div style={{ fontSize: "12px", color: "#5d5f5f" }}>{mode.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {preferredMethod === "UPI" && (
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "6px" }}>
                  Saved UPI VPA Handle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. mobile@okhdfcbank or user@paytm"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="stitch-checkout-btn"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {saving ? "Saving Preferences..." : "Save Payment Preferences"}
            </button>
          </form>
        </div>

        {/* Accepted Payment Rails */}
        <div style={{ background: "#fafafa", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "#000" }}>
              Accepted Payment Instruments
            </h2>
            <p style={{ fontSize: "13px", color: "#5d5f5f", margin: 0, lineHeight: 1.5 }}>
              All transactions on ShopSphere India are encrypted with 256-bit SSL protection and routed via RBI-authorized payment aggregators.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e5e5" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>qr_code_scanner</span>
              <div>
                <strong style={{ fontSize: "13px", display: "block" }}>Instant UPI Collect &amp; QR</strong>
                <span style={{ fontSize: "12px", color: "#5d5f5f" }}>Zero convenience charges across all UPI apps</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e5e5" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>credit_card</span>
              <div>
                <strong style={{ fontSize: "13px", display: "block" }}>Domestic &amp; International Cards</strong>
                <span style={{ fontSize: "12px", color: "#5d5f5f" }}>3D Secure OTP authentication enabled</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e5e5" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>local_shipping</span>
              <div>
                <strong style={{ fontSize: "13px", display: "block" }}>Pay on Delivery (Cash / UPI)</strong>
                <span style={{ fontSize: "12px", color: "#5d5f5f" }}>Available across 24,000+ PIN codes in India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentMethods

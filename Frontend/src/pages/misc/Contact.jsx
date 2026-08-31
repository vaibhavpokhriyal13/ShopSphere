import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { contactAPI } from "../../services/api"
import "../../styles/pages.css"

const Contact = () => {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "Order Status / Inquiries",
    message: ""
  })

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    try {
      const res = await contactAPI.sendMessage(formData)
      setSuccessMsg(res.message || "Your message has been sent successfully. We will reply within 24 hours.")
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        subject: "Order Status / Inquiries",
        message: ""
      })
    } catch (err) {
      setErrorMsg(err.message || "Failed to send message. Please try again or email support@shopsphere.in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Header */}
      <section className="stitch-hero">
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <span className="stitch-breadcrumb-current">Contact Us</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          DIRECT ASSISTANCE
        </div>

        <h1 className="stitch-hero-title">
          Contact Customer Care
        </h1>

        <p className="stitch-hero-desc">
          Have questions regarding an upcoming order, enterprise procurement, or technical product specifications? Reach out below.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", marginBottom: "4rem" }}>
        {/* Form Container */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.08)", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 6px", color: "#000" }}>
            Send us a message
          </h2>
          <p style={{ fontSize: "13px", color: "#5d5f5f", marginBottom: "1.5rem" }}>
            Our concierge team in Bengaluru responds to all queries Monday through Saturday, 9 AM – 7 PM IST.
          </p>

          {successMsg && (
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "1rem", borderRadius: "10px", fontSize: "14px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "1rem", borderRadius: "10px", fontSize: "14px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Topic / Subject *
              </label>
              <select
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px", background: "#fff" }}
              >
                <option value="Order Status / Inquiries">Order Status &amp; Tracking</option>
                <option value="Returns & Refunds">Returns &amp; Refunds</option>
                <option value="Product Details & Warranty">Product Details &amp; Warranty Claim</option>
                <option value="Corporate & Bulk Gifting">Corporate &amp; Bulk Gifting</option>
                <option value="Press & Collaborations">Press &amp; Collaborations</option>
                <option value="Other Inquiries">Other Inquiries</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", display: "block", marginBottom: "4px" }}>
                Your Message *
              </label>
              <textarea
                rows={5}
                required
                placeholder="How can we assist you?"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="stitch-checkout-btn"
              style={{ width: "100%", padding: "0.85rem" }}
            >
              {submitting ? "Sending Message..." : "Submit Message"}
            </button>
          </form>
        </div>

        {/* Info Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "#f9fafb", borderRadius: "16px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#000", marginBottom: "8px" }}>
              schedule
            </span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>Operating Hours</h3>
            <p style={{ fontSize: "13px", color: "#5d5f5f", lineHeight: 1.5, margin: 0 }}>
              Monday to Saturday: 9:00 AM – 7:00 PM IST<br />
              Sunday: 10:00 AM – 4:00 PM IST<br />
              Standard Email Response Time: &le; 24 business hours.
            </p>
          </div>

          <div style={{ background: "#f9fafb", borderRadius: "16px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#000", marginBottom: "8px" }}>
              business
            </span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>Corporate Headquarters</h3>
            <p style={{ fontSize: "13px", color: "#5d5f5f", lineHeight: 1.5, margin: 0 }}>
              ShopSphere Private Limited<br />
              100 Feet Road, HAL 2nd Stage, Indiranagar<br />
              Bengaluru, Karnataka 560038, India
            </p>
          </div>

          <div style={{ background: "#f9fafb", borderRadius: "16px", padding: "1.75rem", border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#000", marginBottom: "8px" }}>
              verified
            </span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>Enterprise &amp; B2B Enquiries</h3>
            <p style={{ fontSize: "13px", color: "#5d5f5f", lineHeight: 1.5, margin: 0 }}>
              For custom corporate branding, bulk luggage procurement, or studio acoustic installations, email <strong>enterprise@shopsphere.in</strong>.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Contact

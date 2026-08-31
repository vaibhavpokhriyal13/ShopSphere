import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { userAPI } from "../../services/api"
import "../../styles/pages.css"

const Addresses = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { showToast } = useToast()

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    isDefault: false
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/addresses")
    }
  }, [isAuthenticated, authLoading, navigate])

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const data = await userAPI.getAddresses()
      setAddresses(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching addresses:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses()
    }
  }, [isAuthenticated])

  const openAddModal = () => {
    setEditingAddress(null)
    setFormData({
      fullName: "",
      phone: "",
      street: "",
      apartment: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      isDefault: addresses.length === 0
    })
    setModalOpen(true)
  }

  const openEditModal = (addr) => {
    setEditingAddress(addr)
    setFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      apartment: addr.apartment || "",
      city: addr.city || "",
      state: addr.state || "",
      pinCode: addr.pinCode || "",
      country: addr.country || "India",
      isDefault: addr.isDefault || false
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pinCode) {
      alert("Please fill in all required address fields.")
      return
    }

    setSubmitting(true)
    try {
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress._id, formData)
        showToast(null, "Address updated successfully")
      } else {
        await userAPI.addAddress(formData)
        showToast(null, "New address added successfully")
      }
      setModalOpen(false)
      fetchAddresses()
    } catch (err) {
      alert(err.message || "Failed to save address")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return
    try {
      await userAPI.deleteAddress(id)
      showToast(null, "Address removed")
      fetchAddresses()
    } catch (err) {
      alert(err.message || "Failed to delete address")
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await userAPI.setDefaultAddress(id)
      showToast(null, "Default delivery address updated")
      fetchAddresses()
    } catch (err) {
      alert(err.message || "Failed to set default address")
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
          <span className="stitch-breadcrumb-current">Addresses</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          DELIVERY DIRECTORY
        </div>

        <h1 className="stitch-hero-title">
          Saved Addresses
        </h1>

        <p className="stitch-hero-desc">
          Manage your verified home, office, and secondary shipping destinations across India.
        </p>
      </section>

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: "1rem" }}>
        <span style={{ fontSize: "13px", color: "#5d5f5f", fontWeight: 600 }}>
          {addresses.length} {addresses.length === 1 ? "Saved Address" : "Saved Addresses"}
        </span>

        <button
          onClick={openAddModal}
          className="stitch-sort-pill"
          style={{ padding: "0.5rem 1.25rem" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#5d5f5f" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "36px", animation: "spin 1s linear infinite" }}>
            sync
          </span>
          <p style={{ marginTop: "1rem", fontWeight: 600 }}>Loading saved addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon">location_off</span>
          <h2 className="stitch-empty-title">No saved addresses</h2>
          <p className="stitch-empty-desc">
            Add your primary shipping destination for lightning-fast checkout on all upcoming drops.
          </p>
          <button onClick={openAddModal} className="stitch-checkout-btn" style={{ maxWidth: "220px" }}>
            Add an Address
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
          {addresses.map((addr) => (
            <div
              key={addr._id}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: addr.isDefault ? "2px solid #000000" : "1px solid rgba(0,0,0,0.08)",
                padding: "1.5rem",
                boxShadow: addr.isDefault ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)",
                position: "relative",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Default Badge */}
              {addr.isDefault && (
                <div style={{ position: "absolute", top: "14px", right: "14px" }}>
                  <span
                    style={{
                      background: "#000000",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: "9999px"
                    }}
                  >
                    Default
                  </span>
                </div>
              )}

              <div style={{ fontSize: "16px", fontWeight: 700, color: "#000", marginBottom: "4px" }}>
                {addr.fullName}
              </div>
              <div style={{ fontSize: "13px", color: "#5d5f5f", marginBottom: "1rem" }}>
                📞 {addr.phone}
              </div>

              <div style={{ fontSize: "14px", color: "#18181b", lineHeight: 1.55, flexGrow: 1, marginBottom: "1.5rem" }}>
                {addr.street} {addr.apartment ? `, ${addr.apartment}` : ""}<br />
                {addr.city}, {addr.state} - <strong>{addr.pinCode}</strong><br />
                {addr.country || "India"}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => openEditModal(addr)}
                    style={{ background: "none", border: "none", fontSize: "13px", fontWeight: 600, color: "#000", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    style={{ background: "none", border: "none", fontSize: "13px", fontWeight: 600, color: "#e11d48", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="stitch-filter-pill"
                    style={{ fontSize: "11px", padding: "4px 10px" }}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="stitch-mobile-filter-modal" onClick={() => setModalOpen(false)}>
          <div
            className="stitch-mobile-filter-sheet"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "560px", margin: "auto", borderRadius: "20px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: "1rem" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                {editingAddress ? "Edit Address" : "Add Delivery Address"}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#5d5f5f", display: "block", marginBottom: "4px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#5d5f5f", display: "block", marginBottom: "4px" }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#5d5f5f", display: "block", marginBottom: "4px" }}>
                  Street Address / House No. *
                </label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#5d5f5f", display: "block", marginBottom: "4px" }}>
                  Apartment, Suite, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.apartment}
                  onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#5d5f5f", display: "block", marginBottom: "4px" }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#5d5f5f", display: "block", marginBottom: "4px" }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#5d5f5f", display: "block", marginBottom: "4px" }}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                <label htmlFor="isDefault" style={{ fontSize: "13px", fontWeight: 600, color: "#000", cursor: "pointer" }}>
                  Make this my default shipping address
                </label>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="stitch-filter-pill"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="stitch-checkout-btn"
                  style={{ flex: 2 }}
                >
                  {submitting ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Addresses

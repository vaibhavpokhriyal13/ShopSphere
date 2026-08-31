import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useWishlist } from "../../context/WishlistContext"
import { orderAPI, userAPI } from "../../services/api"
import "../../styles/pages.css"

const Profile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { wishlistCount } = useWishlist()

  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [paymentPrefs, setPaymentPrefs] = useState({ preferredMethod: "UPI", upiId: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/profile")
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return
      setLoading(true)
      try {
        const [ordersData, addressesData, prefsData] = await Promise.all([
          orderAPI.getMyOrders().catch(() => []),
          userAPI.getAddresses().catch(() => []),
          userAPI.getPaymentPreferences().catch(() => ({ preferredMethod: "UPI" }))
        ])
        setOrders(Array.isArray(ordersData) ? ordersData : [])
        setAddresses(Array.isArray(addressesData) ? addressesData : [])
        if (prefsData) setPaymentPrefs(prefsData)
      } catch (err) {
        console.error("Dashboard data load error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SP"

  if (!isAuthenticated) return null

  const latestOrder = orders.length > 0 ? orders[0] : null

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Breadcrumb Header */}
      <section className="stitch-hero" style={{ marginBottom: "2rem" }}>
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <span className="stitch-breadcrumb-current">My Account</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          MEMBER DASHBOARD
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                backgroundColor: "#000000",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
              }}
            >
              {initials}
            </div>
            <div>
              <h1 className="stitch-hero-title" style={{ fontSize: "32px", margin: "0 0 4px" }}>
                {user?.name || "Valued Member"}
              </h1>
              <p style={{ color: "#5d5f5f", fontSize: "14px", margin: 0 }}>
                {user?.email} • {user?.role === "admin" ? "Store Administrator" : "ShopSphere India Member"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="stitch-sort-pill"
                style={{ background: "#e11d48", borderColor: "#e11d48", textDecoration: "none" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>admin_panel_settings</span>
                <span>Admin Panel</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="stitch-filter-pill"
              style={{ color: "#b91c1c", borderColor: "#fecaca" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </section>

      {/* Account Overview Stats Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        <Link
          to="/orders"
          style={{ textDecoration: "none", color: "inherit", background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px", transition: "transform 0.2s" }}
        >
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#000" }}>package_2</span>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#8c8e8e", textTransform: "uppercase" }}>Total Orders</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#000" }}>{orders.length}</div>
          </div>
        </Link>

        <Link
          to="/wishlist"
          style={{ textDecoration: "none", color: "inherit", background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px", transition: "transform 0.2s" }}
        >
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#e11d48" }}>favorite</span>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#8c8e8e", textTransform: "uppercase" }}>Saved Items</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#000" }}>{wishlistCount}</div>
          </div>
        </Link>

        <Link
          to="/addresses"
          style={{ textDecoration: "none", color: "inherit", background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px", transition: "transform 0.2s" }}
        >
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#000" }}>location_on</span>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#8c8e8e", textTransform: "uppercase" }}>Saved Addresses</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#000" }}>{addresses.length}</div>
          </div>
        </Link>

        <Link
          to="/payment-methods"
          style={{ textDecoration: "none", color: "inherit", background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px", transition: "transform 0.2s" }}
        >
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#000" }}>payment</span>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#8c8e8e", textTransform: "uppercase" }}>Default Pay</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#000" }}>{paymentPrefs.preferredMethod || "UPI"}</div>
          </div>
        </Link>
      </section>

      {/* Main Account Navigation Hub */}
      <h2 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#000", marginBottom: "1rem" }}>
        Account Management
      </h2>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "3.5rem" }}>
        {[
          { title: "My Orders", desc: "Track shipments, invoices, and reorders", icon: "package_2", link: "/orders" },
          { title: "Wishlist / Saved Items", desc: `View and move ${wishlistCount} saved essentials to bag`, icon: "favorite_border", link: "/wishlist" },
          { title: "Saved Addresses", desc: "Manage home & office delivery destinations", icon: "location_on", link: "/addresses" },
          { title: "Payment Methods", desc: "Manage UPI handles and payment preferences", icon: "payment", link: "/payment-methods" },
          { title: "Recently Viewed", desc: "Revisit past products and lookbooks", icon: "history", link: "/recently-viewed" },
          { title: "Help & Support", desc: "FAQs, tracking assistance, and warranty", icon: "help_outline", link: "/help" },
          { title: "Contact Us", desc: "Direct concierge line and enquiry form", icon: "mail", link: "/contact" },
          { title: "Account Settings", desc: "Update profile name, phone & change password", icon: "settings", link: "/settings" }
        ].map((tile, i) => (
          <Link
            key={i}
            to={tile.link}
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "14px",
              padding: "1.25rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              transition: "transform 0.2s ease, border-color 0.2s ease"
            }}
            className="stitch-account-tile"
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#000" }}>{tile.icon}</span>
            </div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px", color: "#000" }}>{tile.title}</h3>
              <p style={{ fontSize: "12px", color: "#5d5f5f", margin: 0, lineHeight: 1.4 }}>{tile.desc}</p>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#8c8e8e", alignSelf: "center" }}>
              arrow_forward
            </span>
          </Link>
        ))}
      </section>

      {/* Latest Order Preview */}
      {latestOrder && (
        <section style={{ background: "#f9fafb", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e" }}>Most Recent Purchase</span>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 0", color: "#000" }}>Order #{latestOrder._id?.slice(-8).toUpperCase()}</h3>
            </div>
            <Link to="/orders" style={{ fontSize: "13px", fontWeight: 700, color: "#000", textDecoration: "underline" }}>
              View All Orders &rarr;
            </Link>
          </div>

          <div style={{ fontSize: "13px", color: "#5d5f5f" }}>
            Total Amount: <strong>₹{Number(latestOrder.totalAmount || 0).toLocaleString("en-IN")}</strong> • Status: <span style={{ textTransform: "capitalize", fontWeight: 600, color: "#000" }}>{latestOrder.status || "Processing"}</span>
          </div>
        </section>
      )}
    </main>
  )
}

export default Profile

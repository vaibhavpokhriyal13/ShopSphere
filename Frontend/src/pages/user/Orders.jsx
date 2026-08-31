import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useToast } from "../../context/ToastContext"
import { orderAPI } from "../../services/api"
import "../../styles/pages.css"

const Orders = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all") // 'all' | 'active' | 'delivered' | 'cancelled'
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/orders")
    }
  }, [isAuthenticated, authLoading, navigate])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await orderAPI.getMyOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return
    setCancellingId(orderId)
    try {
      await orderAPI.cancelOrder(orderId)
      showToast(null, "Order cancelled successfully")
      fetchOrders()
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: "cancelled" }))
      }
    } catch (err) {
      alert(err.message || "Failed to cancel order")
    } finally {
      setCancellingId(null)
    }
  }

  const handleReorder = (order) => {
    if (!order.items || !order.items.length) return
    order.items.forEach(item => {
      addToCart({
        _id: item.product?._id || item.product || item._id,
        id: item.product?._id || item.product || item._id,
        name: item.name || item.product?.name || "Reordered Item",
        price: item.price || item.product?.price || 0,
        imageURL: item.product?.imageURL || item.product?.image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
      }, item.quantity || 1)
    })
    showToast(null, "Items added to your bag")
    navigate("/cart")
  }

  const filteredOrders = orders.filter(o => {
    if (activeTab === "active") return o.status === "pending" || o.status === "processing" || o.status === "shipped"
    if (activeTab === "delivered") return o.status === "delivered"
    if (activeTab === "cancelled") return o.status === "cancelled"
    return true
  })

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase()
    let bg = "#f4f4f5", color = "#18181b", label = "Pending"

    if (s === "delivered") {
      bg = "#ecfdf5"; color = "#047857"; label = "Delivered"
    } else if (s === "processing" || s === "shipped") {
      bg = "#eff6ff"; color = "#1d4ed8"; label = s === "shipped" ? "In Transit" : "Processing"
    } else if (s === "cancelled") {
      bg = "#fef2f2"; color = "#b91c1c"; label = "Cancelled"
    }

    return (
      <span
        style={{
          background: bg,
          color: color,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: "9999px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
        {label}
      </span>
    )
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
          <span className="stitch-breadcrumb-current">Orders</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          PURCHASE HISTORY
        </div>

        <h1 className="stitch-hero-title">
          My Orders
        </h1>

        <p className="stitch-hero-desc">
          Track packages, review invoice details, initiate returns, and reorder past essentials.
        </p>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "2rem", borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: "1rem" }}>
        {[
          { id: "all", label: `All Orders (${orders.length})` },
          { id: "active", label: "Active & In Transit" },
          { id: "delivered", label: "Delivered" },
          { id: "cancelled", label: "Cancelled" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="stitch-filter-pill"
            style={{
              background: activeTab === tab.id ? "#000000" : "#ffffff",
              color: activeTab === tab.id ? "#ffffff" : "#000000",
              borderColor: activeTab === tab.id ? "#000000" : "rgba(0,0,0,0.12)"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#5d5f5f" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "36px", animation: "spin 1s linear infinite" }}>
            sync
          </span>
          <p style={{ marginTop: "1rem", fontWeight: 600 }}>Loading your order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon">package_2</span>
          <h2 className="stitch-empty-title">You haven't placed any orders yet</h2>
          <p className="stitch-empty-desc">
            Explore our curated selection of travel luggage, everyday carry, and acoustic essentials.
          </p>
          <Link to="/shop" className="stitch-checkout-btn" style={{ maxWidth: "200px", textDecoration: "none" }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "4rem" }}>
          {filteredOrders.map(order => {
            const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
            const isCancellable = order.status === "pending" || order.status === "processing"

            return (
              <div
                key={order._id}
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}
              >
                {/* Order Card Top Bar */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#8c8e8e", textTransform: "uppercase", display: "block" }}>
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </span>
                    <span style={{ fontSize: "13px", color: "#5d5f5f" }}>
                      Placed on {dateStr}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {getStatusBadge(order.status)}
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#000" }}>
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <img
                        src={item.product?.imageURL || item.product?.image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80"}
                        alt={item.name}
                        style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", background: "#f4f4f5" }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>
                          {item.name || item.product?.name || "Product Item"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#5d5f5f" }}>
                          Qty: {item.quantity || 1} • ₹{(item.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1rem" }}>
                  <div style={{ fontSize: "12px", color: "#5d5f5f" }}>
                    Payment: <strong style={{ color: "#000" }}>{order.paymentMethod || "RAZORPAY"}</strong> ({order.paymentStatus || "paid"})
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {isCancellable && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                        className="stitch-filter-pill"
                        style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                      >
                        {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="stitch-filter-pill"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>replay</span>
                      <span>Reorder</span>
                    </button>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="stitch-sort-pill"
                      style={{ padding: "0.45rem 1rem" }}
                    >
                      <span>View Details</span>
                      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>visibility</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="stitch-mobile-filter-modal" onClick={() => setSelectedOrder(null)}>
          <div
            className="stitch-mobile-filter-sheet"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "600px", margin: "auto", borderRadius: "20px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                  Order Details
                </h3>
                <span style={{ fontSize: "12px", color: "#8c8e8e" }}>
                  Order #{selectedOrder._id}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Status Timeline */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e" }}>Current Status</span>
                <div style={{ marginTop: "4px" }}>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e" }}>Delivery Partner</span>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#000", marginTop: "4px" }}>Bluedart Express</div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", marginBottom: "6px" }}>
                Shipping Address
              </div>
              <div style={{ fontSize: "13px", color: "#18181b", lineHeight: 1.5, background: "#fff", border: "1px solid #e5e5e5", borderRadius: "10px", padding: "10px 14px" }}>
                <strong>{selectedOrder.shippingDetails?.name || selectedOrder.user?.name || user?.name}</strong><br />
                {selectedOrder.address || selectedOrder.shippingDetails?.address}<br />
                {selectedOrder.city || selectedOrder.shippingDetails?.city}, {selectedOrder.state || selectedOrder.shippingDetails?.state} - {selectedOrder.pin || selectedOrder.shippingDetails?.pin}<br />
                Phone: {selectedOrder.phone || selectedOrder.shippingDetails?.phone}
              </div>
            </div>

            {/* Summary */}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Total Paid:</span>
              <span style={{ fontSize: "20px", fontWeight: 700 }}>₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}</span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setSelectedOrder(null)}
                className="stitch-checkout-btn"
                style={{ width: "100%" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Orders

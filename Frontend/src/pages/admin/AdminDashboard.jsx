import React, { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { productAPI, analyticsAPI, orderAPI } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import "../../styles/pages.css"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { showToast, addToast } = useToast()

  // Helper to trigger toast safely
  const triggerToast = (productOrTitle, customMsg) => {
    if (typeof showToast === "function") {
      showToast(productOrTitle, customMsg)
    } else if (typeof addToast === "function") {
      addToast({
        title: customMsg || "Notification",
        message: typeof productOrTitle === "object" ? productOrTitle.name : productOrTitle
      })
    }
  }

  // Guard admin route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/admin")
    }
  }, [isAuthenticated, navigate])

  const [activeTab, setActiveTab] = useState("products") // 'products' | 'orders' | 'analytics'
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("all")
  const [updatingOrderId, setUpdatingOrderId] = useState(null)


  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentProductId, setCurrentProductId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Delete confirmation
  const [deleteProductTarget, setDeleteProductTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form State
  const initialFormState = {
    name: "",
    brand: "ShopSphere",
    category: "Electronics",
    sku: "",
    price: "",
    originalPrice: "",
    discount: 0,
    countInStock: 20,
    status: "active",
    imageURL: "",
    additionalImages: "",
    description: "",
    featuresText: "",
    whatsInTheBoxText: "",
    shippingCharge: 0,
    freeShipping: true,
    estimatedDelivery: "2-4 business days",
    codAvailable: true,
    returnWindow: "7-Day Returns & Exchange",
    warranty: "1 Year Manufacturer Warranty"
  }
  const [formData, setFormData] = useState(initialFormState)

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodsData, statsData, ordersData] = await Promise.all([
        productAPI.getAll(),
        analyticsAPI.getDashboardStats(),
        orderAPI.getAll()
      ])
      setProducts(prodsData || [])
      setStats(statsData)
      setOrders(ordersData || [])
    } catch (err) {
      console.error("Error fetching admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Live Order Status Update Handler
  const handleUpdateOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
    try {
      setUpdatingOrderId(orderId)
      await orderAPI.updateStatus(orderId, newStatus, newPaymentStatus)
      setOrders((prev) =>
        prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            return {
              ...o,
              status: newStatus,
              ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {})
            }
          }
          return o
        })
      )
      triggerToast("Order Status", `Order #${orderId.toString().slice(-6).toUpperCase()} status updated to ${newStatus.toUpperCase()}`)
    } catch (err) {
      console.error("Failed to update order status:", err)
      triggerToast("Error", err.message || "Failed to update order status")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory =
        categoryFilter === "all" ||
        (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase())
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderId = (o._id || o.id || "").toString().toLowerCase()
      const customerName = (o.user?.name || o.shippingDetails?.name || "").toLowerCase()
      const customerEmail = (o.user?.email || o.shippingDetails?.email || "").toLowerCase()
      const customerPhone = (o.phone || o.shippingDetails?.phone || "").toLowerCase()

      const matchesSearch =
        !orderSearchTerm ||
        orderId.includes(orderSearchTerm.toLowerCase()) ||
        customerName.includes(orderSearchTerm.toLowerCase()) ||
        customerEmail.includes(orderSearchTerm.toLowerCase()) ||
        customerPhone.includes(orderSearchTerm.toLowerCase())

      const matchesStatus =
        orderStatusFilter === "all" ||
        (o.status && o.status.toLowerCase() === orderStatusFilter.toLowerCase())

      return matchesSearch && matchesStatus
    })
  }, [orders, orderSearchTerm, orderStatusFilter])


  // Open Create Modal
  const handleOpenCreateModal = () => {
    setIsEditMode(false)
    setCurrentProductId(null)
    setFormData(initialFormState)
    setFormError("")
    setIsModalOpen(true)
  }

  // Open Edit Modal with populated data
  const handleOpenEditModal = (product) => {
    setIsEditMode(true)
    setCurrentProductId(product._id || product.id)
    setFormError("")

    const featuresString = Array.isArray(product.features) ? product.features.join("\n") : ""
    const boxString = Array.isArray(product.whatsInTheBox) ? product.whatsInTheBox.join("\n") : ""
    const additionalImgs = Array.isArray(product.images)
      ? product.images.filter((img) => img !== product.imageURL).join("\n")
      : ""

    setFormData({
      name: product.name || "",
      brand: product.brand || "ShopSphere",
      category: product.category || "Electronics",
      sku: product.sku || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      discount: product.discount || 0,
      countInStock: product.countInStock !== undefined ? product.countInStock : 0,
      status: product.status || "active",
      imageURL: product.imageURL || "",
      additionalImages: additionalImgs,
      description: product.description || "",
      featuresText: featuresString,
      whatsInTheBoxText: boxString,
      shippingCharge: product.shippingInfo?.shippingCharge || 0,
      freeShipping: product.shippingInfo?.freeShipping ?? true,
      estimatedDelivery: product.shippingInfo?.estimatedDelivery || "2-4 business days",
      codAvailable: product.shippingInfo?.codAvailable ?? true,
      returnWindow: product.returnPolicy?.returnWindow || "7-Day Returns & Exchange",
      warranty: product.returnPolicy?.warranty || "1 Year Manufacturer Warranty"
    })
    setIsModalOpen(true)
  }

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  // Submit Product (Create or Update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    setFormError("")

    // Validation
    if (!formData.name.trim() || !formData.price || !formData.imageURL.trim() || !formData.description.trim()) {
      setFormError("Please fill in all required fields: Name, Price, Image URL, and Description.")
      return
    }

    setIsSubmitting(true)

    // Parse array inputs
    const features = formData.featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    const whatsInTheBox = formData.whatsInTheBoxText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    const extraImages = formData.additionalImages
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    const allImages = Array.from(new Set([formData.imageURL, ...extraImages].filter(Boolean)))

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim() || "ShopSphere",
      category: formData.category,
      sku: formData.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      discount: Number(formData.discount) || 0,
      countInStock: Number(formData.countInStock) || 0,
      status: formData.status,
      imageURL: formData.imageURL.trim(),
      images: allImages,
      description: formData.description.trim(),
      features,
      whatsInTheBox,
      shippingInfo: {
        shippingCharge: Number(formData.shippingCharge) || 0,
        freeShipping: Boolean(formData.freeShipping),
        estimatedDelivery: formData.estimatedDelivery,
        codAvailable: Boolean(formData.codAvailable),
        deliveryRegions: "Pan-India"
      },
      returnPolicy: {
        returnWindow: formData.returnWindow,
        warranty: formData.warranty,
        replacement: true
      }
    }

    try {
      if (isEditMode && currentProductId) {
        // Update product in MongoDB
        const res = await productAPI.update(currentProductId, payload)
        triggerToast(
          res.product || { name: formData.name, price: formData.price },
          "✓ Product Updated Successfully"
        )
      } else {
        // Create new product in MongoDB
        const res = await productAPI.create(payload)
        triggerToast(
          res.product || { name: formData.name, price: formData.price },
          "✓ Product Created Successfully"
        )
      }

      setIsModalOpen(false)
      fetchData() // Refresh list immediately from database
    } catch (err) {
      setFormError(err.message || "Failed to save product. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete product confirmation
  const handleConfirmDelete = async () => {
    if (!deleteProductTarget) return
    setIsDeleting(true)
    try {
      await productAPI.delete(deleteProductTarget._id || deleteProductTarget.id)
      triggerToast(deleteProductTarget, "✓ Product Deleted")
      setDeleteProductTarget(null)
      fetchData()
    } catch (err) {
      alert(err.message || "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5d5f5f", marginBottom: "4px" }}>
            Store Management Portal
          </div>
          <h1 className="stitch-hero-title" style={{ fontSize: "38px", marginBottom: "0.25rem" }}>
            Admin Dashboard
          </h1>
          <p className="stitch-hero-desc" style={{ fontSize: "15px" }}>
            Manage catalog products, pricing, stock levels, and store analytics.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/shop" className="stitch-filter-pill" style={{ textDecoration: "none" }}>
            View Customer Store →
          </Link>
          <Link to="/profile" className="stitch-filter-pill" style={{ textDecoration: "none" }}>
            My Account
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", borderBottom: "1px solid #e8e8e8", paddingBottom: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("products")}
          className="stitch-filter-pill"
          style={{
            backgroundColor: activeTab === "products" ? "#000000" : "#ffffff",
            color: activeTab === "products" ? "#ffffff" : "#000000",
            borderColor: activeTab === "products" ? "#000000" : "rgba(0,0,0,0.12)",
            boxShadow: activeTab === "products" ? "0 4px 14px rgba(0,0,0,0.18)" : "0 2px 6px rgba(0,0,0,0.04)",
            cursor: "pointer"
          }}
        >
          Product Management ({products.length})
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className="stitch-filter-pill"
          style={{
            backgroundColor: activeTab === "orders" ? "#000000" : "#ffffff",
            color: activeTab === "orders" ? "#ffffff" : "#000000",
            borderColor: activeTab === "orders" ? "#000000" : "rgba(0,0,0,0.12)",
            boxShadow: activeTab === "orders" ? "0 4px 14px rgba(0,0,0,0.18)" : "0 2px 6px rgba(0,0,0,0.04)",
            cursor: "pointer"
          }}
        >
          Order Management ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className="stitch-filter-pill"
          style={{
            backgroundColor: activeTab === "analytics" ? "#000000" : "#ffffff",
            color: activeTab === "analytics" ? "#ffffff" : "#000000",
            borderColor: activeTab === "analytics" ? "#000000" : "rgba(0,0,0,0.12)",
            boxShadow: activeTab === "analytics" ? "0 4px 14px rgba(0,0,0,0.18)" : "0 2px 6px rgba(0,0,0,0.04)",
            cursor: "pointer"
          }}
        >
          Store Analytics &amp; Revenue
        </button>
      </div>


      {/* ==================== TAB 1: PRODUCT MANAGEMENT ==================== */}
      {activeTab === "products" && (
        <div>
          {/* Controls Bar: Search, Category Filter, and Add New Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexGrow: 1, maxWidth: "600px" }}>
              <input
                type="text"
                placeholder="Search products by name, brand, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: "0.65rem 1.25rem",
                  borderRadius: "9999px",
                  border: "1px solid #cfc4c5",
                  background: "#ffffff",
                  fontSize: "14px",
                  outline: "none"
                }}
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: "0.65rem 1rem",
                  borderRadius: "9999px",
                  border: "1px solid #cfc4c5",
                  background: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home &amp; Kitchen</option>
                <option value="Fitness">Fitness</option>
                <option value="Beauty">Beauty</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="stitch-checkout-btn"
              style={{ padding: "0.75rem 1.5rem", fontSize: "12px", width: "auto", cursor: "pointer" }}
            >
              + Add New Product
            </button>
          </div>

          {/* Products Table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#5d5f5f" }}>
              <p>Loading catalog products from database...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="stitch-empty-cart">
              <span className="material-symbols-outlined stitch-empty-icon">inventory_2</span>
              <h3 className="stitch-empty-title">No Products Found</h3>
              <p className="stitch-empty-desc">Try clearing your search query or add a new product.</p>
              <button onClick={handleOpenCreateModal} className="stitch-checkout-btn" style={{ maxWidth: "200px" }}>
                Add First Product
              </button>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: "1rem", overflowX: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #e8e8e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e8e8e8", color: "#5d5f5f", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <th style={{ padding: "1rem 1.25rem" }}>Product</th>
                    <th style={{ padding: "1rem" }}>Category</th>
                    <th style={{ padding: "1rem" }}>Price</th>
                    <th style={{ padding: "1rem" }}>Stock</th>
                    <th style={{ padding: "1rem" }}>Status</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const prodId = p._id || p.id
                    const isOut = p.countInStock <= 0
                    const isLow = p.countInStock > 0 && p.countInStock <= 5

                    return (
                      <tr key={prodId} style={{ borderBottom: "1px solid #f0f0f0", transition: "background-color 0.15s ease" }}>
                        {/* Product Thumbnail & Name */}
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#f5f5f5", overflow: "hidden", flexShrink: 0 }}>
                              <img
                                src={p.imageURL || (p.images && p.images[0])}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                            <div>
                              <strong style={{ color: "#000000", display: "block", fontSize: "14px" }}>
                                {p.name}
                              </strong>
                              <span style={{ fontSize: "12px", color: "#8c8e8e" }}>
                                {p.brand || "ShopSphere"} • {p.sku || "SKU-N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "1rem", color: "#5d5f5f", fontWeight: 500 }}>
                          {p.category || "General"}
                        </td>

                        {/* Price */}
                        <td style={{ padding: "1rem" }}>
                          <strong style={{ color: "#000000" }}>
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </strong>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span style={{ display: "block", fontSize: "12px", color: "#8c8e8e", textDecoration: "line-through" }}>
                              ₹{Number(p.originalPrice).toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.6rem",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: isOut ? "#fee2e2" : isLow ? "#fef9c3" : "#dcfce7",
                              color: isOut ? "#dc2626" : isLow ? "#854d0e" : "#15803d"
                            }}
                          >
                            {p.countInStock} units
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              textTransform: "capitalize",
                              color: p.status === "draft" ? "#8c8e8e" : "#000000"
                            }}
                          >
                            {p.status || "Active"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                            <Link
                              to={`/product/${prodId}`}
                              target="_blank"
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                background: "#f5f5f5",
                                color: "#000",
                                fontSize: "12px",
                                fontWeight: 600,
                                textDecoration: "none"
                              }}
                              title="View customer page"
                            >
                              View
                            </Link>

                            <button
                              onClick={() => handleOpenEditModal(p)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                background: "#000000",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteProductTarget(p)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                background: "#fee2e2",
                                color: "#dc2626",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                              title="Delete product"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: ORDER MANAGEMENT ==================== */}
      {activeTab === "orders" && (
        <div className="stitch-tab-pane">
          {/* Controls Bar: Search, Status Filter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexGrow: 1, maxWidth: "650px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search orders by ID, customer name, email, or phone..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                style={{
                  flexGrow: 1,
                  minWidth: "260px",
                  padding: "0.65rem 1.25rem",
                  borderRadius: "9999px",
                  border: "1px solid #cfc4c5",
                  background: "#ffffff",
                  fontSize: "14px",
                  outline: "none"
                }}
              />

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{
                  padding: "0.65rem 1rem",
                  borderRadius: "9999px",
                  border: "1px solid #cfc4c5",
                  background: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped / In Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={fetchData}
              className="stitch-filter-pill"
              style={{ cursor: "pointer", background: "#f0f0f0" }}
              title="Refresh Orders"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>sync</span>
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#5d5f5f" }}>
              <p>Loading customer orders from database...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="stitch-empty-cart">
              <span className="material-symbols-outlined stitch-empty-icon">local_shipping</span>
              <h3 className="stitch-empty-title">No Orders Found</h3>
              <p className="stitch-empty-desc">No customer orders match the current search or status filter.</p>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: "1rem", overflowX: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #e8e8e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e8e8e8", color: "#5d5f5f", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <th style={{ padding: "1rem 1.25rem" }}>Order ID &amp; Date</th>
                    <th style={{ padding: "1rem" }}>Customer</th>
                    <th style={{ padding: "1rem" }}>Items</th>
                    <th style={{ padding: "1rem" }}>Total &amp; Payment</th>
                    <th style={{ padding: "1rem" }}>Fulfillment Status (Edit)</th>
                    <th style={{ padding: "1rem 1.25rem", textAlign: "right" }}>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => {
                    const ordId = ord._id || ord.id
                    const orderDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"
                    const custName = ord.user?.name || ord.shippingDetails?.name || "Guest Customer"
                    const custEmail = ord.user?.email || ord.shippingDetails?.email || "No email"
                    const custPhone = ord.phone || ord.shippingDetails?.phone || "N/A"
                    const isUpdating = updatingOrderId === ordId

                    return (
                      <tr key={ordId} style={{ borderBottom: "1px solid #f0f0f0", transition: "background-color 0.15s ease" }}>
                        {/* Order ID & Date */}
                        <td style={{ padding: "1rem 1.25rem", verticalAlign: "top" }}>
                          <strong style={{ color: "#000000", display: "block", fontSize: "14px", letterSpacing: "0.02em" }}>
                            #{ordId.toString().slice(-8).toUpperCase()}
                          </strong>
                          <span style={{ fontSize: "12px", color: "#8c8e8e" }}>
                            {orderDate}
                          </span>
                        </td>

                        {/* Customer */}
                        <td style={{ padding: "1rem", verticalAlign: "top" }}>
                          <strong style={{ color: "#000000", display: "block", fontSize: "14px" }}>
                            {custName}
                          </strong>
                          <span style={{ fontSize: "12px", color: "#5d5f5f", display: "block" }}>
                            {custEmail}
                          </span>
                          <span style={{ fontSize: "11px", color: "#8c8e8e" }}>
                            📞 {custPhone}
                          </span>
                          {ord.city && (
                            <div style={{ fontSize: "11px", color: "#8c8e8e", marginTop: "2px" }}>
                              📍 {ord.city}, {ord.state || "India"}
                            </div>
                          )}
                        </td>

                        {/* Items */}
                        <td style={{ padding: "1rem", verticalAlign: "top" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {ord.items && ord.items.length > 0 ? (
                              ord.items.map((it, idx) => (
                                <div key={idx} style={{ fontSize: "13px", color: "#333333" }}>
                                  • {it.product?.name || it.name || "Item"} <strong style={{ color: "#000" }}>×{it.quantity || 1}</strong>
                                </div>
                              ))
                            ) : (
                              <span style={{ color: "#8c8e8e", fontSize: "12px" }}>The Weekender Bag ×1</span>
                            )}
                          </div>
                        </td>

                        {/* Total & Payment Method */}
                        <td style={{ padding: "1rem", verticalAlign: "top" }}>
                          <strong style={{ color: "#000000", fontSize: "15px", display: "block" }}>
                            ₹{Number(ord.totalAmount || ord.total || 0).toLocaleString("en-IN")}
                          </strong>
                          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#5d5f5f" }}>
                            {ord.paymentMethod || "RAZORPAY"}
                          </span>
                        </td>

                        {/* Live Fulfillment Status Dropdown */}
                        <td style={{ padding: "1rem", verticalAlign: "top" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <select
                              value={ord.status || "pending"}
                              disabled={isUpdating}
                              onChange={(e) => handleUpdateOrderStatus(ordId, e.target.value, ord.paymentStatus)}
                              style={{
                                padding: "0.45rem 0.85rem",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                cursor: "pointer",
                                outline: "none",
                                border: "1px solid",
                                ...(ord.status === "delivered"
                                  ? { background: "#dcfce7", color: "#15803d", borderColor: "#86efac" }
                                  : ord.status === "shipped"
                                  ? { background: "#e0e7ff", color: "#4338ca", borderColor: "#a5b4fc" }
                                  : ord.status === "processing"
                                  ? { background: "#e0f2fe", color: "#0369a1", borderColor: "#7dd3fc" }
                                  : ord.status === "cancelled"
                                  ? { background: "#fee2e2", color: "#b91c1c", borderColor: "#fca5a5" }
                                  : { background: "#fef9c3", color: "#854d0e", borderColor: "#fde047" })
                              }}
                            >
                              <option value="pending">● Pending</option>
                              <option value="processing">● Processing</option>
                              <option value="shipped">● Shipped / In Delivery</option>
                              <option value="delivered">● Delivered</option>
                              <option value="cancelled">● Cancelled</option>
                            </select>
                            {isUpdating && (
                              <span style={{ fontSize: "11px", color: "#5d5f5f" }}>Saving...</span>
                            )}
                          </div>
                        </td>

                        {/* Payment Status Quick Toggle */}
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right", verticalAlign: "top" }}>
                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleUpdateOrderStatus(
                                ordId,
                                ord.status || "pending",
                                ord.paymentStatus === "paid" ? "pending" : "paid"
                              )
                            }
                            style={{
                              padding: "0.35rem 0.75rem",
                              borderRadius: "9999px",
                              fontSize: "11px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              cursor: "pointer",
                              border: "none",
                              background: ord.paymentStatus === "paid" ? "#dcfce7" : "#fef9c3",
                              color: ord.paymentStatus === "paid" ? "#15803d" : "#854d0e"
                            }}
                            title="Click to toggle payment status"
                          >
                            {ord.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: STORE ANALYTICS ==================== */}
      {activeTab === "analytics" && (

        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
            <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", color: "#5d5f5f", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Total Pan-India Revenue
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#000000", letterSpacing: "-0.03em" }}>
                ₹{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString("en-IN") : "18,45,200"}
              </div>
              <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>+24.8% GST Gross Volume</span>
            </div>

            <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", color: "#5d5f5f", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Total Fulfilled Orders
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#000000", letterSpacing: "-0.03em" }}>
                {stats?.totalOrders || "426"}
              </div>
              <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>99.2% on-time delivery</span>
            </div>

            <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", color: "#5d5f5f", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Verified Customers
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#000000", letterSpacing: "-0.03em" }}>
                {stats?.totalUsers || "356"}
              </div>
              <span style={{ fontSize: "13px", color: "#6366f1", fontWeight: 600 }}>OTP Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE / EDIT PRODUCT MODAL ==================== */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "1.25rem",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #e8e8e8", paddingBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "#000000" }}>
                  {isEditMode ? "Edit Product Details" : "Add New Product"}
                </h2>
                <span style={{ fontSize: "13px", color: "#5d5f5f" }}>
                  {isEditMode ? "Changes will immediately update the database and customer catalog." : "Create a new item in the database."}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Error message */}
            {formError && (
              <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "13px", marginBottom: "1.25rem" }}>
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitProduct} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* SECTION 1: BASIC INFORMATION */}
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5d5f5f", marginBottom: "1rem" }}>
                  1. Basic Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g. Sony, Apple, ShopSphere"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px", background: "#fff" }}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home &amp; Kitchen</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>SKU Code</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="e.g. WH-1000XM5-BLK"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px", background: "#fff" }}
                    >
                      <option value="active">Active (Published)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING & INVENTORY */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5d5f5f", marginBottom: "1rem" }}>
                  2. Pricing &amp; Inventory
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Selling Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="29990"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>MRP / Orig Price (₹)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="34990"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="15"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Stock Quantity *</label>
                    <input
                      type="number"
                      name="countInStock"
                      required
                      value={formData.countInStock}
                      onChange={handleInputChange}
                      placeholder="40"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: MEDIA & IMAGES */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5d5f5f", marginBottom: "1rem" }}>
                  3. Product Images
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Main Showcase Image URL *</label>
                  <input
                    type="url"
                    name="imageURL"
                    required
                    value={formData.imageURL}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Additional Gallery Image URLs (one per line)</label>
                  <textarea
                    rows="2"
                    name="additionalImages"
                    value={formData.additionalImages}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-2...&#10;https://images.unsplash.com/photo-3..."
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "13px", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              {/* SECTION 4: DESCRIPTION & HIGHLIGHTS */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5d5f5f", marginBottom: "1rem" }}>
                  4. Description &amp; Highlights
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Detailed Description *</label>
                  <textarea
                    rows="3"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Write a clear, compelling description of the product..."
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Product Highlights (one per line)</label>
                    <textarea
                      rows="3"
                      name="featuresText"
                      value={formData.featuresText}
                      onChange={handleInputChange}
                      placeholder="• Dual noise sensor technology&#10;• 30-hour battery life&#10;• Fast charging support"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "13px", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>What's In The Box (one per line)</label>
                    <textarea
                      rows="3"
                      name="whatsInTheBoxText"
                      value={formData.whatsInTheBoxText}
                      onChange={handleInputChange}
                      placeholder="1x Headphones&#10;1x Carrying Case&#10;1x USB-C Cable"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "13px", fontFamily: "inherit" }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: SHIPPING & POLICIES */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5d5f5f", marginBottom: "1rem" }}>
                  5. Shipping &amp; Policies
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Estimated Delivery Time</label>
                    <input
                      type="text"
                      name="estimatedDelivery"
                      value={formData.estimatedDelivery}
                      onChange={handleInputChange}
                      placeholder="2-4 business days"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Return &amp; Exchange Policy</label>
                    <input
                      type="text"
                      name="returnWindow"
                      value={formData.returnWindow}
                      onChange={handleInputChange}
                      placeholder="7-Day Returns & Exchange"
                      style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    placeholder="1 Year Manufacturer Warranty"
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Submit / Cancel Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "0.75rem 1.5rem", borderRadius: "9999px", border: "1px solid #cfc4c5", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="stitch-checkout-btn"
                  style={{ width: "auto", padding: "0.75rem 2rem", cursor: "pointer" }}
                >
                  {isSubmitting ? "Saving to Database..." : isEditMode ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deleteProductTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setDeleteProductTarget(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "1rem",
              width: "100%",
              maxWidth: "460px",
              padding: "2rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              textAlign: "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#dc2626", marginBottom: "1rem" }}>
              delete_forever
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 0.5rem", color: "#000000" }}>
              Delete Product?
            </h3>
            <p style={{ fontSize: "14px", color: "#5d5f5f", marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong>{deleteProductTarget.name}</strong>? This action cannot be undone and will immediately remove the product from the customer catalog.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => setDeleteProductTarget(null)}
                style={{ padding: "0.65rem 1.25rem", borderRadius: "9999px", border: "1px solid #cfc4c5", background: "#fff", cursor: "pointer", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{ padding: "0.65rem 1.5rem", borderRadius: "9999px", border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 700 }}
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminDashboard

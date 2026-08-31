import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { orderAPI, paymentAPI } from "../../services/api"
import "../../styles/checkout.css"

const indianStates = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, cartTotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  // Enforce authentication on checkout
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout")
    }
  }, [isAuthenticated, navigate])

  const [formData, setFormData] = useState({
    firstName: user?.name ? user.name.split(" ")[0] : "",
    lastName: user?.name ? user.name.split(" ")[1] || "" : "",
    phone: "",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    zip: "",
    country: "India",
    paymentMethod: "UPI" // "UPI" | "CARD" | "COD"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPaymentFailed, setIsPaymentFailed] = useState(false)
  const [failedReason, setFailedReason] = useState("")
  const [orderResult, setOrderResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value })
  }

  const subtotal = cartTotal > 0 ? cartTotal : 4999
  const shippingCost = subtotal >= 999 ? 0 : 99
  const gstTaxes = Number((subtotal * 0.18).toFixed(2))
  const grandTotal = subtotal + shippingCost + gstTaxes

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault()
    if (!formData.phone || formData.phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number for order delivery.")
      return
    }
    if (!formData.address || !formData.zip) {
      setErrorMsg("Please complete all shipping address fields.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg("")
    setIsPaymentFailed(false)

    const isOnlinePayment = formData.paymentMethod === "UPI" || formData.paymentMethod === "CARD"

    const orderPayload = {
      items: cart.length > 0
        ? cart.map((item) => ({ product: item.id || item._id, quantity: item.quantity }))
        : [{ product: "1", quantity: 1 }],
      totalAmount: grandTotal,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pin: formData.zip,
      country: "India",
      phone: formData.phone,
      paymentMethod: formData.paymentMethod,
      paymentStatus: "pending",
      shippingDetails: {
        name: `${formData.firstName} ${formData.lastName}`.trim() || user?.name || "Customer",
        email: user?.email || "customer@example.com",
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin: formData.zip,
        country: "India"
      }
    }

    try {
      // 1. Create order in MongoDB first (defaults to status: "pending")
      const dbOrder = await orderAPI.create(orderPayload)
      const createdOrderId = dbOrder._id || dbOrder.id

      // 2. If Payment Mode is UPI or CARD, launch Razorpay Gateway Modal
      if (isOnlinePayment) {
        try {
          const razorpayOrder = await paymentAPI.createOrder({ amount: grandTotal })

          if (window.Razorpay) {
            const options = {
              key: "rzp_test_TVxlYIx7cDu4iE",
              amount: razorpayOrder.amount || Math.round(grandTotal * 100),
              currency: razorpayOrder.currency || "INR",
              name: "ShopSphere India",
              description: formData.paymentMethod === "UPI"
                ? `UPI / GPay Payment for Order #${createdOrderId || "NEW"}`
                : `Card / NetBanking Payment for Order #${createdOrderId || "NEW"}`,
              image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80",
              order_id: razorpayOrder.id,
              handler: async function (response) {
                try {
                  // Verify payment signature on backend
                  await paymentAPI.verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: createdOrderId
                  })
                } catch (verifyErr) {
                  console.warn("Backend signature verification note:", verifyErr.message)
                }
                setOrderResult({ ...dbOrder, paymentId: response.razorpay_payment_id, paymentStatus: "paid", status: "pending" })
                setIsSubmitted(true)
                clearCart()
                setIsSubmitting(false)
              },
              prefill: {
                name: `${formData.firstName} ${formData.lastName}`.trim() || user?.name || "Customer",
                email: user?.email || "customer@example.com",
                contact: formData.phone
              },
              theme: {
                color: "#000000"
              },
              modal: {
                ondismiss: function () {
                  setIsSubmitting(false)
                  setFailedReason("Payment was cancelled. You exited without completing the transaction.")
                  setIsPaymentFailed(true)
                }
              }
            }

            const rzp1 = new window.Razorpay(options)
            rzp1.on("payment.failed", function (failRes) {
              setIsSubmitting(false)
              setFailedReason(failRes.error?.description || "Transaction failed or was declined by bank.")
              setIsPaymentFailed(true)
            })
            rzp1.open()
            return
          } else {
            throw new Error("Razorpay SDK not loaded in browser.")
          }
        } catch (rzpErr) {
          console.error("Razorpay order error:", rzpErr)
          setErrorMsg(`Payment Gateway Error: ${rzpErr.message || "Failed to initialize Razorpay."}`)
          setIsSubmitting(false)
          return
        }
      }

      // 3. For Cash on Delivery (COD), complete directly
      setOrderResult({ ...dbOrder, paymentStatus: "pending", status: "pending" })
      setIsSubmitted(true)
      clearCart()
    } catch (err) {
      setErrorMsg(err.message || "Could not complete order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==================== PAYMENT FAILED / CANCELLED SCREEN ====================
  if (isPaymentFailed) {
    return (
      <main className="stitch-checkout-container stitch-page-enter">
        <div className="stitch-success-card" style={{ borderTop: "4px solid #ef4444" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>
              cancel
            </span>
          </div>

          <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "-0.03em", color: "#111827" }}>
            Payment Incomplete or Cancelled
          </h2>

          <p style={{ fontSize: "15px", color: "#5d5f5f", marginBottom: "1.75rem", lineHeight: 1.6, maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
            {failedReason || "Your payment process was interrupted or cancelled. Don't worry, your bag items are safely preserved and no funds were deducted."}
          </p>

          {/* Transaction Summary Box */}
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
              marginBottom: "2rem",
              textAlign: "left",
              maxWidth: "440px",
              marginLeft: "auto",
              marginRight: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "14px", color: "#4b5563" }}>
              <span>Total Payable Amount:</span>
              <strong style={{ color: "#000000", fontSize: "15px" }}>₹{grandTotal.toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#4b5563" }}>
              <span>Selected Method:</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>
                {formData.paymentMethod === "UPI" ? "UPI (GPay / PhonePe / Paytm)" : formData.paymentMethod === "CARD" ? "Card / Net Banking" : "Online Payment"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setIsPaymentFailed(false)
                setErrorMsg("")
                handleSubmit()
              }}
              className="stitch-complete-btn"
              style={{
                maxWidth: "220px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                background: "#000000",
                color: "#ffffff"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>refresh</span>
              <span>Retry Payment</span>
            </button>

            <Link
              to="/shop"
              className="stitch-filter-pill"
              style={{
                textDecoration: "none",
                padding: "0.85rem 1.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.15)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>storefront</span>
              <span>Continue Shopping</span>
            </Link>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={() => {
                setIsPaymentFailed(false)
                setFormData((prev) => ({ ...prev, paymentMethod: "COD" }))
                setErrorMsg("")
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#4b5563",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              Or switch to Cash on Delivery (COD) →
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ==================== ORDER SUCCESS SCREEN ====================
  if (isSubmitted) {
    return (
      <main className="stitch-checkout-container stitch-page-enter">
        <div className="stitch-success-card">
          <span className="material-symbols-outlined stitch-success-icon">
            check_circle
          </span>
          <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "-0.03em" }}>
            Order Placed Successfully!
          </h2>
          <p style={{ fontSize: "16px", color: "#5d5f5f", marginBottom: "1.5rem" }}>
            Thank you, <strong>{formData.firstName || user?.name || "Customer"}</strong>. Your order <strong>#{orderResult?._id || "SS-849201"}</strong> has been confirmed.
            <span style={{ display: "block", marginTop: "8px", fontSize: "14px", color: "#000000", fontWeight: 600 }}>
              Payment Method: {formData.paymentMethod === "UPI" ? "UPI (Google Pay / PhonePe / Paytm)" : formData.paymentMethod === "CARD" ? "Card / Net Banking" : "Cash on Delivery"} • Status: <span style={{ color: "#ca8a04", textTransform: "uppercase" }}>Pending Fulfillment</span>
            </span>
            {orderResult?.paymentId && (
              <span style={{ display: "block", marginTop: "4px", fontSize: "13px", color: "#16a34a" }}>
                Payment Ref ID: {orderResult.paymentId}
              </span>
            )}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/profile" className="stitch-complete-btn" style={{ maxWidth: "240px", display: "inline-block", textAlign: "center", textDecoration: "none" }}>
              Track in My Orders →
            </Link>
            <Link to="/shop" className="stitch-filter-pill" style={{ textDecoration: "none", padding: "0.9rem 1.5rem" }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="stitch-checkout-container stitch-page-enter">
      <div className="stitch-checkout-grid">
        {/* Left Column: Shipping & Payment */}
        <div>
          {errorMsg && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Shipping Address Section */}
            <section className="stitch-checkout-section">
              <h2 className="stitch-checkout-section-title">Delivery Address (India)</h2>
              <div className="stitch-input-grid">
                {/* First Name */}
                <div className="stitch-floating-input">
                  <input
                    id="firstName"
                    type="text"
                    required
                    placeholder=" "
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <label htmlFor="firstName">First Name</label>
                </div>

                {/* Last Name */}
                <div className="stitch-floating-input">
                  <input
                    id="lastName"
                    type="text"
                    required
                    placeholder=" "
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  <label htmlFor="lastName">Last Name</label>
                </div>

                {/* 10-Digit Mobile Number */}
                <div className="stitch-floating-input stitch-input-full">
                  <input
                    id="phone"
                    type="tel"
                    maxLength="10"
                    required
                    placeholder=" "
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <label htmlFor="phone">10-Digit Mobile Number (e.g. 9876543210)</label>
                </div>

                {/* Street Address */}
                <div className="stitch-floating-input stitch-input-full">
                  <input
                    id="address"
                    type="text"
                    required
                    placeholder=" "
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <label htmlFor="address">Flat / House No., Building, Street Name</label>
                </div>

                {/* City */}
                <div className="stitch-floating-input">
                  <input
                    id="city"
                    type="text"
                    required
                    placeholder=" "
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <label htmlFor="city">City / District</label>
                </div>

                {/* State Dropdown */}
                <div className="stitch-floating-input">
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      background: "transparent",
                      borderRadius: "9999px",
                      padding: "24px 24px 8px 24px",
                      border: "1px solid transparent",
                      fontSize: "15px",
                      color: "#000",
                      outline: "none"
                    }}
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="state" style={{ top: "10px", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                    State
                  </label>
                </div>

                {/* PIN Code */}
                <div className="stitch-floating-input">
                  <input
                    id="zip"
                    type="text"
                    maxLength="6"
                    required
                    placeholder=" "
                    value={formData.zip}
                    onChange={handleChange}
                  />
                  <label htmlFor="zip">6-Digit PIN Code (e.g. 560038)</label>
                </div>

                {/* Country */}
                <div className="stitch-floating-input">
                  <input
                    id="country"
                    type="text"
                    disabled
                    value="India"
                    style={{ opacity: 0.7 }}
                  />
                  <label htmlFor="country" style={{ top: "10px", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                    Country
                  </label>
                </div>
              </div>
            </section>

            {/* Payment Method Section */}
            <section className="stitch-checkout-section">
              <h2 className="stitch-checkout-section-title">Payment Method</h2>
              <div className="stitch-payment-options">
                {/* 1. UPI / GPAY OPTION */}
                <label className={`stitch-payment-option ${formData.paymentMethod === "UPI" ? "selected" : ""}`}>
                  <div className="stitch-payment-option-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={formData.paymentMethod === "UPI"}
                      onChange={handleChange}
                      className="stitch-payment-radio"
                    />
                    <div>
                      <span className="stitch-payment-name">UPI / QR (Google Pay, PhonePe, Paytm, BHIM)</span>
                      <div style={{ fontSize: "13px", color: "#16a34a", marginTop: "2px", fontWeight: 600 }}>
                        ⚡ Instant UPI payment via Razorpay secure gateway
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#000" }}>
                    qr_code_2
                  </span>
                </label>

                {/* 2. CARDS / NET BANKING */}
                <label className={`stitch-payment-option ${formData.paymentMethod === "CARD" ? "selected" : ""}`}>
                  <div className="stitch-payment-option-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={formData.paymentMethod === "CARD"}
                      onChange={handleChange}
                      className="stitch-payment-radio"
                    />
                    <div>
                      <span className="stitch-payment-name">Debit / Credit Cards &amp; Net Banking</span>
                      <div style={{ fontSize: "13px", color: "#5d5f5f", marginTop: "2px" }}>
                        Visa, MasterCard, RuPay &amp; 50+ Indian banks via Razorpay
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#000" }}>
                    credit_card
                  </span>
                </label>

                {/* 3. CASH ON DELIVERY OPTION */}
                <label className={`stitch-payment-option ${formData.paymentMethod === "COD" ? "selected" : ""}`}>
                  <div className="stitch-payment-option-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleChange}
                      className="stitch-payment-radio"
                    />
                    <div>
                      <span className="stitch-payment-name">Cash / QR on Delivery (COD)</span>
                      <div style={{ fontSize: "13px", color: "#5d5f5f", marginTop: "2px" }}>
                        Pay via cash or UPI QR at your doorstep upon delivery
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                    payments
                  </span>
                </label>
              </div>
            </section>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="stitch-checkout-summary-box">
            <h3 className="stitch-summary-heading">Order Summary</h3>

            {/* Mini Cart Items */}
            <div className="stitch-mini-cart-list">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.id || item._id} className="stitch-mini-cart-item">
                    <div className="stitch-mini-cart-thumb">
                      <img src={item.imageURL || item.image} alt={item.name} />
                    </div>
                    <div className="stitch-mini-cart-info">
                      <div className="stitch-mini-cart-name">{item.name}</div>
                      <div className="stitch-mini-cart-qty">Qty: {item.quantity}</div>
                    </div>
                    <div className="stitch-mini-cart-price">
                      ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="stitch-mini-cart-item">
                  <div className="stitch-mini-cart-thumb">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                      alt="Product item"
                    />
                  </div>
                  <div className="stitch-mini-cart-info">
                    <div className="stitch-mini-cart-name">Sample Item</div>
                    <div className="stitch-mini-cart-qty">Qty: 1</div>
                  </div>
                  <div className="stitch-mini-cart-price">₹4,999</div>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="stitch-checkout-totals">
              <div className="stitch-checkout-total-row">
                <span>Items Subtotal</span>
                <span style={{ fontWeight: 600, color: "#000000" }}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="stitch-checkout-total-row">
                <span>Pan-India Delivery</span>
                <span style={{ color: shippingCost === 0 ? "#16a34a" : "#000", fontWeight: 600 }}>
                  {shippingCost === 0 ? "FREE" : "₹99"}
                </span>
              </div>
              <div className="stitch-checkout-total-row">
                <span>GST (18%)</span>
                <span>₹{gstTaxes.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="stitch-checkout-grand-total">
              <span>Total Payable</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            {/* Complete Purchase Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="stitch-complete-btn"
            >
              {isSubmitting ? "PROCESSING..." : `PAY ₹${grandTotal.toLocaleString("en-IN")} NOW`}
            </button>

            <div style={{ textAlign: "center", fontSize: "11px", color: "#5d5f5f", marginTop: "0.75rem" }}>
              🔒 256-Bit Razorpay SSL Encryption • 7-Day Doorstep Returns
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Checkout

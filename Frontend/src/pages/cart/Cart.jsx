import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import "../../styles/pages.css"

const Cart = () => {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, cartTotal, cartItemsCount } = useCart()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [removingId, setRemovingId] = useState(null)
  const [promoCode, setPromoCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState("")

  const FREE_SHIPPING_THRESHOLD = 999
  const subtotal = cartTotal
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? 99 : 0
  const discountedSubtotal = Math.max(0, subtotal - discountAmount)
  const gstTaxes = Number((discountedSubtotal * 0.18).toFixed(2))
  const grandTotal = discountedSubtotal + shippingCost + gstTaxes

  const handleApplyPromo = (e) => {
    e.preventDefault()
    setPromoError("")
    const code = promoCode.trim().toUpperCase()

    if (code === "SPHERE10") {
      const discount = Math.round(subtotal * 0.1)
      setDiscountAmount(discount)
      setPromoApplied(true)
      if (typeof showToast === "function") {
        showToast("Coupon Applied", "10% discount applied to your order!")
      }
    } else if (code === "") {
      setPromoError("Please enter a promo code.")
    } else {
      setPromoError("Invalid coupon code. Try SPHERE10 for 10% off.")
    }
  }

  const handleRemovePromo = () => {
    setDiscountAmount(0)
    setPromoApplied(false)
    setPromoCode("")
    setPromoError("")
  }

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout")
    } else {
      navigate("/checkout")
    }
  }

  const handleRemoveItem = (itemId) => {
    setRemovingId(itemId)
    setTimeout(() => {
      removeFromCart(itemId)
      setRemovingId(null)
    }, 240)
  }

  if (cart.length === 0) {
    return (
      <main className="stitch-main stitch-page-enter">
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon">
            shopping_bag
          </span>
          <h2 className="stitch-empty-title">Your bag is empty</h2>
          <p className="stitch-empty-desc">
            Looks like you haven't added anything to your bag yet. Discover our latest curated collections.
          </p>
          <Link to="/shop" className="stitch-checkout-btn" style={{ maxWidth: "220px" }}>
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Free Shipping Progress Milestone Banner */}
      <div
        style={{
          background: subtotal >= FREE_SHIPPING_THRESHOLD ? "#f0fdf4" : "#f9f9f9",
          border: `1px solid ${subtotal >= FREE_SHIPPING_THRESHOLD ? "#bbf7d0" : "#e5e5e5"}`,
          borderRadius: "1rem",
          padding: "1rem 1.5rem",
          marginBottom: "2rem",
          transition: "all 0.3s ease"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", fontSize: "14px" }}>
          <span style={{ fontWeight: 600, color: subtotal >= FREE_SHIPPING_THRESHOLD ? "#15803d" : "#000000" }}>
            {subtotal >= FREE_SHIPPING_THRESHOLD
              ? "🎉 You have unlocked FREE Pan-India Express Shipping!"
              : `Add ₹${remainingForFreeShipping.toLocaleString("en-IN")} more to unlock FREE Pan-India Express Shipping`}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: subtotal >= FREE_SHIPPING_THRESHOLD ? "#15803d" : "#5d5f5f" }}>
            {progressPercent}%
          </span>
        </div>
        <div style={{ width: "100%", height: "6px", background: "#e5e5e5", borderRadius: "9999px", overflow: "hidden" }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: subtotal >= FREE_SHIPPING_THRESHOLD ? "#10b981" : "#000000",
              borderRadius: "9999px",
              transition: "width 0.4s ease"
            }}
          />
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="stitch-hero-title" style={{ fontSize: "44px", marginBottom: "0.25rem" }}>
            Shopping Bag
          </h1>
          <p className="stitch-hero-desc" style={{ fontSize: "15px" }}>
            {cartItemsCount} {cartItemsCount === 1 ? "item" : "items"} ready for checkout.
          </p>
        </div>
        <Link to="/shop" className="stitch-cart-back-link" style={{ margin: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="stitch-cart-layout">
        {/* Cart Items List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {cart.map((item) => {
            const itemId = item.id || item._id
            const isRemoving = removingId === itemId

            return (
              <div
                key={itemId}
                className={`stitch-cart-item-card ${isRemoving ? "removing" : ""}`}
              >
                {/* Square Image Stage */}
                <div className="stitch-cart-thumb-stage">
                  <img
                    src={item.imageURL || item.image}
                    alt={item.name}
                    className="stitch-cart-thumb-img"
                  />
                </div>

                {/* Product Info */}
                <div className="stitch-cart-item-info">
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#8c8e8e", textTransform: "uppercase", marginBottom: "2px" }}>
                    {item.category || "Essential"}
                  </div>
                  <h3 className="stitch-cart-item-name">{item.name}</h3>

                  {/* Stepper, Price & Remove Action */}
                  <div className="stitch-cart-item-controls-row" style={{ marginTop: "1rem" }}>
                    <div className="stitch-stepper">
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        className="stitch-stepper-btn"
                        aria-label="Decrease quantity"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                          remove
                        </span>
                      </button>
                      <span className="stitch-stepper-val">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        className="stitch-stepper-btn"
                        aria-label="Increase quantity"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                          add
                        </span>
                      </button>
                    </div>

                    <span className="stitch-card-price" style={{ fontSize: "18px" }}>
                      ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(itemId)}
                      className="stitch-cart-remove-text-btn"
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        delete_outline
                      </span>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary Card */}
        <div>
          <div className="stitch-summary-card">
            <h2 className="stitch-summary-title">Order Summary</h2>

            {/* Promo Code Box */}
            <div style={{ marginBottom: "1.5rem" }}>
              {promoApplied ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.65rem 1rem", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#15803d", display: "block" }}>SPHERE10 Applied</span>
                    <span style={{ fontSize: "11px", color: "#16a34a" }}>-₹{discountAmount.toLocaleString("en-IN")} discount</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    style={{ background: "none", border: "none", color: "#dc2626", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    placeholder="Coupon (e.g. SPHERE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{
                      flexGrow: 1,
                      padding: "0.55rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e5e5",
                      fontSize: "13px",
                      outline: "none"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "0.55rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "#000000",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <span style={{ display: "block", color: "#dc2626", fontSize: "11px", marginTop: "4px" }}>
                  {promoError}
                </span>
              )}
            </div>

            {/* Line Items */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="stitch-summary-row">
                <span>Items Subtotal</span>
                <span style={{ fontWeight: 600, color: "#000000" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {promoApplied && (
                <div className="stitch-summary-row" style={{ color: "#16a34a" }}>
                  <span>Coupon Discount (10%)</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="stitch-summary-row">
                <span>Pan-India Express Shipping</span>
                <span style={{ color: shippingCost === 0 ? "#16a34a" : "#000", fontWeight: 600 }}>
                  {shippingCost === 0 ? "FREE" : "₹99"}
                </span>
              </div>

              <div className="stitch-summary-row">
                <span>Estimated GST (18%)</span>
                <span>₹{gstTaxes.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Total */}
            <div className="stitch-summary-row-total">
              <span>Total Payable</span>
              <span style={{ fontSize: "22px" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="stitch-checkout-btn"
              style={{ width: "100%", cursor: "pointer" }}
            >
              Proceed to Checkout →
            </button>

            <div className="stitch-security-badge" style={{ marginTop: "1rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                lock
              </span>
              <span>256-Bit SSL Encrypted Razorpay Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Cart

import React, { useState } from "react"
import { Link } from "react-router-dom"
import "../../styles/footer.css"

const Footer = () => {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [emailError, setEmailError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setEmailError("")

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address.")
      return
    }

    setSubscribed(true)
    setEmail("")
    setTimeout(() => setSubscribed(false), 4500)
  }

  return (
    <footer className="stitch-footer">
      <div className="stitch-footer-inner">
        {/* Brand & Newsletter */}
        <div className="stitch-footer-brand-col">
          <h2 className="stitch-footer-logo-text">SHOPSPHERE INDIA</h2>
          <p className="stitch-footer-subtext">
            Join our newsletter for early access to limited edition drops, exclusive member perks, and design travel inspiration across India.
          </p>
          <form onSubmit={handleSubmit} className="stitch-footer-newsletter-wrap">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError("")
              }}
              placeholder="Enter your email"
              className="stitch-footer-email-input"
            />
            <button type="submit" className="stitch-footer-subscribe-btn">
              Subscribe
            </button>
          </form>
          {emailError && (
            <p style={{ marginTop: "0.5rem", fontSize: "12px", color: "#f87171" }}>
              {emailError}
            </p>
          )}
          {subscribed && (
            <p style={{ marginTop: "0.5rem", fontSize: "13px", color: "#4ade80" }}>
              ✓ Thank you for subscribing! Check your inbox for your welcome perk.
            </p>
          )}
        </div>

        {/* Links Columns */}
        <div className="stitch-footer-links-group">
          {/* SECTION 1: SHOP */}
          <div className="stitch-footer-col">
            <p className="stitch-footer-col-title">Shop</p>
            <Link to="/shop" className="stitch-footer-link">All Products</Link>
            <Link to="/shop?sort=new" className="stitch-footer-link">New Arrivals</Link>
            <Link to="/shop?sort=price-high" className="stitch-footer-link">Best Sellers</Link>
            <Link to="/shop?category=accessories" className="stitch-footer-link">Collections</Link>
          </div>

          {/* SECTION 2: EXPLORE */}
          <div className="stitch-footer-col">
            <p className="stitch-footer-col-title">Explore</p>
            <Link to="/shop" className="stitch-footer-link">All Collections</Link>
            <Link to="/shop?category=accessories" className="stitch-footer-link">Bags &amp; Carry</Link>
            <Link to="/shop?category=travel" className="stitch-footer-link">Cabin Luggage</Link>
            <Link to="/shop?category=electronics" className="stitch-footer-link">Audio Essentials</Link>
          </div>

          {/* SECTION 3: CUSTOMER CARE */}
          <div className="stitch-footer-col">
            <p className="stitch-footer-col-title">Customer Care</p>
            <a href="mailto:contact@shopsphere.in" className="stitch-footer-link">Contact Us</a>
            <Link to="/shop" className="stitch-footer-link">Pan-India Delivery</Link>
            <Link to="/shop" className="stitch-footer-link">7-Day Returns &amp; Exchange</Link>
            <Link to="/shop" className="stitch-footer-link">GST Invoice FAQs</Link>
          </div>

          {/* SECTION 4: LEGAL */}
          <div className="stitch-footer-col">
            <p className="stitch-footer-col-title">Legal</p>
            <Link to="/shop" className="stitch-footer-link">Privacy Policy</Link>
            <Link to="/shop" className="stitch-footer-link">Terms of Service</Link>
            <span style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
              GSTIN: 29AAAAA0000A1Z5
            </span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="stitch-footer-bottom">
        <p className="stitch-footer-copy">© 2026 SHOPSPHERE INDIA PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  )
}

export default Footer

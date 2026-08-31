import React from "react"
import { Link } from "react-router-dom"
import "../../styles/pages.css"

const NotFound = () => {
  return (
    <main className="stitch-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="stitch-empty-cart" style={{ maxWidth: "540px", width: "100%" }}>
        <h1 style={{ fontSize: "80px", fontWeight: 700, color: "#000000", lineHeight: 1, marginBottom: "0.5rem", letterSpacing: "-0.04em" }}>
          404
        </h1>
        <h2 className="stitch-empty-title">
          Page Not Found
        </h2>
        <p className="stitch-empty-desc">
          The page you are looking for doesn't exist, was removed, or is temporarily unavailable.
        </p>
        <Link to="/" className="stitch-checkout-btn" style={{ maxWidth: "220px", display: "inline-block", textAlign: "center" }}>
          Back to Homepage
        </Link>
      </div>
    </main>
  )
}

export default NotFound

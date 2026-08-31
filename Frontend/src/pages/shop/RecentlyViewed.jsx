import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getRecentlyViewed, clearRecentlyViewed } from "../../utils/recentlyViewed"
import ProductCard from "../../components/product/ProductCard"
import "../../styles/pages.css"

const RecentlyViewed = () => {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(getRecentlyViewed())
  }, [])

  const handleClear = () => {
    clearRecentlyViewed()
    setItems([])
  }

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Header */}
      <section className="stitch-hero">
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <span className="stitch-breadcrumb-current">Recently Viewed</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          BROWSING TRAIL
        </div>

        <h1 className="stitch-hero-title">
          Recently Viewed ({items.length})
        </h1>

        <p className="stitch-hero-desc">
          Quickly revisit technical gear, cabin luggage, and studio acoustics you recently inspected.
        </p>
      </section>

      {/* Action Bar */}
      {items.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: "1rem" }}>
          <span style={{ fontSize: "13px", color: "#5d5f5f", fontWeight: 600 }}>
            {items.length} {items.length === 1 ? "Product Tracked" : "Products Tracked"}
          </span>

          <button
            onClick={handleClear}
            className="stitch-filter-pill"
            style={{ color: "#8c8e8e" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete_outline</span>
            <span>Clear History</span>
          </button>
        </div>
      )}

      {/* Grid or Empty State */}
      {items.length === 0 ? (
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon">history</span>
          <h2 className="stitch-empty-title">No recently viewed products</h2>
          <p className="stitch-empty-desc">
            As you explore our catalog, the items you inspect will automatically appear here for easy comparison.
          </p>
          <Link to="/shop" className="stitch-checkout-btn" style={{ maxWidth: "200px", textDecoration: "none" }}>
            Explore Catalog
          </Link>
        </div>
      ) : (
        <section className="stitch-grid">
          {items.map((product, idx) => (
            <ProductCard key={product._id || product.id} product={product} index={idx} />
          ))}
        </section>
      )}
    </main>
  )
}

export default RecentlyViewed

import React from "react"
import { Link } from "react-router-dom"
import { useWishlist } from "../../context/WishlistContext"
import { useCart } from "../../context/CartContext"
import { useToast } from "../../context/ToastContext"
import ProductCard from "../../components/product/ProductCard"
import "../../styles/pages.css"

const Wishlist = () => {
  const { wishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const handleAddAllToCart = () => {
    if (!wishlist.length) return
    wishlist.forEach(product => {
      addToCart(product, 1)
    })
    showToast(null, `Added ${wishlist.length} saved items to your Bag`)
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
          <span className="stitch-breadcrumb-current">Wishlist</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          SAVED ESSENTIALS
        </div>

        <h1 className="stitch-hero-title">
          Wishlist ({wishlist.length})
        </h1>

        <p className="stitch-hero-desc">
          Your private curation of technical carry, cabin luggage, and acoustics reserved for future journeys.
        </p>
      </section>

      {/* Action Bar */}
      {wishlist.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: "1rem" }}>
          <span style={{ fontSize: "13px", color: "#5d5f5f", fontWeight: 600 }}>
            {wishlist.length} {wishlist.length === 1 ? "Item Saved" : "Items Saved"}
          </span>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={clearWishlist}
              className="stitch-filter-pill"
              style={{ color: "#8c8e8e" }}
            >
              Clear All
            </button>
            <button
              onClick={handleAddAllToCart}
              className="stitch-sort-pill"
              style={{ padding: "0.5rem 1.25rem" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>shopping_bag</span>
              <span>Move All to Bag</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon">favorite_border</span>
          <h2 className="stitch-empty-title">Your wishlist is empty</h2>
          <p className="stitch-empty-desc">
            Save products you love while browsing, and find them easily here whenever you are ready to shop.
          </p>
          <Link to="/shop" className="stitch-checkout-btn" style={{ maxWidth: "200px", textDecoration: "none" }}>
            Explore Catalog
          </Link>
        </div>
      ) : (
        <section className="stitch-grid">
          {wishlist.map((product, idx) => (
            <ProductCard key={product._id || product.id} product={product} index={idx} />
          ))}
        </section>
      )}
    </main>
  )
}

export default Wishlist

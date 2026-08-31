import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"

const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [added, setAdded] = useState(false)
  const [imgSrc, setImgSrc] = useState(product.imageURL || product.image || fallbackImage)

  const productId = product._id || product.id
  const isSaved = isInWishlist(productId)

  const price = Number(product.price) || 0
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null
  const discountPercent = product.discount || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null)
  const rating = product.averageRating || product.rating || 4.8

  // Check for secondary preview image for subtle crossfade on hover
  const secondaryImg = product.images && product.images.length > 1 && product.images[1] !== imgSrc
    ? product.images[1]
    : null

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article
      className="stitch-product-card group"
      data-tone={index % 4}
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {/* Image Stage with Badges & Wishlist Button */}
      <div className="stitch-card-image-wrap">
        {/* Discount & Rating Badges */}
        <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 4, display: "flex", flexDirection: "column", gap: "6px" }}>
          {discountPercent > 0 && (
            <span
              style={{
                background: "#000000",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "3px 8px",
                borderRadius: "9999px",
                textTransform: "uppercase"
              }}
            >
              {discountPercent}% OFF
            </span>
          )}
          <span
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(6px)",
              color: "#000000",
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "9999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
            }}
          >
            <span style={{ color: "#f59e0b", fontSize: "11px" }}>★</span>
            <span>{rating}</span>
          </span>
        </div>

        {/* Wishlist Heart Action */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`stitch-card-wishlist-btn ${isSaved ? "saved" : ""}`}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "Saved to wishlist" : "Save to wishlist"}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "19px",
              fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
              color: isSaved ? "#e11d48" : "#1a1c1c"
            }}
          >
            favorite
          </span>
        </button>

        {/* Image Link with Hover Crossfade if secondary image exists */}
        <Link to={`/product/${productId}`} className="stitch-card-img-link">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc(fallbackImage)}
            className={`stitch-card-img primary ${secondaryImg ? "has-secondary" : ""}`}
            loading="lazy"
          />
          {secondaryImg && (
            <img
              src={secondaryImg}
              alt={`${product.name} alternate view`}
              className="stitch-card-img secondary"
              loading="lazy"
            />
          )}
        </Link>
      </div>

      {/* Product Details */}
      <div className="stitch-card-details">
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8c8e8e", marginBottom: "3px" }}>
          {product.brand || product.category || "ShopSphere"}
        </div>
        <h3 className="stitch-card-title">
          <Link to={`/product/${productId}`} style={{ color: "#000000", textDecoration: "none" }}>
            {product.name}
          </Link>
        </h3>
        {product.subtitle && (
          <p className="stitch-card-subtitle">{product.subtitle}</p>
        )}

        {/* Price Row */}
        <div className="stitch-card-price-row">
          <span className="stitch-card-price">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="stitch-card-orig-price">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Add to Bag Action */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`stitch-card-add-btn ${added ? "added" : ""}`}
          title="Add to Bag"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            {added ? "check" : "shopping_bag"}
          </span>
          <span>{added ? "ADDED TO BAG" : "ADD TO BAG"}</span>
        </button>
      </div>
    </article>
  )
}

export default ProductCard

import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { mockProducts } from "../../data/products"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { useWishlist } from "../../context/WishlistContext"
import { productAPI } from "../../services/api"
import {
  fetchProductById,
  clearCurrentProduct
} from "../../redux/slices/productSlice"
import ProductCard from "../../components/product/ProductCard"
import { addRecentlyViewed } from "../../utils/recentlyViewed"
import "../../styles/productDetail.css"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  // Image Gallery
  const [activeImage, setActiveImage] = useState("")

  // Variant & Quantity selection
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("Matte Black")
  const [selectedSize, setSelectedSize] = useState("Standard")

  // PIN Code Delivery Checker State
  const [pincode, setPincode] = useState("")
  const [pinStatus, setPinStatus] = useState(null)

  // Accordion open states
  const [accordionOpen, setAccordionOpen] = useState({
    highlights: true,
    specs: true,
    box: false,
    shipping: false,
    reviews: true
  })

  // Reviews
  const [userRating, setUserRating] = useState(5)
  const [userComment, setUserComment] = useState("")
  const [reviewsList, setReviewsList] = useState([])
  const [reviewMsg, setReviewMsg] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"

  // Fetch product from DB / API via Redux
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true)
      try {
        const resultAction = await dispatch(fetchProductById(id))
        const data = fetchProductById.fulfilled.match(resultAction)
          ? resultAction.payload
          : null

        if (data) {
          setProduct(data)
          setActiveImage(data.imageURL || data.image || (data.images && data.images[0]) || fallbackImage)
          setReviewsList(data.reviews || [])

          // Fetch related products in the same category
          const allProds = await productAPI.getAll({ category: data.category })
          const filtered = allProds.filter((p) => (p._id || p.id) !== (data._id || data.id)).slice(0, 4)
          setRelatedProducts(filtered)
          addRecentlyViewed(data)
        } else {
          throw new Error("Product not found")
        }
      } catch (err) {
        console.warn("Product fallback error:", err)
        const fallback = mockProducts.find((p) => p.id === id || p._id === id) || mockProducts[0]
        setProduct(fallback)
        setActiveImage(fallback.imageURL || fallback.image || fallbackImage)
        addRecentlyViewed(fallback)
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
    window.scrollTo(0, 0)

    return () => {
      dispatch(clearCurrentProduct())
    }
  }, [id, dispatch])

  if (loading) {
    return (
      <main className="stitch-pdp-container">
        <div style={{ textAlign: "center", padding: "6rem 0", color: "#5d5f5f" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "40px", animation: "spin 1s linear infinite" }}>
            sync
          </span>
          <p style={{ marginTop: "1rem", fontSize: "16px", fontWeight: 600 }}>Loading product details...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="stitch-pdp-container">
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon">error_outline</span>
          <h2 className="stitch-empty-title">Product Not Found</h2>
          <p className="stitch-empty-desc">The requested product could not be located in our catalog.</p>
          <Link to="/shop" className="stitch-checkout-btn" style={{ maxWidth: "200px" }}>
            Return to Shop
          </Link>
        </div>
      </main>
    )
  }

  const productId = product._id || product.id
  const isFavorite = isInWishlist(productId)
  const isOutOfStock = product.countInStock !== undefined && product.countInStock <= 0
  const isLowStock = product.countInStock > 0 && product.countInStock <= 5

  // Combine gallery images
  const allImages = Array.from(
    new Set([product.imageURL, product.image, ...(product.images || [])].filter(Boolean))
  )
  if (allImages.length === 0) {
    allImages.push(fallbackImage)
  }

  const mrp = product.originalPrice || (product.price ? Math.round(product.price * 1.25) : 0)
  const discountPercent = product.discount || (mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0)

  // PIN Code check handler
  const handleCheckPincode = (e) => {
    e.preventDefault()
    const cleanPin = pincode.trim()
    if (!/^\d{6}$/.test(cleanPin)) {
      setPinStatus({ valid: false, msg: "Please enter a valid 6-digit Indian PIN code." })
      return
    }
    setPinStatus({
      valid: true,
      msg: `Delivery available to ${cleanPin}. Estimated doorstep delivery in 2–4 business days with Free Express Pan-India Shipping & Cash on Delivery.`
    })
  }

  // Cart actions
  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        selectedColor,
        selectedSize
      },
      quantity
    )
  }

  const handleBuyNow = () => {
    addToCart(
      {
        ...product,
        selectedColor,
        selectedSize
      },
      quantity
    )
    navigate("/checkout")
  }

  // Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!userComment.trim()) return

    setIsSubmittingReview(true)
    const newRev = {
      _id: "rev_" + Date.now(),
      name: user?.name || "Verified Buyer",
      rating: userRating,
      comment: userComment.trim(),
      createdAt: new Date().toISOString()
    }

    try {
      await productAPI.addReview(productId, {
        rating: userRating,
        comment: userComment.trim()
      })
      setReviewsList([newRev, ...reviewsList])
      setUserComment("")
      setReviewMsg("✓ Review posted successfully!")
      setTimeout(() => setReviewMsg(""), 3500)
    } catch (err) {
      setReviewsList([newRev, ...reviewsList])
      setUserComment("")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <main className="stitch-pdp-container stitch-page-enter">
      {/* Top Nav & Breadcrumbs */}
      <div className="stitch-pdp-nav-bar">
        <Link to="/shop" className="stitch-pdp-back-btn">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          <span>Back to Catalog</span>
        </Link>
        <nav className="stitch-pdp-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Catalog</Link>
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category || "All")}`}>
            {product.category || "All"}
          </Link>
          <span>/</span>
          <span className="active">{product.name}</span>
        </nav>
      </div>

      {/* Main PDP Split View */}
      <div className="stitch-pdp-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)", gap: "3rem", alignItems: "start", marginBottom: "4rem" }}>
        {/* Left Column: Gallery Section */}
        <div className="stitch-gallery-wrapper" style={{ display: "flex", gap: "1rem", minWidth: 0, width: "100%" }}>
          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="stitch-thumb-strip" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "5rem", flexShrink: 0 }}>
              {allImages.map((imgSrc, idx) => (
                <button
                  key={idx}
                  className={`stitch-thumb-btn ${activeImage === imgSrc ? "active" : ""}`}
                  onClick={() => setActiveImage(imgSrc)}
                  aria-label={`View thumbnail ${idx + 1}`}
                  style={{ width: "4.5rem", height: "4.5rem", padding: "4px", borderRadius: "8px", background: "#f3f3f3", border: activeImage === imgSrc ? "2px solid #000" : "1px solid #e5e5e5", cursor: "pointer", overflow: "hidden" }}
                >
                  <img
                    src={imgSrc}
                    alt={`${product.name} view ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = fallbackImage
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Showcase Stage */}
          <div
            className="stitch-main-stage"
            style={{
              flex: "1 1 0%",
              minWidth: 0,
              width: "100%",
              height: "460px",
              maxHeight: "480px",
              backgroundColor: "#F3F3F3",
              borderRadius: "12px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              boxSizing: "border-box"
            }}
          >
            <button
              className="stitch-wishlist-fab"
              onClick={() => toggleWishlist(product)}
              aria-label={isFavorite ? "Remove from Wishlist" : "Save to Wishlist"}
              title={isFavorite ? "Saved in Wishlist" : "Save to Wishlist"}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "22px",
                  fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
                  color: isFavorite ? "#e11d48" : "#000000"
                }}
              >
                favorite
              </span>
            </button>
            <img
              src={activeImage || product.imageURL || product.image || fallbackImage}
              alt={product.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block"
              }}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = fallbackImage
              }}
            />
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Controls */}
        <div className="stitch-info-col" style={{ minWidth: 0, width: "100%" }}>
          {/* Brand Tag */}
          <div className="stitch-pdp-brand-tag">{product.brand || product.category || "ShopSphere Premium"}</div>

          {/* Title */}
          <h1 className="stitch-pdp-title">{product.name}</h1>

          {/* Badges & Rating */}
          <div className="stitch-badge-rating-row">
            <div className="stitch-rating-badge">
              <span>{product.rating || 4.8}</span>
              <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <a
              href="#reviews"
              className="stitch-reviews-count-text"
              onClick={(e) => {
                e.preventDefault()
                setAccordionOpen({ ...accordionOpen, reviews: true })
                document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              {reviewsList.length} verified ratings
            </a>

            {/* Stock Badge */}
            <span
              className={`stitch-stock-badge ${
                isOutOfStock ? "out-of-stock" : isLowStock ? "low-stock" : "in-stock"
              }`}
            >
              {isOutOfStock
                ? "● Out of Stock"
                : isLowStock
                ? `● Only ${product.countInStock || 3} Left in Stock`
                : `● In Stock (${product.countInStock !== undefined ? product.countInStock : 25} units available)`}
            </span>

            {product.sku && (
              <span style={{ fontSize: "11px", color: "#8c8e8e", textTransform: "uppercase" }}>
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Price Block */}
          <div className="stitch-pdp-price-row">
            <span className="stitch-pdp-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {mrp > product.price && (
              <span className="stitch-pdp-mrp">
                MRP ₹{Number(mrp).toLocaleString("en-IN")}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="stitch-pdp-discount-pill">{discountPercent}% OFF</span>
            )}
          </div>
          <p className="stitch-pdp-tax-notice">
            Inclusive of all GST taxes. Free Pan-India express delivery on all orders.
          </p>

          {/* Product Description Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5d5f5f", marginBottom: "0.5rem" }}>
              Product Description
            </h3>
            <p className="stitch-pdp-desc" style={{ marginBottom: 0 }}>
              {product.description}
            </p>
          </div>

          {/* Color Selection (if applicable) */}
          <div className="stitch-selector-block">
            <div className="stitch-selector-header">
              <span>Color / Finish: <strong>{selectedColor}</strong></span>
            </div>

            <div className="stitch-color-swatches">
              {[
                { name: "Matte Black", hex: "#000000" },
                { name: "Slate Grey", hex: "#4A5568" },
                { name: "Raw Titanium", hex: "#A0AEC0" },
                { name: "Sage Olive", hex: "#829285" }
              ].map((c) => (
                <button
                  key={c.name}
                  className={`stitch-color-btn ${selectedColor === c.name ? "active" : ""}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Capacity / Size Selection */}
          <div className="stitch-selector-block">
            <div className="stitch-selector-header">
              <span>Option / Capacity</span>
            </div>
            <div className="stitch-size-pills">
              {["Standard", "256 GB / 18L", "512 GB / 24L"].map((sz) => (
                <button
                  key={sz}
                  className={`stitch-size-btn ${selectedSize === sz ? "active" : ""}`}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="stitch-selector-block">
            <div className="stitch-selector-header">
              <span>Quantity</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cfc4c5", borderRadius: "9999px", background: "#fff" }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: "38px", height: "38px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: 700 }}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span style={{ width: "36px", textAlign: "center", fontSize: "14px", fontWeight: 700 }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.countInStock || 10, quantity + 1))}
                disabled={isOutOfStock || quantity >= (product.countInStock || 10)}
                style={{ width: "38px", height: "38px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: 700 }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Actions: ADD TO BAG & BUY NOW */}
          <div className="stitch-action-buttons">
            <button
              className="stitch-btn-black"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <span>{isOutOfStock ? "OUT OF STOCK" : "ADD TO BAG"}</span>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                shopping_bag
              </span>
            </button>

            <button
              className="stitch-btn-white"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              BUY IT NOW
            </button>
          </div>

          {/* Policy Badges */}
          <div className="stitch-policy-row">
            <div className="stitch-policy-item">
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#000" }}>
                autorenew
              </span>
              <span className="title">{product.returnPolicy?.returnWindow || "7-Day Returns"}</span>
              <span className="sub">Doorstep exchange</span>
            </div>
            <div className="stitch-policy-item">
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#000" }}>
                verified_user
              </span>
              <span className="title">{product.returnPolicy?.warranty || "1 Year Warranty"}</span>
              <span className="sub">Manufacturer cover</span>
            </div>
            <div className="stitch-policy-item">
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#000" }}>
                local_shipping
              </span>
              <span className="title">Pan-India Express</span>
              <span className="sub">Free on this item</span>
            </div>
          </div>

          {/* PIN Code Delivery Checker */}
          <div className="stitch-pincode-card">
            <div className="stitch-pincode-header">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                pin_drop
              </span>
              <span>Check Delivery Availability</span>
            </div>
            <form onSubmit={handleCheckPincode} className="stitch-pincode-form">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="stitch-pincode-input"
              />
              <button type="submit" className="stitch-pincode-btn">
                Check
              </button>
            </form>
            {pinStatus && (
              <p
                className="stitch-pincode-result"
                style={{ color: pinStatus.valid ? "#15803d" : "#dc2626", fontWeight: 500 }}
              >
                {pinStatus.msg}
              </p>
            )}
          </div>

          {/* Offers & Discounts Box */}
          <div className="stitch-offers-box">
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                sell
              </span>
              <span>Available Offers &amp; Discounts</span>
            </div>
            <div className="stitch-offer-item">
              <strong style={{ background: "#000", color: "#fff", padding: "1px 6px", borderRadius: "4px", fontSize: "11px" }}>
                SPHERE10
              </strong>
              <span>Get 10% instant discount on orders above ₹1,999. Applied at checkout.</span>
            </div>
            <div className="stitch-offer-item">
              <strong style={{ background: "#e8e8e8", color: "#000", padding: "1px 6px", borderRadius: "4px", fontSize: "11px" }}>
                UPI BONUS
              </strong>
              <span>Extra 5% instant cashback on UPI &amp; NetBanking Indian payment gateways.</span>
            </div>
          </div>

          {/* Collapsible Accordions: Highlights, Specs, What's In The Box, Reviews */}
          <div className="stitch-accordion-wrap">
            {/* Product Highlights */}
            <div
              className="stitch-accordion-item"
              onClick={() => setAccordionOpen({ ...accordionOpen, highlights: !accordionOpen.highlights })}
            >
              <span>PRODUCT HIGHLIGHTS</span>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                {accordionOpen.highlights ? "remove" : "add"}
              </span>
            </div>
            {accordionOpen.highlights && (
              <ul className="stitch-highlights-list">
                {(product.features && product.features.length > 0
                  ? product.features
                  : [
                      "Engineered with aerospace-grade durability and minimalist aesthetics.",
                      "Weatherproof sealed construction suited for demanding Indian travel and commutes.",
                      "Precision ergonomic weight distribution for long hours of comfortable usage.",
                      "Backed by a 1-year comprehensive manufacturer replacement guarantee."
                    ]
                ).map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
            )}

            {/* Specifications Table */}
            <div
              className="stitch-accordion-item"
              onClick={() => setAccordionOpen({ ...accordionOpen, specs: !accordionOpen.specs })}
            >
              <span>TECHNICAL SPECIFICATIONS</span>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                {accordionOpen.specs ? "remove" : "add"}
              </span>
            </div>
            {accordionOpen.specs && (
              <table className="stitch-specs-table">
                <tbody>
                  <tr>
                    <td className="key">Brand</td>
                    <td className="val">{product.brand || "ShopSphere"}</td>
                  </tr>
                  <tr>
                    <td className="key">Category</td>
                    <td className="val">{product.category || "General"}</td>
                  </tr>
                  {product.sku && (
                    <tr>
                      <td className="key">Model / SKU</td>
                      <td className="val">{product.sku}</td>
                    </tr>
                  )}
                  {product.specifications && product.specifications.length > 0 ? (
                    product.specifications.map((sp, idx) => (
                      <tr key={idx}>
                        <td className="key">{sp.key}</td>
                        <td className="val">{sp.value}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="key">Material</td>
                        <td className="val">Technical Water-Resistant Polycarbonate / Canvas</td>
                      </tr>
                      <tr>
                        <td className="key">Country of Origin</td>
                        <td className="val">India</td>
                      </tr>
                      <tr>
                        <td className="key">Warranty</td>
                        <td className="val">{product.returnPolicy?.warranty || "1 Year Manufacturer Warranty"}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            )}

            {/* What's In The Box */}
            <div
              className="stitch-accordion-item"
              onClick={() => setAccordionOpen({ ...accordionOpen, box: !accordionOpen.box })}
            >
              <span>WHAT'S IN THE BOX</span>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                {accordionOpen.box ? "remove" : "add"}
              </span>
            </div>
            {accordionOpen.box && (
              <ul className="stitch-highlights-list">
                {(product.whatsInTheBox && product.whatsInTheBox.length > 0
                  ? product.whatsInTheBox
                  : [
                      `1x ${product.name}`,
                      "1x Quick Start Guide & Warranty Certificate",
                      "1x Protective Dust Bag / Packaging"
                    ]
                ).map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ul>
            )}

            {/* Customer Reviews Section */}
            <div
              id="reviews-section"
              className="stitch-accordion-item"
              onClick={() => setAccordionOpen({ ...accordionOpen, reviews: !accordionOpen.reviews })}
            >
              <span>CUSTOMER REVIEWS ({reviewsList.length})</span>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                {accordionOpen.reviews ? "remove" : "add"}
              </span>
            </div>
            {accordionOpen.reviews && (
              <div style={{ padding: "1.25rem 0" }}>
                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} style={{ background: "#f9f9f9", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Write a Verified Review
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "13px", color: "#5d5f5f" }}>Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        style={{ color: star <= userRating ? "#000" : "#ccc", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows="3"
                    required
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Share details of your experience with this product..."
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cfc4c5", fontSize: "14px", fontFamily: "inherit", outline: "none", marginBottom: "0.75rem" }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      style={{ background: "#000", color: "#fff", padding: "0.6rem 1.4rem", borderRadius: "9999px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                    >
                      {isSubmittingReview ? "Posting..." : "Post Review"}
                    </button>
                    {reviewMsg && <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>{reviewMsg}</span>}
                  </div>
                </form>

                {/* Reviews List */}
                {reviewsList.length === 0 ? (
                  <p style={{ color: "#5d5f5f", fontSize: "14px" }}>No customer reviews yet. Be the first to leave a review!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {reviewsList.map((rev, idx) => (
                      <div key={rev._id || idx} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", alignItems: "center" }}>
                          <strong style={{ fontSize: "14px" }}>{rev.name}</strong>
                          <span style={{ color: "#000", fontSize: "13px" }}>{"★".repeat(rev.rating)}</span>
                        </div>
                        <p style={{ fontSize: "14px", color: "#5d5f5f", lineHeight: 1.5 }}>{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products / You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <section className="stitch-related-section">
          <h2 className="stitch-section-heading">YOU MAY ALSO LIKE</h2>
          <div className="stitch-grid">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd._id || relProd.id} product={relProd} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetail

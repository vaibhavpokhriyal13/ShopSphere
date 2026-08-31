import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchProducts,
  selectAllProducts,
  selectProductsLoading
} from "../../redux/slices/productSlice"
import { useToast } from "../../context/ToastContext"
import ProductCard from "../../components/product/ProductCard"
import { ProductSkeletonGrid } from "../../components/product/ProductSkeleton"
import "../../styles/pages.css"

const CATEGORIES_SHOWCASE = [
  {
    id: "accessories",
    name: "Bags & Technical Carry",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=accessories"
  },
  {
    id: "travel",
    name: "Precision Cabin Luggage",
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=travel"
  },
  {
    id: "electronics",
    name: "Acoustic Audio & Tech",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=electronics"
  },
  {
    id: "home",
    name: "Living & Studio Objects",
    image: "https://images.unsplash.com/photo-1608248597359-0a688b532938?auto=format&fit=crop&w=800&q=80",
    link: "/shop?category=home"
  }
]

const Home = () => {
  const dispatch = useDispatch()
  const products = useSelector(selectAllProducts)
  const loading = useSelector(selectProductsLoading)
  const { showToast } = useToast()

  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  // New Arrivals: Products marked as new or first set of products
  const newArrivals = useMemo(() => {
    const fresh = products.filter(p => p.isNew)
    return fresh.length >= 4 ? fresh.slice(0, 4) : products.slice(0, 4)
  }, [products])

  // Best Sellers: Highly rated or trending items
  const bestSellers = useMemo(() => {
    const popular = products.filter(p => p.isTrending || p.rating >= 4.8)
    return popular.length >= 4 ? popular.slice(0, 4) : [...products].reverse().slice(0, 4)
  }, [products])

  // Trending / Recommended: Curated selection with variety
  const trendingProducts = useMemo(() => {
    return products.slice(2, 6).length >= 4 ? products.slice(2, 6) : products.slice(0, 4)
  }, [products])

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setSubscribed(true)
    showToast(null, "Welcome to the ShopSphere Club! Check your inbox for your 10% welcome code.")
    setNewsletterEmail("")
  }

  const heroProduct = products.length > 0 ? products[0] : null

  return (
    <main className="stitch-main stitch-page-enter">
      {/* ==================== 1. STOREFRONT HERO ==================== */}
      <section className="storefront-hero-container">
        <div className="storefront-hero-grid">
          {/* Left Hero Content */}
          <div className="storefront-hero-content">
            <div className="storefront-hero-eyebrow">
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#000" }}>
                diamond
              </span>
              <span>SHOPSPHERE INDIA • EDITION 2026</span>
            </div>

            <h1 className="storefront-hero-heading">
              Everything you need.<br />
              Made for the way you move.
            </h1>

            <p className="storefront-hero-desc">
              Curated essentials for travel, work, everyday life, and everything in between. Handcrafted technical materials engineered for seamless modern journeys.
            </p>

            <div className="storefront-hero-actions">
              <Link to="/shop" className="storefront-hero-btn-primary">
                <span>Shop Now</span>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  arrow_forward
                </span>
              </Link>

              <Link to="/collections" className="storefront-hero-btn-secondary">
                <span>Explore Collections</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Visual Showcase */}
          <div className="storefront-hero-visual">
            <img
              src={
                heroProduct?.imageURL ||
                heroProduct?.image ||
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80"
              }
              alt="ShopSphere Flagship Carry"
              className="storefront-hero-img"
            />
            <div className="storefront-hero-badge">
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8c8e8e" }}>
                FLAGSHIP DESIGN
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>
                {heroProduct?.name || "The Weekender Duffle"}
              </div>
              <div style={{ fontSize: "12px", color: "#5d5f5f", marginTop: "2px" }}>
                From ₹{(heroProduct?.price || 4999).toLocaleString("en-IN")} • ★ 4.9 / 5.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. SHOP BY CATEGORY ==================== */}
      <section className="storefront-section">
        <div className="storefront-section-header">
          <div>
            <h2 className="storefront-section-title">Shop by Category</h2>
            <p className="storefront-section-subtitle">Explore products curated for every part of your day.</p>
          </div>
          <Link to="/collections" className="storefront-view-all-link">
            <span>All Lookbooks</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
          </Link>
        </div>

        <div className="storefront-category-grid">
          {CATEGORIES_SHOWCASE.map((cat) => {
            const count = products.filter(p => p.category?.toLowerCase() === cat.id.toLowerCase()).length
            return (
              <Link key={cat.id} to={cat.link} className="storefront-category-card">
                <div className="storefront-category-img-wrap">
                  <img src={cat.image} alt={cat.name} className="storefront-category-img" loading="lazy" />
                </div>
                <div className="storefront-category-body">
                  <div>
                    <h3 className="storefront-category-name">{cat.name}</h3>
                    <span className="storefront-category-count">{count || 4} Essentials</span>
                  </div>
                  <div className="storefront-category-arrow">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ==================== 3. NEW ARRIVALS ==================== */}
      <section className="storefront-section">
        <div className="storefront-section-header">
          <div>
            <h2 className="storefront-section-title">New Arrivals</h2>
            <p className="storefront-section-subtitle">Fresh additions to the ShopSphere technical collection.</p>
          </div>
          <Link to="/shop?sort=new" className="storefront-view-all-link">
            <span>View All</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          <div className="stitch-grid">
            {newArrivals.map((product, idx) => (
              <ProductCard key={product._id || product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== 4. FEATURED EDITORIAL COLLECTION ==================== */}
      <section className="storefront-editorial-banner">
        <div className="storefront-editorial-content">
          <div className="storefront-editorial-eyebrow">
            THE TRAVEL EDIT
          </div>
          <h2 className="storefront-editorial-title">
            Travel, Reimagined.
          </h2>
          <p className="storefront-editorial-desc">
            Aerospace Bayer polycarbonate hard-shells, whisper-silent Hinomoto 360° spinner wheels, and internal compression dividers engineered for high-mileage journeys across India and beyond.
          </p>
          <Link to="/shop?category=travel" className="storefront-editorial-btn">
            <span>Explore Collection</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
          </Link>
        </div>

        <div style={{ display: "none" }}>{/* visual overlay preserved via background */}</div>
      </section>

      {/* ==================== 5. BEST SELLERS ==================== */}
      <section className="storefront-section">
        <div className="storefront-section-header">
          <div>
            <h2 className="storefront-section-title">Best Sellers</h2>
            <p className="storefront-section-subtitle">Customer favourites, chosen again and again.</p>
          </div>
          <Link to="/shop?sort=price-high" className="storefront-view-all-link">
            <span>View All</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          <div className="stitch-grid">
            {bestSellers.map((product, idx) => (
              <ProductCard key={product._id || product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== 6. SHOPSPHERE PROMISE / TRUST SIGNALS ==================== */}
      <section className="storefront-trust-bar">
        <div className="storefront-trust-item">
          <div className="storefront-trust-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>local_shipping</span>
          </div>
          <div>
            <h3 className="storefront-trust-title">Pan-India Express Delivery</h3>
            <p className="storefront-trust-desc">Complimentary air shipping across 24,000+ PIN codes on orders above ₹999.</p>
          </div>
        </div>

        <div className="storefront-trust-item">
          <div className="storefront-trust-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>verified_user</span>
          </div>
          <div>
            <h3 className="storefront-trust-title">100% Secure Payments</h3>
            <p className="storefront-trust-desc">256-bit encrypted checkout with UPI, Credit/Debit Cards, NetBanking &amp; COD.</p>
          </div>
        </div>

        <div className="storefront-trust-item">
          <div className="storefront-trust-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>replay</span>
          </div>
          <div>
            <h3 className="storefront-trust-title">7-Day Easy Returns</h3>
            <p className="storefront-trust-desc">Hassle-free doorstep pickup &amp; replacement policy for all unused products.</p>
          </div>
        </div>

        <div className="storefront-trust-item">
          <div className="storefront-trust-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>workspace_premium</span>
          </div>
          <div>
            <h3 className="storefront-trust-title">Genuine Craftsmanship</h3>
            <p className="storefront-trust-desc">Stress-tested materials with up to 3-Year Limited Hardware Warranty.</p>
          </div>
        </div>
      </section>

      {/* ==================== 7. TRENDING NOW ==================== */}
      <section className="storefront-section">
        <div className="storefront-section-header">
          <div>
            <h2 className="storefront-section-title">Trending Now</h2>
            <p className="storefront-section-subtitle">Products worth discovering for your daily routine.</p>
          </div>
          <Link to="/shop" className="storefront-view-all-link">
            <span>Explore All</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          <div className="stitch-grid">
            {trendingProducts.map((product, idx) => (
              <ProductCard key={product._id || product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== 8. NEWSLETTER SUBSCRIPTION ==================== */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "20px",
          padding: "3rem 2rem",
          textAlign: "center",
          marginBottom: "4rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8c8e8e" }}>
          THE SHOPSPHERE DISPATCH
        </span>
        <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "6px 0 8px", color: "#000", letterSpacing: "-0.02em" }}>
          Stay in the loop.
        </h2>
        <p style={{ fontSize: "14px", color: "#5d5f5f", maxWidth: "480px", margin: "0 auto 1.75rem", lineHeight: 1.55 }}>
          Get early access to limited quarterly drops, material innovations, and exclusive member discounts.
        </p>

        {subscribed ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ecfdf5", color: "#047857", padding: "10px 20px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
            <span>You're on the list! Welcome to ShopSphere.</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} style={{ display: "flex", maxWidth: "440px", margin: "0 auto", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              style={{
                flex: "1 1 240px",
                padding: "0.75rem 1.25rem",
                borderRadius: "9999px",
                border: "1px solid rgba(0, 0, 0, 0.14)",
                fontSize: "13px",
                outline: "none"
              }}
            />
            <button
              type="submit"
              className="stitch-checkout-btn"
              style={{ padding: "0.75rem 1.5rem", borderRadius: "9999px", flexShrink: 0 }}
            >
              Subscribe
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default Home

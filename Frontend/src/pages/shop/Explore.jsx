import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts, selectAllProducts, selectProductsLoading } from "../../redux/slices/productSlice"
import ProductCard from "../../components/product/ProductCard"
import { ProductSkeletonGrid } from "../../components/product/ProductSkeleton"
import "../../styles/pages.css"

const CURATED_THEMES = [
  { id: "all", label: "All Curations" },
  { id: "trending", label: "Trending This Month" },
  { id: "travel-ready", label: "Airport & Transit" },
  { id: "work-studio", label: "Studio Acoustics" },
  { id: "minimal-living", label: "Living Essentials" }
]

const Explore = () => {
  const dispatch = useDispatch()
  const products = useSelector(selectAllProducts)
  const loading = useSelector(selectProductsLoading)

  const [activeTheme, setActiveTheme] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (activeTheme === "trending") {
      list = list.filter(p => p.isTrending || p.rating >= 4.8)
    } else if (activeTheme === "travel-ready") {
      list = list.filter(p => p.category === "travel" || p.category === "accessories")
    } else if (activeTheme === "work-studio") {
      list = list.filter(p => p.category === "electronics")
    } else if (activeTheme === "minimal-living") {
      list = list.filter(p => p.category === "home")
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
    }

    return list
  }, [products, activeTheme, searchQuery])

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Header Block */}
      <section className="stitch-hero">
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <span className="stitch-breadcrumb-current">Explore</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          EDITORIAL DISCOVERY
        </div>

        <h1 className="stitch-hero-title">
          Explore Catalog
        </h1>

        <p className="stitch-hero-desc">
          Unpack high-performance travel gear, acoustic soundstages, and industrial design objects designed to accompany your daily life.
        </p>
      </section>

      {/* Featured Editorial Banner */}
      <section
        style={{
          background: "#000000",
          color: "#ffffff",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          marginBottom: "2.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
        }}
      >
        <div style={{ maxWidth: "560px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a1a1aa" }}>
            2026 Material Edition
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "6px 0 10px", lineHeight: 1.2 }}>
            Engineered for Motion &amp; Silence
          </h2>
          <p style={{ fontSize: "14px", color: "#d4d4d8", lineHeight: 1.6, margin: 0 }}>
            Every piece in our catalog is rigorously stress-tested for Indian transit conditions—from humid monsoons to packed terminal connections.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            to="/shop?category=travel"
            style={{
              background: "#ffffff",
              color: "#000000",
              padding: "0.75rem 1.4rem",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}
          >
            Shop Luggage
          </Link>
          <Link
            to="/shop?category=electronics"
            style={{
              background: "transparent",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "0.75rem 1.4rem",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}
          >
            Shop Audio
          </Link>
        </div>
      </section>

      {/* Theme Filter Pills & Search */}
      <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {CURATED_THEMES.map((theme) => {
            const isActive = activeTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className="stitch-filter-pill"
                style={{
                  background: isActive ? "#000000" : "#ffffff",
                  color: isActive ? "#ffffff" : "#000000",
                  borderColor: isActive ? "#000000" : "rgba(0,0,0,0.12)",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "0.5rem 1.1rem"
                }}
              >
                {theme.label}
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", minWidth: "240px", flexGrow: 1, maxWidth: "340px" }}>
          <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8c8e8e", fontSize: "16px" }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 1.8rem 0.5rem 2.2rem",
              borderRadius: "9999px",
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#ffffff",
              fontSize: "13px",
              outline: "none"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8c8e8e" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
            </button>
          )}
        </div>
      </section>

      {/* Dynamic Count Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: "0.75rem" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8c8e8e" }}>
          Showing {filteredProducts.length} Curated {filteredProducts.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <ProductSkeletonGrid count={8} />
      ) : filteredProducts.length === 0 ? (
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon">inventory_2</span>
          <h2 className="stitch-empty-title">No items found</h2>
          <p className="stitch-empty-desc">No products matched your exploration criteria. Try picking another curation theme.</p>
          <button onClick={() => { setActiveTheme("all"); setSearchQuery(""); }} className="stitch-checkout-btn" style={{ maxWidth: "200px" }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <section className="stitch-grid">
          {filteredProducts.map((p, idx) => (
            <ProductCard key={p._id || p.id} product={p} index={idx} />
          ))}
        </section>
      )}
    </main>
  )
}

export default Explore

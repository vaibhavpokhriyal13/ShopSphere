import React from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectAllProducts } from "../../redux/slices/productSlice"
import "../../styles/pages.css"

const COLLECTIONS_METADATA = [
  {
    id: "accessories",
    title: "Bags & Technical Carry",
    subtitle: "Duffels, Daypacks & Executive Folios",
    description: "Engineered from water-resistant reinforced canvas and vegetable-tanned leather. Designed for modern transit, weekend escapes, and seamless airport commutes.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
    badge: "Most Popular",
    link: "/shop?category=accessories"
  },
  {
    id: "travel",
    title: "Precision Cabin Luggage",
    subtitle: "Aerospace Polycarbonate Hard-Shells",
    description: "Ultra-silent 360° Japanese Hinomoto wheels, integrated TSA combination locks, and internal compression compartments for high-mileage globetrotters.",
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=1200&q=80",
    badge: "Flagship Gear",
    link: "/shop?category=travel"
  },
  {
    id: "electronics",
    title: "Acoustic Audio & Everyday Tech",
    subtitle: "Studio-Grade ANC & Wireless Power",
    description: "Bespoke acoustic transducers, aerospace aluminum housings, and rapid MagSafe induction charging stations built for focused work sessions.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    badge: "High Fidelity",
    link: "/shop?category=electronics"
  },
  {
    id: "home",
    title: "Living & Studio Essentials",
    subtitle: "Architectural Ceramic & Desk Objects",
    description: "Matte porcelain ultrasonic aroma diffusers, solid brass desk accessories, and minimalist tactile home goods curated for elevated living spaces.",
    image: "https://images.unsplash.com/photo-1608248597359-0a688b532938?auto=format&fit=crop&w=1200&q=80",
    badge: "Refined Spaces",
    link: "/shop?category=home"
  }
]

const Collections = () => {
  const products = useSelector(selectAllProducts)

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Header Block */}
      <section className="stitch-hero">
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <span className="stitch-breadcrumb-current">Collections</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          CURATED LOOKBOOKS
        </div>

        <h1 className="stitch-hero-title">
          Signature Collections
        </h1>

        <p className="stitch-hero-desc">
          Explore our purposeful lines of technical travel gear, precision acoustic audio, and architectural home objects crafted for modern Indian living.
        </p>
      </section>

      {/* Collections Showcase Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
        {COLLECTIONS_METADATA.map((col) => {
          const matchingCount = products.filter(p => p.category?.toLowerCase() === col.id.toLowerCase()).length
          const matchingPrices = products.filter(p => p.category?.toLowerCase() === col.id.toLowerCase()).map(p => Number(p.price))
          const minPrice = matchingPrices.length ? Math.min(...matchingPrices) : null

          return (
            <div
              key={col.id}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.25s ease, box-shadow 0.25s ease"
              }}
              className="stitch-collection-card"
            >
              {/* Image banner */}
              <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                <img
                  src={col.image}
                  alt={col.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  className="stitch-collection-img"
                />
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "9999px"
                  }}
                >
                  {col.badge}
                </span>
                <span
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(6px)",
                    color: "#000",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "9999px"
                  }}
                >
                  {matchingCount || "Curated"} Items
                </span>
              </div>

              {/* Text Body */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8c8e8e", marginBottom: "4px" }}>
                  {col.subtitle}
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "#000" }}>
                  {col.title}
                </h2>
                <p style={{ fontSize: "14px", color: "#5d5f5f", lineHeight: 1.55, margin: "0 0 1.25rem", flexGrow: 1 }}>
                  {col.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#8c8e8e", textTransform: "uppercase", display: "block" }}>Starting From</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#000" }}>
                      {minPrice ? `₹${minPrice.toLocaleString("en-IN")}` : "Explore"}
                    </span>
                  </div>

                  <Link
                    to={col.link}
                    className="stitch-checkout-btn"
                    style={{ padding: "0.6rem 1.25rem", fontSize: "12px", borderRadius: "9999px", textDecoration: "none" }}
                  >
                    <span>View Collection</span>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}

export default Collections

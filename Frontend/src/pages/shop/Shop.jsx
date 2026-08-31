import React, { useState, useEffect, useMemo, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useSearchParams } from "react-router-dom"
import { mockCategories } from "../../data/products"
import {
  fetchProducts,
  selectAllProducts,
  selectProductsLoading
} from "../../redux/slices/productSlice"
import ProductCard from "../../components/product/ProductCard"
import { ProductSkeletonGrid } from "../../components/product/ProductSkeleton"
import "../../styles/pages.css"

const COLOR_OPTIONS = [
  { id: "all", label: "All Colors" },
  { id: "black", label: "Matte Black" },
  { id: "grey", label: "Slate Grey" },
  { id: "titanium", label: "Raw Titanium" },
  { id: "olive", label: "Sage Olive" }
]

const FEATURE_OPTIONS = [
  { id: "all", label: "All Features" },
  { id: "waterproof", label: "Waterproof" },
  { id: "lightweight", label: "Lightweight" },
  { id: "anc", label: "Noise Cancelling" },
  { id: "ergonomic", label: "Ergonomic Design" }
]

const PRICE_OPTIONS = [
  { id: "all", label: "All Prices", max: Infinity },
  { id: "3000", label: "Under ₹3,000", max: 3000 },
  { id: "5000", label: "Under ₹5,000", max: 5000 },
  { id: "10000", label: "Under ₹10,000", max: 10000 },
  { id: "50000", label: "Under ₹50,000", max: 50000 }
]

const SORT_OPTIONS = [
  { id: "new", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" }
]

const Shop = () => {
  const dispatch = useDispatch()
  const products = useSelector(selectAllProducts)
  const loading = useSelector(selectProductsLoading)

  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get("category") || "all"
  const searchParam = searchParams.get("search") || searchParams.get("q") || ""
  const sortParam = searchParams.get("sort") || "new"

  // Filter States
  const [selectedColor, setSelectedColor] = useState("all")
  const [selectedFeature, setSelectedFeature] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [selectedSort, setSelectedSort] = useState(sortParam)

  // Dropdown State
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const filterBarRef = useRef(null)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    if (sortParam) setSelectedSort(sortParam)
  }, [sortParam])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenDropdown(null)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products]

    // Search query filter
    if (searchParam.trim()) {
      const q = searchParam.toLowerCase().trim()
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase()
        const brand = (p.brand || "").toLowerCase()
        const category = (p.category || "").toLowerCase()
        const subtitle = (p.subtitle || "").toLowerCase()
        const desc = (p.description || "").toLowerCase()
        const feats = (p.features || []).join(" ").toLowerCase()
        return name.includes(q) || brand.includes(q) || category.includes(q) || subtitle.includes(q) || desc.includes(q) || feats.includes(q)
      })
    }

    // Category filter from URL params
    if (categoryParam !== "all") {
      list = list.filter(
        (p) => p.category && p.category.toLowerCase() === categoryParam.toLowerCase()
      )
    }

    // Color filter
    if (selectedColor !== "all") {
      const col = selectedColor.toLowerCase()
      list = list.filter((p) => {
        const text = `${p.name || ""} ${p.subtitle || ""} ${p.description || ""}`.toLowerCase()
        return text.includes(col)
      })
    }

    // Feature filter
    if (selectedFeature !== "all") {
      const feat = selectedFeature.toLowerCase()
      list = list.filter((p) => {
        const featText = (p.features || []).join(" ").toLowerCase()
        const text = `${p.name || ""} ${p.description || ""} ${featText}`.toLowerCase()
        return text.includes(feat)
      })
    }

    // Price filter
    if (selectedPrice !== "all") {
      const maxPrice = Number(selectedPrice)
      if (!isNaN(maxPrice)) {
        list = list.filter((p) => Number(p.price) <= maxPrice)
      }
    }

    // Sorting
    if (selectedSort === "price-low") {
      list.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (selectedSort === "price-high") {
      list.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (selectedSort === "rating") {
      list.sort((a, b) => (b.averageRating || b.rating || 4.5) - (a.averageRating || a.rating || 4.5))
    }

    return list
  }, [products, categoryParam, searchParam, selectedColor, selectedFeature, selectedPrice, selectedSort])

  const handleCategory = (cat) => {
    if (cat === "all") {
      searchParams.delete("category")
    } else {
      searchParams.set("category", cat)
    }
    setSearchParams(searchParams)
    setOpenDropdown(null)
  }

  const handleResetFilters = () => {
    searchParams.delete("category")
    searchParams.delete("search")
    searchParams.delete("q")
    searchParams.delete("sort")
    setSearchParams(searchParams)
    setSelectedColor("all")
    setSelectedFeature("all")
    setSelectedPrice("all")
    setSelectedSort("new")
    setOpenDropdown(null)
    setIsMobileFilterOpen(false)
  }

  const categoryLabel = categoryParam === "all" ? "All" : mockCategories.find((c) => c.id === categoryParam)?.name || categoryParam
  const colorLabel = COLOR_OPTIONS.find((c) => c.id === selectedColor)?.label || "All"
  const featureLabel = FEATURE_OPTIONS.find((f) => f.id === selectedFeature)?.label || "All"
  const priceLabel = PRICE_OPTIONS.find((p) => p.id === selectedPrice)?.label || "Under ₹50,000"
  const sortLabel = SORT_OPTIONS.find((s) => s.id === selectedSort)?.label || "Featured"

  const hasActiveFilters = categoryParam !== "all" || selectedColor !== "all" || selectedFeature !== "all" || selectedPrice !== "all" || searchParam

  return (
    <main className="stitch-main stitch-page-enter">
      {/* 1. Header Section */}
      <section className="stitch-hero">
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <Link to="/shop" className="stitch-breadcrumb-link">Shop</Link>
          {searchParam && (
            <>
              <span className="stitch-breadcrumb-sep">/</span>
              <span className="stitch-breadcrumb-current">Search: "{searchParam}"</span>
            </>
          )}
          {!searchParam && categoryParam !== "all" && (
            <>
              <span className="stitch-breadcrumb-sep">/</span>
              <span className="stitch-breadcrumb-current">{categoryLabel}</span>
            </>
          )}
        </nav>

        <div className="stitch-catalog-eyebrow">
          {searchParam ? "SEARCH RESULTS" : categoryParam !== "all" ? "CURATED COLLECTION" : "SHOPSPHERE COLLECTION"}
        </div>

        <h1 className="stitch-hero-title">
          {searchParam
            ? `Results for "${searchParam}"`
            : categoryParam !== "all"
            ? categoryLabel
            : "Get Inspired"}
        </h1>

        <p className="stitch-hero-desc">
          {searchParam
            ? `${filteredProducts.length} ${filteredProducts.length === 1 ? "product found" : "products found"} matching your search query in our catalog.`
            : "Browse our complete selection of luxury tech, audio, home essentials, and modern travel gear delivered pan-India."}
        </p>
      </section>

      {/* 2. Filter & Search Bar */}
      <section className="stitch-filter-bar-container" ref={filterBarRef}>
        <div className="stitch-filter-bar">
          {/* Left Filter Group */}
          <div className="stitch-filter-group-left">
            {/* CATEGORY PILL */}
            <div className="stitch-filter-dropdown-wrapper">
              <button
                type="button"
                onClick={() => toggleDropdown("category")}
                className={`stitch-filter-pill ${categoryParam !== "all" ? "active-filter" : ""} ${openDropdown === "category" ? "open" : ""}`}
              >
                <span>Category: {categoryLabel}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                  {openDropdown === "category" ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openDropdown === "category" && (
                <div className="stitch-filter-menu">
                  {mockCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCategory(c.id)}
                      className={`stitch-filter-menu-item ${categoryParam.toLowerCase() === c.id.toLowerCase() ? "selected" : ""}`}
                    >
                      <span>{c.name}</span>
                      {categoryParam.toLowerCase() === c.id.toLowerCase() && (
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLOR PILL */}
            <div className="stitch-filter-dropdown-wrapper">
              <button
                type="button"
                onClick={() => toggleDropdown("color")}
                className={`stitch-filter-pill ${selectedColor !== "all" ? "active-filter" : ""} ${openDropdown === "color" ? "open" : ""}`}
              >
                <span>Color: {colorLabel}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                  {openDropdown === "color" ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openDropdown === "color" && (
                <div className="stitch-filter-menu">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(col.id)
                        setOpenDropdown(null)
                      }}
                      className={`stitch-filter-menu-item ${selectedColor === col.id ? "selected" : ""}`}
                    >
                      <span>{col.label}</span>
                      {selectedColor === col.id && (
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* FEATURE PILL */}
            <div className="stitch-filter-dropdown-wrapper">
              <button
                type="button"
                onClick={() => toggleDropdown("feature")}
                className={`stitch-filter-pill ${selectedFeature !== "all" ? "active-filter" : ""} ${openDropdown === "feature" ? "open" : ""}`}
              >
                <span>Feature: {featureLabel}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                  {openDropdown === "feature" ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openDropdown === "feature" && (
                <div className="stitch-filter-menu">
                  {FEATURE_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setSelectedFeature(f.id)
                        setOpenDropdown(null)
                      }}
                      className={`stitch-filter-menu-item ${selectedFeature === f.id ? "selected" : ""}`}
                    >
                      <span>{f.label}</span>
                      {selectedFeature === f.id && (
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRICE PILL */}
            <div className="stitch-filter-dropdown-wrapper">
              <button
                type="button"
                onClick={() => toggleDropdown("price")}
                className={`stitch-filter-pill ${selectedPrice !== "all" ? "active-filter" : ""} ${openDropdown === "price" ? "open" : ""}`}
              >
                <span>Price: {priceLabel}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                  {openDropdown === "price" ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openDropdown === "price" && (
                <div className="stitch-filter-menu">
                  {PRICE_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPrice(p.id)
                        setOpenDropdown(null)
                      }}
                      className={`stitch-filter-menu-item ${selectedPrice === p.id ? "selected" : ""}`}
                    >
                      <span>{p.label}</span>
                      {selectedPrice === p.id && (
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RESET BUTTON */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="stitch-filter-reset-btn"
                title="Reset all filters"
              >
                <span>Reset</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
              </button>
            )}
          </div>

          {/* Right Filter Group */}
          <div className="stitch-filter-group-right">
            {/* Dynamic Product Count */}
            <div className="stitch-product-count-badge">
              {filteredProducts.length} {filteredProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}
            </div>

            {/* SORT PILL */}
            <div className="stitch-sort-dropdown-wrapper">
              <button
                type="button"
                onClick={() => toggleDropdown("sort")}
                className={`stitch-sort-pill ${openDropdown === "sort" ? "open" : ""}`}
              >
                <span>Sort By: {sortLabel}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                  {openDropdown === "sort" ? "expand_less" : "sort"}
                </span>
              </button>
              {openDropdown === "sort" && (
                <div className="stitch-filter-menu right-aligned">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSort(s.id)
                        setOpenDropdown(null)
                      }}
                      className={`stitch-filter-menu-item ${selectedSort === s.id ? "selected" : ""}`}
                    >
                      <span>{s.label}</span>
                      {selectedSort === s.id && (
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Subtle Divider */}
        <div className="stitch-filter-divider" />
      </section>

      {/* Mobile Filter Bar Trigger */}
      <div className="stitch-mobile-filter-trigger">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="stitch-filter-pill"
          style={{ flexGrow: 1, justifyContent: "center" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            tune
          </span>
          <span>Filters {hasActiveFilters ? "• Active" : ""}</span>
        </button>

        <div className="stitch-product-count-badge" style={{ margin: 0 }}>
          {filteredProducts.length} items
        </div>

        <div className="stitch-sort-pill" style={{ flexGrow: 1, justifyContent: "center" }}>
          <span>Sort</span>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            sort
          </span>
          <select
            className="stitch-filter-pill-select"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid / Skeletons / Empty State */}
      {loading ? (
        <ProductSkeletonGrid count={8} />
      ) : filteredProducts.length === 0 ? (
        <div className="stitch-empty-cart">
          <span className="material-symbols-outlined stitch-empty-icon" style={{ fontSize: "48px", color: "#8c8e8e" }}>
            search_off
          </span>
          <h2 className="stitch-empty-title">
            {searchParam ? `No results found for "${searchParam}"` : "No products match your criteria"}
          </h2>
          <p className="stitch-empty-desc">
            We couldn't find any products matching your current query. Try searching for popular essentials or exploring our curated categories:
          </p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
            {[
              { label: "Bags & Carry", link: "/shop?category=accessories" },
              { label: "Cabin Luggage", link: "/shop?category=travel" },
              { label: "Headphones & Audio", link: "/shop?category=electronics" },
              { label: "Studio Living", link: "/shop?category=home" }
            ].map((chip, idx) => (
              <Link
                key={idx}
                to={chip.link}
                className="stitch-filter-pill"
                style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.14)", textDecoration: "none" }}
              >
                {chip.label}
              </Link>
            ))}
          </div>

          <button
            onClick={handleResetFilters}
            className="stitch-checkout-btn"
            style={{ maxWidth: "220px" }}
          >
            Clear Search &amp; Filters
          </button>
        </div>
      ) : (
        <section className="stitch-grid">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product._id || product.id} product={product} index={idx} />
          ))}
        </section>
      )}
    </main>
  )
}

export default Shop

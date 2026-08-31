import React, { useState, useEffect, useRef, useMemo } from "react"
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectAllProducts } from "../../redux/slices/productSlice"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { useWishlist } from "../../context/WishlistContext"
import "../../styles/navbar.css"

const CATEGORIES_METADATA = [
  { id: "accessories", name: "Bags & Technical Carry", keywords: ["bag", "backpack", "duffle", "carry", "tote", "briefcase", "cordura", "leather", "canvas", "sling"] },
  { id: "travel", name: "Precision Cabin Luggage", keywords: ["travel", "luggage", "suitcase", "cabin", "spinner", "polycarbonate", "wheels", "tsa"] },
  { id: "electronics", name: "Acoustic Audio & Tech", keywords: ["audio", "tech", "electronics", "headphone", "speaker", "noise", "cancelling", "anc", "bluetooth", "wireless"] },
  { id: "home", name: "Living & Studio Objects", keywords: ["home", "studio", "living", "desk", "organizer", "tray", "ceramic", "lamp", "lifestyle"] }
]

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const products = useSelector(selectAllProducts)
  const { cartItemsCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const { wishlistCount } = useWishlist()

  // Expandable Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)
  const mobileSearchInputRef = useRef(null)

  // Sidebar Drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Active Dropdown state: null | 'shop' | 'collections' | 'explore'
  const [activeDropdown, setActiveDropdown] = useState(null)

  // Sticky header scrolled state
  const [isScrolled, setIsScrolled] = useState(false)

  // Cart count bump micro-interaction
  const [badgeBump, setBadgeBump] = useState(false)

  const navRef = useRef(null)

  // Trigger subtle bump animation on cart update
  useEffect(() => {
    if (cartItemsCount > 0) {
      setBadgeBump(true)
      const t = setTimeout(() => setBadgeBump(false), 350)
      return () => clearTimeout(t)
    }
  }, [cartItemsCount])

  // Scroll listener for subtle header elevation
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY || window.pageYOffset || 0
          setIsScrolled((prev) => (scrollPos > 30 ? true : scrollPos < 10 ? false : prev))
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Synchronize search input if URL has ?search=
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("search") || params.get("q")
    if (q !== null && location.pathname === "/shop") {
      setSearchQuery(q)
      setIsSearchOpen(true)
    }
  }, [location.pathname, location.search])

  // Close search and dropdowns on route change
  useEffect(() => {
    setIsSidebarOpen(false)
    setActiveDropdown(null)
    setIsMobileSearchOpen(false)
  }, [location.pathname, location.search])

  // Click outside to close search and dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        if (!searchQuery.trim()) {
          setIsSearchOpen(false)
        }
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false)
        setIsMobileSearchOpen(false)
        setActiveDropdown(null)
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [searchQuery])

  // Prevent background page scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isSidebarOpen])

  // Calculate matching products and categories
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return { matchingProducts: [], matchingCategories: [], totalCount: 0 }

    const matchedCats = CATEGORIES_METADATA.filter(cat =>
      cat.name.toLowerCase().includes(q) ||
      cat.id.toLowerCase().includes(q) ||
      cat.keywords.some(k => k.includes(q) || q.includes(k))
    )

    const matchedProds = (products || []).filter(p => {
      const name = (p.name || "").toLowerCase()
      const brand = (p.brand || "").toLowerCase()
      const category = (p.category || "").toLowerCase()
      const subtitle = (p.subtitle || "").toLowerCase()
      const desc = (p.description || "").toLowerCase()
      const feats = (p.features || []).join(" ").toLowerCase()
      return name.includes(q) || brand.includes(q) || category.includes(q) || subtitle.includes(q) || desc.includes(q) || feats.includes(q)
    })

    return {
      matchingProducts: matchedProds.slice(0, 4),
      matchingCategories: matchedCats,
      totalCount: matchedProds.length
    }
  }, [searchQuery, products])

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    setIsMobileSearchOpen(false)
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setIsSearchOpen(false)
    setIsMobileSearchOpen(false)
    if (location.pathname === "/shop" && (location.search.includes("search=") || location.search.includes("q="))) {
      navigate("/shop")
    }
  }

  const toggleDropdown = (menuName) => {
    setActiveDropdown((prev) => (prev === menuName ? null : menuName))
  }

  const handleLogout = async () => {
    await logout()
    setIsSidebarOpen(false)
    navigate("/login")
  }

  // Render suggestions dropdown
  const renderSuggestionsDropdown = () => (
    <div className="stitch-search-suggestions-dropdown">
      {/* Category Suggestions */}
      {searchResults.matchingCategories.length > 0 && (
        <div className="stitch-suggestions-categories">
          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e", alignSelf: "center", marginRight: "2px" }}>
            Categories:
          </span>
          {searchResults.matchingCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              onClick={() => {
                setIsSearchOpen(false)
                setIsMobileSearchOpen(false)
              }}
              className="stitch-suggestion-category-pill"
            >
              <span>{cat.name}</span>
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                arrow_forward
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Product Suggestions */}
      {searchResults.matchingProducts.length > 0 ? (
        <>
          <div className="stitch-suggestions-header">
            Matching Products ({searchResults.totalCount})
          </div>
          {searchResults.matchingProducts.map((item) => (
            <Link
              key={item._id || item.id}
              to={`/product/${item._id || item.id}`}
              onClick={() => {
                setIsSearchOpen(false)
                setIsMobileSearchOpen(false)
              }}
              className="stitch-suggestion-item"
            >
              <img
                src={item.imageURL || item.image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=120&q=80"}
                alt={item.name}
                className="stitch-suggestion-thumb"
              />
              <div className="stitch-suggestion-info">
                <div className="stitch-suggestion-name">{item.name}</div>
                <div className="stitch-suggestion-meta">
                  {item.brand ? `${item.brand} • ` : ""}{item.category || "Essentials"}
                </div>
              </div>
              <div className="stitch-suggestion-price">
                ₹{Number(item.price || 0).toLocaleString("en-IN")}
              </div>
            </Link>
          ))}

          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="stitch-suggestions-footer-btn"
          >
            <span>View all {searchResults.totalCount} results for "{searchQuery}"</span>
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
              arrow_forward
            </span>
          </button>
        </>
      ) : (
        <div style={{ padding: "1.25rem 1rem", textAlign: "center", color: "#5d5f5f" }}>
          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "#000" }}>
            No exact products matching "{searchQuery}"
          </p>
          <p style={{ margin: 0, fontSize: "12px" }}>
            Try searching for "headphones", "duffle", or "cabin luggage".
          </p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* ==================== MAIN HEADER ==================== */}
      <header className={`stitch-header-wrapper ${isScrolled ? "scrolled" : ""}`}>
        <div className="stitch-header">
          {/* ==================== 1. LEFT: BRAND & HAMBURGER ==================== */}
          <div className="stitch-brand-area">
            <button
              type="button"
              className="stitch-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open Navigation Sidebar"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                menu
              </span>
            </button>

            <Link to="/" className="stitch-brand-title">
              SHOPSPHERE
            </Link>
          </div>

          {/* ==================== 2. CENTER: NAVIGATION LINKS ==================== */}
          <nav className="stitch-nav" ref={navRef}>
            {/* Shop Item & Dropdown */}
            <div className="stitch-nav-item">
              <button
                type="button"
                onClick={() => toggleDropdown("shop")}
                className={`stitch-nav-link ${activeDropdown === "shop" ? "active" : ""}`}
              >
                <span>Shop</span>
                <span className="material-symbols-outlined stitch-nav-arrow" style={{ fontSize: "16px" }}>
                  {activeDropdown === "shop" ? "expand_less" : "expand_more"}
                </span>
              </button>
              {activeDropdown === "shop" && (
                <div className="stitch-dropdown-menu">
                  <Link to="/shop" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>grid_view</span>
                    <div>
                      <div className="stitch-dropdown-title">All Products</div>
                      <div className="stitch-dropdown-desc">Explore our full seasonal range</div>
                    </div>
                  </Link>
                  <Link to="/shop?sort=price-high" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>star</span>
                    <div>
                      <div className="stitch-dropdown-title">Best Sellers</div>
                      <div className="stitch-dropdown-desc">Most coveted daily essentials</div>
                    </div>
                  </Link>
                  <Link to="/shop?sort=new" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>fiber_new</span>
                    <div>
                      <div className="stitch-dropdown-title">New Drops</div>
                      <div className="stitch-dropdown-desc">Fresh technical arrivals</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Collections Item & Dropdown */}
            <div className="stitch-nav-item">
              <button
                type="button"
                onClick={() => toggleDropdown("collections")}
                className={`stitch-nav-link ${activeDropdown === "collections" ? "active" : ""}`}
              >
                <span>Collections</span>
                <span className="material-symbols-outlined stitch-nav-arrow" style={{ fontSize: "16px" }}>
                  {activeDropdown === "collections" ? "expand_less" : "expand_more"}
                </span>
              </button>
              {activeDropdown === "collections" && (
                <div className="stitch-dropdown-menu">
                  <Link to="/shop?category=accessories" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>backpack</span>
                    <div>
                      <div className="stitch-dropdown-title">Bags &amp; Carry</div>
                      <div className="stitch-dropdown-desc">Duffels, backpacks &amp; folios</div>
                    </div>
                  </Link>
                  <Link to="/shop?category=travel" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>luggage</span>
                    <div>
                      <div className="stitch-dropdown-title">Cabin Luggage</div>
                      <div className="stitch-dropdown-desc">Polycarbonate hard-shell trolleys</div>
                    </div>
                  </Link>
                  <Link to="/shop?category=electronics" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>headphones</span>
                    <div>
                      <div className="stitch-dropdown-title">Audio &amp; Tech</div>
                      <div className="stitch-dropdown-desc">Precision ANC acoustics</div>
                    </div>
                  </Link>
                  <Link to="/shop?category=home" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>home</span>
                    <div>
                      <div className="stitch-dropdown-title">Living &amp; Studio</div>
                      <div className="stitch-dropdown-desc">Porcelain aroma diffusers</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Explore Item & Dropdown */}
            <div className="stitch-nav-item">
              <button
                type="button"
                onClick={() => toggleDropdown("explore")}
                className={`stitch-nav-link ${activeDropdown === "explore" ? "active" : ""}`}
              >
                <span>Explore</span>
                <span className="material-symbols-outlined stitch-nav-arrow" style={{ fontSize: "16px" }}>
                  {activeDropdown === "explore" ? "expand_less" : "expand_more"}
                </span>
              </button>
              {activeDropdown === "explore" && (
                <div className="stitch-dropdown-menu">
                  <Link to="/explore" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
                    <div>
                      <div className="stitch-dropdown-title">Curated Lookbook</div>
                      <div className="stitch-dropdown-desc">Editorial travel styling</div>
                    </div>
                  </Link>
                  <Link to="/explore" className="stitch-dropdown-link" onClick={() => setActiveDropdown(null)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>eco</span>
                    <div>
                      <div className="stitch-dropdown-title">Material &amp; Craft</div>
                      <div className="stitch-dropdown-desc">Recycled technical nylon &amp; leather</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {user?.role === "admin" && (
              <NavLink to="/admin" className="stitch-nav-link" style={{ color: "#e11d48", fontWeight: 700 }}>
                Admin Panel
              </NavLink>
            )}
          </nav>

          {/* ==================== 3. RIGHT: ACTIONS (SEARCH + ACCOUNT + BAG) ==================== */}
          <div className="stitch-actions-group">
            {/* Desktop Expandable Search */}
            <div className="stitch-expandable-search" ref={searchContainerRef}>
              {!isSearchOpen ? (
                <button
                  type="button"
                  className="stitch-search-trigger-btn"
                  onClick={() => {
                    setIsSearchOpen(true)
                    setTimeout(() => searchInputRef.current?.focus(), 60)
                  }}
                  aria-label="Search catalog"
                  title="Search products"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                    search
                  </span>
                </button>
              ) : (
                <form onSubmit={handleSearchSubmit} className="stitch-expandable-search-form">
                  <span className="material-symbols-outlined stitch-search-field-icon" style={{ fontSize: "18px" }}>
                    search
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="stitch-expandable-search-input"
                    aria-label="Search products"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="stitch-search-field-btn"
                      title="Clear search"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>close</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="stitch-search-field-btn"
                      title="Close search"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>close</span>
                    </button>
                  )}
                </form>
              )}

              {isSearchOpen && searchQuery.trim().length > 0 && renderSuggestionsDropdown()}
            </div>

            {/* Account / Sign In */}
            {isAuthenticated && user ? (
              <Link
                to="/profile"
                className="stitch-action-link"
                title={`Logged in as ${user.name}`}
                style={{ color: "#000000", fontWeight: 700 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  account_circle
                </span>
                <span className="stitch-action-text">{`Hi, ${user?.name ? user.name.split(" ")[0] : "User"}`}</span>
              </Link>
            ) : (
              <Link to="/login" className="stitch-action-link" title="Sign In / Account">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  person
                </span>
                <span className="stitch-action-text">Sign In</span>
              </Link>
            )}

            {/* Shopping Bag */}
            <Link to="/cart" className="stitch-cart-btn" title="View Shopping Bag">
              <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                shopping_bag
              </span>
              <span className={badgeBump ? "stitch-cart-count-bump" : ""}>
                Bag ({cartItemsCount})
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Overlay Bar (Active only when user taps search on mobile) */}
        {isMobileSearchOpen && (
          <div className="stitch-mobile-search-overlay">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="stitch-menu-btn"
              aria-label="Back"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                arrow_back
              </span>
            </button>
            <form onSubmit={handleSearchSubmit} className="stitch-expandable-search-form" style={{ width: "100%" }}>
              <span className="material-symbols-outlined stitch-search-field-icon" style={{ fontSize: "18px" }}>
                search
              </span>
              <input
                ref={mobileSearchInputRef}
                type="text"
                autoFocus
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="stitch-expandable-search-input"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="stitch-search-field-btn"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>close</span>
                </button>
              )}
            </form>
            {searchQuery.trim().length > 0 && renderSuggestionsDropdown()}
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <nav className="stitch-bottom-nav">
          <NavLink to="/" end className="stitch-bottom-item">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              storefront
            </span>
            <span>Shop</span>
          </NavLink>
          <NavLink to="/shop" className="stitch-bottom-item">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              explore
            </span>
            <span>Explore</span>
          </NavLink>
          <NavLink to="/cart" className="stitch-bottom-item">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              shopping_bag
            </span>
            <span className={badgeBump ? "stitch-cart-count-bump" : ""}>
              Bag ({cartItemsCount})
            </span>
          </NavLink>
          <NavLink to={isAuthenticated ? "/profile" : "/login"} className="stitch-bottom-item">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              {isAuthenticated ? "account_circle" : "person"}
            </span>
            <span>{isAuthenticated ? user?.name?.split(" ")[0] || "Account" : "Sign In"}</span>
          </NavLink>
        </nav>
      </header>

      {/* ==================== SIDEBAR / SIDE DRAWER ==================== */}
      {isSidebarOpen && (
        <div
          className="stitch-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`stitch-sidebar-drawer ${isSidebarOpen ? "open" : ""}`}>
        {/* Drawer Header */}
        <div className="stitch-sidebar-header">
          <div className="stitch-sidebar-brand">
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#000" }}>
              diamond
            </span>
            <span style={{ fontWeight: 800, letterSpacing: "0.08em", fontSize: "15px" }}>
              SHOPSPHERE
            </span>
          </div>
          <button
            type="button"
            className="stitch-menu-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              close
            </span>
          </button>
        </div>

        {/* User Greeting Card in Drawer (Clickable to My Account) */}
        <Link
          to={isAuthenticated ? "/profile" : "/login"}
          onClick={() => setIsSidebarOpen(false)}
          className="stitch-sidebar-user-card"
          title="Go to My Account"
          style={{ textDecoration: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="stitch-sidebar-avatar">
              <span className="material-symbols-outlined" style={{ fontSize: "26px" }}>
                {isAuthenticated ? "account_circle" : "person_outline"}
              </span>
            </div>
            <div>
              <div className="stitch-sidebar-greeting">
                {isAuthenticated ? `Hello, ${user?.name || "Customer"}` : "Welcome to ShopSphere"}
              </div>
              <div className="stitch-sidebar-subgreeting">
                {isAuthenticated ? (user?.role === "admin" ? "Store Administrator" : "ShopSphere Member") : "Sign in for private drops & order tracking"}
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#8c8e8e" }}>
            chevron_right
          </span>
        </Link>

        {/* Drawer Scrollable Content */}
        <div className="stitch-sidebar-body">
          {/* SECTION 1: NAVIGATION */}
          <div className="stitch-sidebar-section">
            <div className="stitch-sidebar-section-title">NAVIGATION</div>
            <Link
              to="/shop"
              className={`stitch-sidebar-link ${location.pathname === "/shop" && !location.search ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">storefront</span>
              <span>Shop All</span>
            </Link>
            <Link
              to="/collections"
              className={`stitch-sidebar-link ${location.pathname === "/collections" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">category</span>
              <span>Collections</span>
            </Link>
            <Link
              to="/explore"
              className={`stitch-sidebar-link ${location.pathname === "/explore" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">explore</span>
              <span>Explore Catalog</span>
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={`stitch-sidebar-link ${location.pathname === "/admin" ? "active" : ""}`}
                style={{ color: "#e11d48", fontWeight: 700 }}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          {/* SECTION 2: MY ACCOUNT */}
          <div className="stitch-sidebar-section">
            <div className="stitch-sidebar-section-title">MY ACCOUNT</div>
            <Link
              to={isAuthenticated ? "/profile" : "/login?redirect=/profile"}
              className={`stitch-sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">person</span>
              <span>My Account</span>
            </Link>
            <Link
              to={isAuthenticated ? "/orders" : "/login?redirect=/orders"}
              className={`stitch-sidebar-link ${location.pathname === "/orders" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">package_2</span>
              <span>My Orders</span>
            </Link>
            <Link
              to="/wishlist"
              className={`stitch-sidebar-link ${location.pathname === "/wishlist" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">favorite_border</span>
              <span>Wishlist / Saved Items ({wishlistCount})</span>
            </Link>
            <Link
              to={isAuthenticated ? "/addresses" : "/login?redirect=/addresses"}
              className={`stitch-sidebar-link ${location.pathname === "/addresses" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">location_on</span>
              <span>Saved Addresses</span>
            </Link>
            <Link
              to={isAuthenticated ? "/payment-methods" : "/login?redirect=/payment-methods"}
              className={`stitch-sidebar-link ${location.pathname === "/payment-methods" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">payment</span>
              <span>Payment Methods</span>
            </Link>
            <Link
              to="/recently-viewed"
              className={`stitch-sidebar-link ${location.pathname === "/recently-viewed" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">history</span>
              <span>Recently Viewed</span>
            </Link>
          </div>

          {/* SECTION 3: SUPPORT */}
          <div className="stitch-sidebar-section">
            <div className="stitch-sidebar-section-title">SUPPORT</div>
            <Link
              to="/help"
              className={`stitch-sidebar-link ${location.pathname === "/help" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">help_outline</span>
              <span>Help &amp; Support</span>
            </Link>
            <Link
              to="/contact"
              className={`stitch-sidebar-link ${location.pathname === "/contact" ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">mail</span>
              <span>Contact Us</span>
            </Link>
          </div>

          {/* SECTION 4: ACCOUNT / AUTHENTICATION */}
          <div className="stitch-sidebar-section" style={{ borderBottom: "none" }}>
            <div className="stitch-sidebar-section-title">ACCOUNT</div>
            {isAuthenticated ? (
              <>
                <Link
                  to="/settings"
                  className={`stitch-sidebar-link ${location.pathname === "/settings" ? "active" : ""}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span>Account Settings</span>
                </Link>
                <button onClick={handleLogout} className="stitch-sidebar-logout-btn">
                  <span className="material-symbols-outlined">logout</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                <Link to="/login" className="stitch-sidebar-auth-btn primary" onClick={() => setIsSidebarOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="stitch-sidebar-auth-btn secondary" onClick={() => setIsSidebarOpen(false)}>
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Navbar

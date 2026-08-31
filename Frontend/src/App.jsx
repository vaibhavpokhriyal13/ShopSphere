import React from "react"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./redux/store"

import { CartProvider } from "./context/CartContext"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import { WishlistProvider } from "./context/WishlistContext"

import Navbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import AIConcierge from "./components/ai/AIConcierge"

// Page Imports
import Home from "./pages/home/Home"
import Shop from "./pages/shop/Shop"
import Collections from "./pages/shop/Collections"
import Explore from "./pages/shop/Explore"
import RecentlyViewed from "./pages/shop/RecentlyViewed"
import ProductDetail from "./pages/shop/ProductDetail"
import Cart from "./pages/cart/Cart"
import Checkout from "./pages/checkout/Checkout"
import Profile from "./pages/user/Profile"
import Orders from "./pages/user/Orders"
import Wishlist from "./pages/user/Wishlist"
import Addresses from "./pages/user/Addresses"
import PaymentMethods from "./pages/user/PaymentMethods"
import Settings from "./pages/user/Settings"
import HelpSupport from "./pages/misc/HelpSupport"
import Contact from "./pages/misc/Contact"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import AdminDashboard from "./pages/admin/AdminDashboard"
import NotFound from "./pages/misc/NotFound"

import "./styles/global.css"

const AppContent = () => {
  const location = useLocation()
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register"

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!isAuthPage && <Navbar />}
      <div key={location.pathname} className="stitch-page-enter" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
          {/* Navigation */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/recently-viewed" element={<RecentlyViewed />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* User Account */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/settings" element={<Settings />} />

          {/* Support */}
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth & Admin */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAuthPage && <AIConcierge />}
      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Router>
                <AppContent />
              </Router>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </Provider>
  )
}

export default App

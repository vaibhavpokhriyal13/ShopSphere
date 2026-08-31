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

import ProtectedRoute from "./components/common/ProtectedRoute"

import "./styles/global.css"

const AppContent = () => {
  const location = useLocation()
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register"

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!isAuthPage && <Navbar />}
      <div key={location.pathname} className="stitch-page-enter" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Navigation */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/recently-viewed" element={<ProtectedRoute><RecentlyViewed /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

          {/* User Account */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Support */}
          <Route path="/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

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

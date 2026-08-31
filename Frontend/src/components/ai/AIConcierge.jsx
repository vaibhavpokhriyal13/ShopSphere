import React, { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { aiAPI } from "../../services/api"
import "../../styles/ai.css"

const STARTER_PROMPTS = [
  { label: "Find travel backpacks", prompt: "Recommend durable travel backpacks and cabin bags under ₹6,000." },
  { label: "Where is my order?", prompt: "Can you track my latest order and show its delivery status?" },
  { label: "7-Day Return Policy", prompt: "What is your 7-day return and exchange policy?" },
  { label: "Best ANC Headphones", prompt: "What are your top acoustic noise-cancelling headphones?" }
]

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to **ShopSphere Concierge**. I am your personal shopping assistant. I can recommend curated products, track your shipments, explain warranty & return policies, or assist with your bag.",
      suggestedProducts: []
    }
  ])

  const { addToCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, loading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // Handle send message
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setInputMessage("")
    setLoading(true)

    try {
      // Send message history to backend
      const formattedForApi = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const data = await aiAPI.chat(formattedForApi)

      // If AI triggered an autonomous add to cart
      if (data.cartAction) {
        addToCart(data.cartAction, data.cartAction.quantity || 1)
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          suggestedProducts: data.suggestedProducts || [],
          cartAction: data.cartAction || null
        }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered a momentary connection issue. Please feel free to ask again or browse our full collection in the shop!",
          suggestedProducts: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          type="button"
          className="stitch-ai-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Ask ShopSphere AI"
          title="Ask AI"
        >
          <span className="material-symbols-outlined stitch-ai-sparkle-icon">
            auto_awesome
          </span>
          <span>Ask AI</span>
        </button>
      )}

      {/* Slide-up AI Modal / Drawer */}
      {isOpen && (
        <div className="stitch-ai-drawer-container">
          {/* Header */}
          <div className="stitch-ai-header">
            <div className="stitch-ai-header-brand">
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#fbbf24" }}>
                auto_awesome
              </span>
              <span className="stitch-ai-header-title">ShopSphere Concierge</span>
              <span className="stitch-ai-header-badge">Online Concierge</span>
            </div>
            <button
              type="button"
              className="stitch-ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Concierge"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                close
              </span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="stitch-ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`stitch-ai-msg-row ${msg.role === "user" ? "user" : "bot"}`}>
                <div className="stitch-ai-avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    {msg.role === "user" ? "person" : "auto_awesome"}
                  </span>
                </div>
                <div className="stitch-ai-bubble">
                  <div>{msg.content}</div>

                  {/* Embedded Suggested Products Card */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="stitch-ai-product-grid">
                      {msg.suggestedProducts.map((p) => (
                        <div key={p._id || p.id} className="stitch-ai-product-card">
                          <Link
                            to={`/product/${p._id || p.id}`}
                            onClick={() => setIsOpen(false)}
                            style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0, textDecoration: "none" }}
                          >
                            <img
                              src={p.imageURL || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=120&q=80"}
                              alt={p.name}
                              className="stitch-ai-product-img"
                            />
                            <div className="stitch-ai-product-info">
                              <div className="stitch-ai-product-name">{p.name}</div>
                              <div className="stitch-ai-product-price">
                                ₹{Number(p.price || 0).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </Link>
                          <button
                            type="button"
                            onClick={() => addToCart(p, 1)}
                            className="stitch-ai-product-btn"
                            title="Add to Shopping Bag"
                          >
                            + Bag
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cart Action Success Tag */}
                  {msg.cartAction && (
                    <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check_circle</span>
                      <span>Added "{msg.cartAction.name}" to Bag</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Starter Chips on fresh conversation */}
            {messages.length === 1 && !loading && (
              <div className="stitch-ai-chips-container">
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#8c8e8e" }}>
                  Suggested Inquiries:
                </span>
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="stitch-ai-chip"
                    onClick={() => handleSendMessage(item.prompt)}
                  >
                    <span>{item.label}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="stitch-ai-msg-row bot">
                <div className="stitch-ai-avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    auto_awesome
                  </span>
                </div>
                <div className="stitch-ai-typing">
                  <div className="stitch-ai-dot" />
                  <div className="stitch-ai-dot" />
                  <div className="stitch-ai-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="stitch-ai-input-form"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything or request an item..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="stitch-ai-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="stitch-ai-send-btn"
              title="Send message"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                arrow_upward
              </span>
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default AIConcierge

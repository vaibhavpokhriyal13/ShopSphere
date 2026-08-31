import React, { useState } from "react"
import { Link } from "react-router-dom"
import "../../styles/pages.css"

const FAQ_DATA = [
  {
    category: "Orders & Tracking",
    questions: [
      {
        q: "How can I track my active order?",
        a: "Once your order is processed, you will receive a confirmation email with a Bluedart tracking airway bill. You can also view live tracking updates anytime by navigating to 'My Orders' in your ShopSphere account."
      },
      {
        q: "Can I cancel an order after placing it?",
        a: "Yes. You can cancel your order directly from the 'My Orders' dashboard as long as the status is marked as 'Pending' or 'Processing'. Once the order is dispatched for transit, cancellation is no longer possible, but you may refuse delivery or request a return."
      },
      {
        q: "How do I download my GST tax invoice?",
        a: "Your GST invoice is automatically generated and emailed to your registered address upon order confirmation. You can also view invoice breakdowns in the 'Order Details' modal."
      }
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "What are your delivery timelines across India?",
        a: "Metro cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata): 2–4 business days. Other state capitals and Tier-2 regions: 3–6 business days. Express air shipping is automatically utilized for all premium carry items."
      },
      {
        q: "Do you offer Cash on Delivery (COD)?",
        a: "Yes, Cash on Delivery is available across 24,000+ PIN codes in India for orders up to ₹25,000. You can also pay via UPI QR code directly to the delivery agent upon handover."
      },
      {
        q: "Are shipping charges applicable?",
        a: "ShopSphere offers complimentary standard express shipping on all orders above ₹999 across India. A nominal fee of ₹99 applies to orders below ₹999."
      }
    ]
  },
  {
    category: "Returns, Replacements & Refunds",
    questions: [
      {
        q: "What is the ShopSphere return policy?",
        a: "We offer a hassle-free 7-day return window on all unused items in their original packaging with tags intact. If you receive a damaged or defective item, report it within 48 hours for an immediate complimentary replacement."
      },
      {
        q: "How are refunds processed?",
        a: "For prepaid orders (UPI / Card / NetBanking), refunds are credited back to the original payment source within 3–5 business days after quality check. For COD orders, we transfer refunds instantly via UPI or NEFT."
      }
    ]
  },
  {
    category: "Warranty & Craftsmanship",
    questions: [
      {
        q: "What warranty comes with ShopSphere luggage and carry bags?",
        a: "All hard-shell polycarbonate luggage comes with a 3-Year Limited Warranty covering shell cracks, telescopic handles, and wheel assemblies. Canvas duffels and daypacks include a 1-Year Craftsmanship Guarantee."
      },
      {
        q: "Are your acoustic audio products covered under warranty?",
        a: "Yes, our headphones and speakers include a 1-Year Manufacturer Replacement Warranty against electronic defects and driver failures."
      }
    ]
  }
]

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedIndex, setExpandedIndex] = useState("0-0") // default open first item

  const toggleAccordion = (id) => {
    setExpandedIndex(prev => (prev === id ? null : id))
  }

  // Filter FAQs by search query
  const filteredFAQs = FAQ_DATA.map(group => ({
    ...group,
    questions: group.questions.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.questions.length > 0)

  return (
    <main className="stitch-main stitch-page-enter">
      {/* Header */}
      <section className="stitch-hero">
        <nav className="stitch-catalog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="stitch-breadcrumb-link">Home</Link>
          <span className="stitch-breadcrumb-sep">/</span>
          <span className="stitch-breadcrumb-current">Help &amp; Support</span>
        </nav>

        <div className="stitch-catalog-eyebrow">
          CUSTOMER CARE
        </div>

        <h1 className="stitch-hero-title">
          Help &amp; Support
        </h1>

        <p className="stitch-hero-desc">
          Browse comprehensive answers regarding delivery schedules, warranty claims, returns, and payment security.
        </p>
      </section>

      {/* Search Bar */}
      <div style={{ position: "relative", maxWidth: "600px", marginBottom: "2.5rem" }}>
        <span className="material-symbols-outlined" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8c8e8e", fontSize: "20px" }}>
          search
        </span>
        <input
          type="text"
          placeholder="Search questions (e.g. tracking, return policy, warranty, COD)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "0.85rem 2.8rem 0.85rem 2.8rem",
            borderRadius: "9999px",
            border: "1px solid rgba(0,0,0,0.14)",
            fontSize: "14px",
            outline: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8c8e8e" }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", marginBottom: "4rem" }}>
        {/* Accordions */}
        <div style={{ gridColumn: "1 / -1" }}>
          {filteredFAQs.length === 0 ? (
            <div style={{ padding: "2rem 0", color: "#5d5f5f" }}>
              <p>No matching questions found for "{searchQuery}". Try contacting our support team directly below.</p>
            </div>
          ) : (
            filteredFAQs.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#000", marginBottom: "1rem" }}>
                  {group.category}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {group.questions.map((item, qIdx) => {
                    const uniqueId = `${gIdx}-${qIdx}`
                    const isOpen = expandedIndex === uniqueId

                    return (
                      <div
                        key={qIdx}
                        style={{
                          background: "#ffffff",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          transition: "border-color 0.2s"
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleAccordion(uniqueId)}
                          style={{
                            width: "100%",
                            padding: "1rem 1.25rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: isOpen ? "#fafafa" : "#fff",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: "inherit"
                          }}
                        >
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>
                            {item.q}
                          </span>
                          <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#8c8e8e", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                            expand_more
                          </span>
                        </button>

                        {isOpen && (
                          <div style={{ padding: "1rem 1.25rem", fontSize: "14px", color: "#5d5f5f", lineHeight: 1.6, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Banner Cards */}
        <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#000" }}>
            mail
          </span>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px", color: "#000" }}>
              Email Customer Care
            </h3>
            <p style={{ fontSize: "13px", color: "#5d5f5f", margin: "0 0 8px" }}>
              support@shopsphere.in (Response within 24h)
            </p>
            <Link to="/contact" style={{ fontSize: "12px", fontWeight: 700, color: "#000", textDecoration: "underline" }}>
              Open Contact Form &rarr;
            </Link>
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#000" }}>
            location_on
          </span>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px", color: "#000" }}>
              Flagship Studio &amp; HQ
            </h3>
            <p style={{ fontSize: "13px", color: "#5d5f5f", margin: 0 }}>
              ShopSphere Private Limited, Indiranagar, Bengaluru, KA 560038
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HelpSupport

import React, { createContext, useContext, useState, useCallback } from "react"
import "../styles/toast.css"

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(({ title = "Notification", message, image, duration = 3500 }) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, title, message, image }])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const showToast = useCallback((productOrTitle, customMsg) => {
    if (typeof productOrTitle === "string") {
      addToast({
        title: productOrTitle,
        message: customMsg || ""
      })
    } else if (productOrTitle && typeof productOrTitle === "object") {
      addToast({
        title: customMsg || "Notification",
        message: productOrTitle.name || "Action completed",
        image: productOrTitle.imageURL || productOrTitle.image
      })
    } else {
      addToast({
        title: customMsg || "Notification",
        message: ""
      })
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showToast }}>
      {children}
      {/* Toast Container */}
      <div className="stitch-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="stitch-toast-card animate-slide-in">
            <div className="stitch-toast-icon-wrap">
              <span className="material-symbols-outlined stitch-toast-check">
                check_circle
              </span>
            </div>
            {toast.image && (
              <div className="stitch-toast-thumb">
                <img src={toast.image} alt="Notification thumbnail" />
              </div>
            )}
            <div className="stitch-toast-content">
              <h4 className="stitch-toast-title">{toast.title}</h4>
              <p className="stitch-toast-msg">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="stitch-toast-close"
              aria-label="Close notification"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                close
              </span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

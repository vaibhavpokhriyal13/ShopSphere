import { createSlice } from "@reduxjs/toolkit"

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem("shopsphere_cart")
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    return []
  }
}

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem("shopsphere_cart", JSON.stringify(cart))
  } catch (e) {
    console.error("Failed to save cart to localStorage", e)
  }
}

const initialState = {
  items: loadCartFromStorage()
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload
      const prodId = product._id || product.id
      const existingItem = state.items.find(
        (item) => (item._id || item.id) === prodId
      )

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({
          id: prodId,
          _id: prodId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.imageURL || product.image,
          imageURL: product.imageURL || product.image,
          subtitle: product.subtitle || product.category,
          category: product.category,
          quantity: quantity,
          selectedColor: product.selectedColor || "Matte Black",
          selectedSize: product.selectedSize || "Standard"
        })
      }
      saveCartToStorage(state.items)
    },
    removeFromCart: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((item) => (item.id || item._id) !== id)
      saveCartToStorage(state.items)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter((item) => (item.id || item._id) !== id)
      } else {
        const item = state.items.find((it) => (it.id || it._id) === id)
        if (item) {
          item.quantity = quantity
        }
      }
      saveCartToStorage(state.items)
    },
    clearCart: (state) => {
      state.items = []
      saveCartToStorage([])
    }
  }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + (item.quantity || 1), 0)
export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + (Number(item.price) || 0) * (item.quantity || 1),
    0
  )

export default cartSlice.reducer

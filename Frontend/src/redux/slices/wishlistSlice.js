import { createSlice } from "@reduxjs/toolkit"

const loadWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem("shopsphere_wishlist")
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    return []
  }
}

const saveWishlistToStorage = (wishlist) => {
  try {
    localStorage.setItem("shopsphere_wishlist", JSON.stringify(wishlist))
  } catch (e) {
    console.error("Failed to save wishlist to localStorage", e)
  }
}

const initialState = {
  items: loadWishlistFromStorage()
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload
      const prodId = product._id || product.id
      const existsIndex = state.items.findIndex(
        (it) => (it._id || it.id) === prodId
      )

      if (existsIndex >= 0) {
        state.items.splice(existsIndex, 1)
      } else {
        state.items.push({
          id: prodId,
          _id: prodId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.imageURL || product.image,
          imageURL: product.imageURL || product.image,
          category: product.category,
          subtitle: product.subtitle || product.category
        })
      }
      saveWishlistToStorage(state.items)
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((item) => (item.id || item._id) !== id)
      saveWishlistToStorage(state.items)
    },
    clearWishlist: (state) => {
      state.items = []
      saveWishlistToStorage([])
    }
  }
})

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions

export const selectWishlistItems = (state) => state.wishlist.items
export const selectWishlistCount = (state) => state.wishlist.items.length

export default wishlistSlice.reducer

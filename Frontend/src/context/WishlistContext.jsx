import React, { createContext, useContext } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  toggleWishlist as toggleWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  clearWishlist as clearWishlistAction,
  selectWishlistItems,
  selectWishlistCount
} from "../redux/slices/wishlistSlice"
import { useToast } from "./ToastContext"

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const dispatch = useDispatch()
  const wishlist = useSelector(selectWishlistItems)
  const wishlistCount = useSelector(selectWishlistCount)
  const { showToast } = useToast()

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item.id) === productId)
  }

  const toggleWishlist = (product) => {
    const isCurrentlySaved = isInWishlist(product._id || product.id)
    dispatch(toggleWishlistAction(product))

    if (!isCurrentlySaved) {
      showToast(product, "Added to Wishlist")
    } else {

      showToast(product, "Item removed from Wishlist")
    }
  }

  const removeFromWishlist = (productId) => {
    dispatch(removeFromWishlistAction(productId))
  }

  const clearWishlist = () => {
    dispatch(clearWishlistAction())
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)

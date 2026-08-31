import React, { createContext, useContext } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  selectCartItems,
  selectCartCount,
  selectCartTotal
} from "../redux/slices/cartSlice"
import { useToast } from "./ToastContext"

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const dispatch = useDispatch()
  const cart = useSelector(selectCartItems)
  const cartItemsCount = useSelector(selectCartCount)
  const cartTotal = useSelector(selectCartTotal)
  const { showToast } = useToast()

  const addToCart = (product, quantity = 1) => {
    dispatch(addToCartAction({ product, quantity }))
    showToast(product, "Added to Bag")
  }


  const removeFromCart = (productId) => {
    dispatch(removeFromCartAction(productId))
  }

  const updateQuantity = (productId, quantity) => {
    dispatch(updateQuantityAction({ id: productId, quantity }))
  }

  const clearCart = () => {
    dispatch(clearCartAction())
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

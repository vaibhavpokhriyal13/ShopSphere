const RECENTLY_VIEWED_KEY = "shopsphere_recently_viewed"

export const getRecentlyViewed = () => {
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error("Error reading recently viewed from localStorage", err)
    return []
  }
}

export const addRecentlyViewed = (product) => {
  if (!product) return
  try {
    const list = getRecentlyViewed()
    const id = product._id || product.id

    // Remove existing if present to push to top
    const filtered = list.filter((p) => (p._id || p.id) !== id)

    // Unshift fresh item
    filtered.unshift({
      id,
      _id: id,
      name: product.name,
      subtitle: product.subtitle || product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.imageURL || product.image,
      imageURL: product.imageURL || product.image,
      category: product.category,
      rating: product.averageRating || product.rating || 4.8
    })

    // Keep top 20
    const limited = filtered.slice(0, 20)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(limited))
  } catch (err) {
    console.error("Error saving recently viewed", err)
  }
}

export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY)
  } catch (err) {
    console.error("Error clearing recently viewed", err)
  }
}

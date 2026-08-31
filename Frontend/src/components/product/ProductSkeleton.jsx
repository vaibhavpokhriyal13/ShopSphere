import React from "react"
import "../../styles/skeleton.css"

export const ProductSkeleton = () => {
  return (
    <div className="stitch-skeleton-card">
      <div className="stitch-skeleton-image" />
      <div className="stitch-skeleton-content">
        <div className="stitch-skeleton-line short" />
        <div className="stitch-skeleton-line title" />
        <div className="stitch-skeleton-line desc" />
        <div className="stitch-skeleton-line price" />
      </div>
    </div>
  )
}

export const ProductSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="stitch-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  )
}

export default ProductSkeleton

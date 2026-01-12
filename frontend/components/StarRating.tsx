import React from 'react'

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
}

const StarRating = React.memo<StarRatingProps>(function StarRating({ rating, onRatingChange }) {
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`star text-4xl transition-all duration-200 ${star <= rating ? 'filled' : 'empty'}`}
          aria-label={`Rate ${star} stars`}
        >
          {star <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
})

export default StarRating

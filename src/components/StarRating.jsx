import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate = null, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = (value) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || rating) >= star;
        return (
          <button
            key={star}
            className={`star-button ${isFilled ? 'filled' : ''}`}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={readonly}
            type="button"
          >
            <Star
              size={24}
              fill={isFilled ? 'currentColor' : 'none'}
              color={isFilled ? '#FFB800' : '#CCCCCC'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;

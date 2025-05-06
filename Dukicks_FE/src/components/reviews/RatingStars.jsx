import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ rating, totalReviews, size = 'md' }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    const starSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`star-${i}`} className='text-warning' size={starSize} />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt
          key='half-star'
          className='text-warning'
          size={starSize}
        />
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar
          key={`empty-${i}`}
          className='text-warning'
          size={starSize}
        />
      );
    }

    return stars;
  };

  return (
    <div className='d-flex align-items-center'>
      <div className='me-2'>{renderStars()}</div>
      {totalReviews !== undefined && (
        <span className='text-muted'>
          ({rating.toFixed(1)}){' '}
          {totalReviews > 0 && `${totalReviews} recensioni`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;

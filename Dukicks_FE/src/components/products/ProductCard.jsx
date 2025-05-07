import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/productCard.css';
import AddToCartButton from './AddToCartButton';

const ProductCard = ({ product }) => {
  // eslint-disable-next-line no-unused-vars
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isInWishlist = false;

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (!isAuthenticated) {
      return;
    }
  };

  const taglie = [...(product.availableSizes || [])].sort(
    (a, b) => Number(a) - Number(b)
  );

  return (
    <div className='card'>
      <div className='image_container'>
        <Link to={`/products/${product.id}`}>
          <img
            src={
              product.imageUrl.startsWith('http')
                ? product.imageUrl
                : `https://dukicks-backend-egbkdubnbxdmg4cw.italynorth-01.azurewebsites.net${product.imageUrl}`
            }
            alt={product.name}
            className='product-image'
          />
        </Link>

        {/* Wishlist icon */}
        <button className='wishlist-button' onClick={handleToggleWishlist}>
          {isInWishlist ? (
            <FaHeart className='wishlist-icon wishlist-icon-filled' />
          ) : (
            <FaRegHeart className='wishlist-icon' />
          )}
        </button>

        {/* Badge sconto */}
        {product.isDiscounted && (
          <Badge bg='danger' className='discount-badge'>
            -
            {Math.round(
              ((product.price - product.discountPrice) / product.price) * 100
            )}
            %
          </Badge>
        )}
      </div>

      <div className='title'>
        <span>{product.name}</span>
      </div>

      <div className='brand-info'>
        <span>{product.brand}</span>
        <div className='rating'>
          <span>★★★★☆ ({product.reviewCount || 0})</span>
        </div>
      </div>

      {taglie && taglie.length > 0 && (
        <div className='size'>
          <span>Taglia</span>
          <ul className='list-size'>
            {taglie.map((taglia) => (
              <li key={taglia} className='item-list'>
                <button className='item-list-button'>{taglia}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='action'>
        <div className='price'>
          {product.isDiscounted ? (
            <>
              <span className='original-price'>
                €{product.price.toFixed(2)}
              </span>
              <span className='discount-price'>
                €{product.discountPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span>€{product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

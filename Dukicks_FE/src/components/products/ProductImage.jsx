import React, { useState } from 'react';
import '../../styles/productImage.css'; 

const ProductImage = ({ imageUrl, alt, className }) => { 
  const animationStyles = [
    'zoom-effect',
    'rotate-effect',
    'float-effect',
    'effect-3d',
    'spotlight-effect',
    'glow-effect',
  ];

  const [currentAnimation, setCurrentAnimation] = useState('effect-3d');
  const [showTooltip, setShowTooltip] = useState(true);

  const changeAnimation = () => {
    const currentIndex = animationStyles.indexOf(currentAnimation);
    const nextIndex = (currentIndex + 1) % animationStyles.length;
    setCurrentAnimation(animationStyles[nextIndex]);
    setShowTooltip(false); 
  };

  const formattedImageUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `https://dukicks-backend-egbkdubnbxdmg4cw.italynorth-01.azurewebsites.net${imageUrl}`;

  return (
    <div
      className={`product-image-container ${currentAnimation} ${
        className || ''
      }`}
      onClick={changeAnimation}
    >
      <img
        src={formattedImageUrl}
        alt={alt || 'Immagine prodotto'}
        className='main-image'
        style={{
          maxHeight: '450px', 
          width: '100%',
          objectFit: 'contain',
        }}
      />
      {showTooltip && (
        <div className='image-tooltip'>Clicca per cambiare effetto</div>
      )}
    </div>
  );
};

export default ProductImage;

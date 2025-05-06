import React from 'react';

const SizeSelector = ({ sizes, selectedSize, onChange, className }) => {
  if (!sizes || sizes.length === 0) {
    return <p className='text-muted'>Nessuna taglia disponibile</p>;
  }

  return (
    <div className={className}>
      <h6 className='mb-3'>Taglia:</h6>
      <div className='d-flex flex-wrap'>
        {sizes.map((size) => (
          <div
            key={size.sizeId}
            className={`
              size-box 
              me-2 mb-2 
              border 
              rounded 
              d-flex 
              align-items-center 
              justify-content-center
              ${selectedSize === size.sizeId ? 'selected' : ''}
              ${size.stock <= 0 ? 'disabled' : 'cursor-pointer'}
            `}
            onClick={() => size.stock > 0 && onChange(size.sizeId)}
          >
            {size.sizeName}
          </div>
        ))}
      </div>

      {selectedSize &&
        sizes.find((s) => s.sizeId === selectedSize)?.stock <= 5 && (
          <p className='text-warning mt-2'>
            <small>
              Solo {sizes.find((s) => s.sizeId === selectedSize)?.stock}{' '}
              disponibili
            </small>
          </p>
        )}
    </div>
  );
};

export default SizeSelector;

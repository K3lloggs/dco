// src/components/ProductCard.jsx

import React from 'react';
import PropTypes from 'prop-types';

const ProductCard = ({ product, onClick }) => {
  // Format price as USD
  const formatPrice = (price) => {
    return price != null
      ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '';
  };

  return (
    <div className="product-card" onClick={() => onClick(product)}>
      <div className="product-image-container">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="product-image"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/300';
            }}
          />
        ) : (
          <div className="product-no-image">Image not available</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">{formatPrice(product.wholesale)}</p>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    wholesale: PropTypes.number,
    images: PropTypes.array,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ProductCard;
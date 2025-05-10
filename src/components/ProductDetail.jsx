// src/components/ProductDetail.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ProductDetail = ({ product, onClose }) => {
  // State to track the current main image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Format price as USD
  const formatPrice = (price) => {
    return price != null
      ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '';
  };

  // Go to next image
  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Go to previous image
  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Go to specific image
  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Close modal on overlay click, but not on modal content click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="product-detail-overlay" onClick={handleOverlayClick}>
      <div className="product-detail-modal">
        <button className="close-modal" onClick={onClose}>✕</button>
        <div className="product-detail-content">

          {/* Left: Image with navigation controls */}
          <div className="product-detail-image">
            <div className="product-detail-image-container">
              {product.images && product.images.length > 1 && (
                <button 
                  className="image-nav image-nav-prev" 
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}
              
              <img
                src={product.images?.[currentImageIndex] || 'https://via.placeholder.com/300'}
                alt={product.title}
                className="main-product-image"
              />
              
              {product.images && product.images.length > 1 && (
                <button 
                  className="image-nav image-nav-next"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
            
            {/* Image indicator dots */}
            {product.images && product.images.length > 1 && (
              <div className="image-indicators">
                {product.images.map((_, i) => (
                  <button 
                    key={i} 
                    className={`image-indicator ${i === currentImageIndex ? 'active' : ''}`}
                    onClick={() => goToImage(i)}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === currentImageIndex}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="product-detail-info">
            <div className="product-detail-header">
              <h2 className="product-detail-title">{product.title}</h2>
              <p className="product-detail-category">{product.category}</p>
              <p className="product-detail-price">{formatPrice(product.wholesale)}</p>
            </div>
            <div className="product-detail-description">
              {product.description || 'No description available.'}
            </div>
            <div className="product-specifications">
              <h3>Specifications</h3>
              <ul>
                {product.metal && (
                  <li><span>Metal:</span> {product.metal}</li>
                )}
                {product.stone && (
                  <li><span>Stone:</span> {product.stone}</li>
                )}
                {product.total_weight && (
                  <li><span>Weight:</span> {product.total_weight}g</li>
                )}
                {product.sku && (
                  <li><span>SKU:</span> {product.sku}</li>
                )}
              </ul>
            </div>
            <div className="product-detail-actions">
              <a
                href={`mailto:HELLO@DAVID&CO.COM?subject=Inquiry about ${product.title}`}
                className="primary-button"
              >
                Contact Us
              </a>
              <button className="secondary-button" onClick={onClose}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string,
    wholesale: PropTypes.number,
    description: PropTypes.string,
    images: PropTypes.array,
    metal: PropTypes.string,
    stone: PropTypes.string,
    total_weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sku: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProductDetail;
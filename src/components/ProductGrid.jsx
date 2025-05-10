// src/components/ProductGrid.jsx

import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, onProductClick }) => {
  // Create skeleton placeholders for loading state
  const renderSkeletons = () => {
    return Array.from({ length: 9 }).map((_, i) => (
      <div key={`skeleton-${i}`} className="product-skeleton">
        <div className="skeleton-image"></div>
        <div className="skeleton-text-short"></div>
        <div className="skeleton-text-long"></div>
      </div>
    ));
  };

  return (
    <div 
      className={`product-grid ${loading ? 'is-loading' : ''}`}
    >
      {loading ? (
        renderSkeletons()
      ) : products.length > 0 ? (
        products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={onProductClick} 
          />
        ))
      ) : (
        <div className="empty-message">No products in this category.</div>
      )}
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onProductClick: PropTypes.func.isRequired,
};

ProductGrid.defaultProps = {
  loading: false,
};

export default ProductGrid;
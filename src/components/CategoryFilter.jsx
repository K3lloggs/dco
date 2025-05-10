// src/components/CategoryFilter.jsx

import React from 'react';
import PropTypes from 'prop-types';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="category-filters">
      <div className="category-filters-container">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`category-btn ${activeCategory === category ? 'active' : ''}`}
            aria-pressed={activeCategory === category}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
};

export default CategoryFilter;
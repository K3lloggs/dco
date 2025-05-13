// src/pages/HomePage.jsx - Fixed rendering loop
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../App.css';

// Define categories outside component to prevent recreation on each render
const CATEGORIES = [
  'All', 'Bracelet', 'Brooch', 'Earring',
  'Necklace', 'Pendant', 'Pin', 'Ring', 'Watch'
];

export default function HomePage({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const { category } = useParams();
  const navigate = useNavigate();

  // Set initial category from URL parameter - only once on mount or when URL changes
  useEffect(() => {
    if (category) {
      const cap = category.charAt(0).toUpperCase() + category.slice(1);
      if (CATEGORIES.includes(cap)) {
        setActiveCategory(cap);
      }
    } else {
      setActiveCategory('All');
    }
  }, [category]); // Only depend on URL parameter

  // Fetch products when activeCategory changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const toFetch =
          activeCategory === 'All'
            ? CATEGORIES.filter(c => c !== 'All')
            : [activeCategory];

        const all = [];
        for (const col of toFetch) {
          const snap = await getDocs(collection(db, col));
          all.push(
            ...snap.docs.map(d => ({ id: d.id, category: col, ...d.data() }))
          );
        }

        setProducts(all);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory]); // Only depend on activeCategory

  // Open / close modal
  const openDetail = (prod) => {
    setSelectedProduct(prod);
    setProductDetailOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeDetail = () => {
    setProductDetailOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Navigate product images
  const navigateImages = (direction) => {
    if (!selectedProduct?.images || selectedProduct.images.length <= 1) return;

    const imgs = [...selectedProduct.images];
    if (direction === 'next') {
      const firstImg = imgs.shift();
      imgs.push(firstImg);
    } else {
      const lastImg = imgs.pop();
      imgs.unshift(lastImg);
    }

    setSelectedProduct({ ...selectedProduct, images: imgs });
  };

  // Format wholesale price as USD with no cents
  const formatPrice = (num) => {
    if (num == null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Handle category change - use React Router navigation instead of direct DOM manipulation
  const handleCategoryChange = (cat) => {
    if (cat === activeCategory) return;

    // Use React Router's navigate to handle URL changes
    if (cat === 'All') {
      navigate('/');
    } else {
      navigate(`/${cat.toLowerCase()}`);
    }
    // Note: setActiveCategory is not needed here as it will be handled by the useEffect that watches the URL
  };

  return (
    <div className="home-container">
      {/* Navbar component */}
      <Navbar />

      {/* Main content */}
      <main className="main-content">
        <div className="container">
          {/* Collection title */}
          <h1 className="collection-title">Collection</h1>

          {/* Category filters */}
          <div className="category-filters">
            <div className="category-buttons">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          <div className="products-section">
            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="product-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text-short"></div>
                    <div className="skeleton-text-long"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="product-item"
                    onClick={() => openDetail(product)}
                  >
                    <div className="product-image-container">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title || "Product image"}
                          className="product-image"
                          loading="lazy"
                          onError={e => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Product';
                          }}
                        />
                      ) : (
                        <div className="product-no-image">
                          Image not available
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">
                        {product.title || product.cut || product.id}
                      </h3>
                      <p className="product-price">
                        {formatPrice(product.wholesale)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">
                No products in this category.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Product detail modal - Apple-esque design */}
      {productDetailOpen && selectedProduct && (
        <div className="product-detail-overlay" onClick={closeDetail}>
          <div className="product-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={closeDetail}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L16 16M1 16L16 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="product-detail-content">
              {/* Left: Image with navigation controls */}
              <div className="product-detail-image">
                <div className="product-detail-image-container">
                  {selectedProduct.images?.length > 1 && (
                    <button
                      className="image-nav image-nav-prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateImages('prev');
                      }}
                      aria-label="Previous image"
                    >
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}

                  <img
                    src={selectedProduct.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image'}
                    alt={selectedProduct.title || "Product detail"}
                    className="main-product-image"
                  />

                  {selectedProduct.images?.length > 1 && (
                    <button
                      className="image-nav image-nav-next"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateImages('next');
                      }}
                      aria-label="Next image"
                    >
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L10 10L2 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}

                  {/* Image pagination dots */}
                  {selectedProduct.images?.length > 1 && (
                    <div className="pagination-dots">
                      {selectedProduct.images.map((_, i) => (
                        <button
                          key={i}
                          className={`pagination-dot ${i === 0 ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const imgs = [...selectedProduct.images];
                            const selected = imgs.splice(i, 1)[0];
                            imgs.unshift(selected);
                            setSelectedProduct({ ...selectedProduct, images: imgs });
                          }}
                          aria-label={`View image ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details and Specifications */}
              <div className="product-detail-info">
                <h1 className="product-detail-title">{selectedProduct.title || selectedProduct.cut || selectedProduct.id}</h1>
                <p className="product-detail-category">{selectedProduct.category}</p>
                <p className="product-detail-price">{formatPrice(selectedProduct.wholesale)}</p>

                <div className="product-detail-description">
                  {selectedProduct.description || 'This exquisite piece exemplifies fine craftsmanship and timeless design. Made with meticulous attention to detail, it represents the pinnacle of luxury and elegance.'}
                </div>

                <div className="specifications-section">
                  <h3 className="specifications-title">Specifications</h3>
                  <div className="specifications-table">
                    {selectedProduct.metal && (
                      <div className="spec-row">
                        <div className="spec-label">Metal</div>
                        <div className="spec-value">{selectedProduct.metal}</div>
                      </div>
                    )}
                    {selectedProduct.stone && (
                      <div className="spec-row">
                        <div className="spec-label">Stone</div>
                        <div className="spec-value">{selectedProduct.stone}</div>
                      </div>
                    )}
                    {selectedProduct.total_weight && (
                      <div className="spec-row">
                        <div className="spec-label">Weight</div>
                        <div className="spec-value">{selectedProduct.total_weight}g</div>
                      </div>
                    )}
                    {selectedProduct.sku && (
                      <div className="spec-row">
                        <div className="spec-label">SKU</div>
                        <div className="spec-value">{selectedProduct.sku}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="product-action-buttons">
                  <button
                    className="contact-button"
                    onClick={() => {
                      window.location.href = `mailto:HELLO@DAVID&CO.COM?subject=Inquiry about ${selectedProduct.title || selectedProduct.id}`;
                    }}
                  >
                    Contact About This Piece
                  </button>
                  <button className="continue-shopping-button" onClick={closeDetail}>
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} David &amp; Co</p>

          <button onClick={onLogout} className="logout-button">
            Sign Out
          </button>
        </div>
      </footer>
    </div>
  );
}
// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../App.css';

export default function HomePage({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = [
    'All', 'Bracelet', 'Brooch', 'Earring',
    'Necklace', 'Pendant', 'Pin', 'Ring', 'Watch'
  ];
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const { category } = useParams();

  // Sync URL → category
  useEffect(() => {
    if (category) {
      const cap = category.charAt(0).toUpperCase() + category.slice(1);
      if (categories.includes(cap)) setActiveCategory(cap);
    }
  }, [category]);

  // Fetch products whenever activeCategory changes
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const toFetch =
          activeCategory === 'All'
            ? categories.filter(c => c !== 'All')
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
        console.error(err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    })();
  }, [activeCategory]);

  // Open / close modal
  const openDetail = prod => {
    setSelectedProduct(prod);
    setProductDetailOpen(true);
    document.body.classList.add('modal-open');
  };
  const closeDetail = () => {
    setProductDetailOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Format wholesale price as USD with .00
  const fmt = num =>
    num != null
      ? num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '';

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* Navbar component */}
      <Navbar />

      {/* Main content with proper top spacing for fixed header */}
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4">
          {/* Collection title - centered */}
          <h1 className="collection-title text-center">Collection</h1>

          {/* Category filters - centered */}
          <div className="category-filters my-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid - exactly 3 per row */}
          {(loading || products.length > 0) ? (
            <div
              className={`product-grid transition-opacity duration-300 ease-in-out
                ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            >
              {loading
                ? Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="product-skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-text-short"></div>
                      <div className="skeleton-text-long"></div>
                    </div>
                  ))
                : products.map(product => (
                    <div
                      key={product.id}
                      className="product-item"
                      onClick={() => openDetail(product)}
                    >
                      <div className="product-image-container">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="product-image"
                            onError={e => {
                              e.currentTarget.src =
                                'https://via.placeholder.com/300';
                            }}
                          />
                        ) : (
                          <div className="product-no-image">
                            Image not available
                          </div>
                        )}
                      </div>
                      <div className="product-info text-center">
                        <h3 className="product-title">
                          {product.title}
                        </h3>
                        <p className="product-price">
                          {fmt(product.wholesale)}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
          ) : (
            <p className="empty-message text-center">
              No products in this category.
            </p>
          )}
        </div>
      </main>

      {/* Product detail modal */}
      {productDetailOpen && selectedProduct && (
        <div className="product-detail-overlay" onClick={closeDetail}>
          <div className="product-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={closeDetail}>✕</button>
            <div className="product-detail-content">

              {/* Left: Image with navigation controls */}
              <div className="product-detail-image">
                <div className="product-detail-image-container">
                  {selectedProduct.images?.length > 1 && (
                    <button 
                      className="image-nav image-nav-prev" 
                      onClick={() => {
                        const imgs = [...selectedProduct.images];
                        const lastImg = imgs.pop();
                        imgs.unshift(lastImg);
                        setSelectedProduct({ ...selectedProduct, images: imgs });
                      }}
                    >
                      ‹
                    </button>
                  )}
                  
                  <img
                    src={selectedProduct.images?.[0]}
                    alt={selectedProduct.title}
                    className="main-product-image"
                  />
                  
                  {selectedProduct.images?.length > 1 && (
                    <button 
                      className="image-nav image-nav-next"
                      onClick={() => {
                        const imgs = [...selectedProduct.images];
                        const firstImg = imgs.shift();
                        imgs.push(firstImg);
                        setSelectedProduct({ ...selectedProduct, images: imgs });
                      }}
                    >
                      ›
                    </button>
                  )}
                </div>
                
                {/* Image pagination dots */}
                {selectedProduct.images?.length > 1 && (
                  <div className="pagination-dots">
                    {selectedProduct.images.map((img, i) => (
                      <span 
                        key={i} 
                        className={`pagination-dot ${i === 0 ? 'active' : ''}`}
                        onClick={() => {
                          const imgs = [...selectedProduct.images];
                          const temp = imgs[0];
                          imgs[0] = imgs[i];
                          imgs[i] = temp;
                          setSelectedProduct({ ...selectedProduct, images: imgs });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details and Specifications */}
              <div className="product-detail-info">
                <h1 className="product-detail-title">{selectedProduct.title}</h1>
                <p className="product-detail-category">{selectedProduct.category}</p>
                <p className="product-detail-price">{fmt(selectedProduct.wholesale)}</p>
                
                <div className="product-detail-description">
                  {selectedProduct.description || 'No description available.'}
                </div>
                
                <div className="specifications-section">
                  <h3 className="specifications-title">Specifications</h3>
                  <div className="specifications-table">
                    {selectedProduct.metal && (
                      <div className="spec-row">
                        <div className="spec-label">Metal:</div>
                        <div className="spec-value">{selectedProduct.metal}</div>
                      </div>
                    )}
                    {selectedProduct.stone && (
                      <div className="spec-row">
                        <div className="spec-label">Stone:</div>
                        <div className="spec-value">{selectedProduct.stone}</div>
                      </div>
                    )}
                    {selectedProduct.total_weight && (
                      <div className="spec-row">
                        <div className="spec-label">Weight:</div>
                        <div className="spec-value">{selectedProduct.total_weight}g</div>
                      </div>
                    )}
                    {selectedProduct.sku && (
                      <div className="spec-row">
                        <div className="spec-label">SKU:</div>
                        <div className="spec-value">{selectedProduct.sku}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="product-action-buttons">
                  <button className="contact-button" onClick={() => {
                    window.location.href = `mailto:HELLO@DAVID&CO.COM?subject=Inquiry about ${selectedProduct.title}`;
                  }}>
                    Contact Us
                  </button>
                  <button className="continue-shopping-button" onClick={closeDetail}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="container text-center text-gray-500 text-sm py-4">
          © {new Date().getFullYear()} David &amp; Co
        </div>
      </footer>
    </div>
  );
}
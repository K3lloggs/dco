// src/pages/HomePage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../index.css';

// Singular collection names in Firebase
const COLLECTION_NAMES = [
  'All', 'Bracelet', 'Brooch', 'Earring',
  'Necklace', 'Pendant', 'Pin', 'Ring', 'Watch', 'Art'
];

// Mapping from URL paths to collection names
const PATH_TO_COLLECTION = {
  'bracelet': 'Bracelet',
  'bracelets': 'Bracelet',
  'brooch': 'Brooch',
  'brooches': 'Brooch',
  'earring': 'Earring',
  'earrings': 'Earring',
  'necklace': 'Necklace',
  'necklaces': 'Necklace',
  'pendant': 'Pendant',
  'pendants': 'Pendant',
  'pin': 'Pin',
  'pins': 'Pin',
  'ring': 'Ring',
  'rings': 'Ring',
  'watch': 'Watch',
  'watches': 'Watch',
  'art': 'Art'
};

// Fisher–Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function HomePage({ onLogout }) {
  const allProductsCache = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { category } = useParams();
  const navigate = useNavigate();

  // Map URL category parameter to Firebase collection name
  useEffect(() => {
    if (category) {
      const lower = category.toLowerCase();
      setActiveCollection(PATH_TO_COLLECTION[lower] || 'All');
    } else {
      setActiveCollection('All');
    }
  }, [category]);

  // Fetch products whenever activeCollection changes
  const fetchProducts = useCallback(async () => {
    setLoading(true);

    // If "All" already cached, reuse it
    if (activeCollection === 'All' && allProductsCache.current) {
      setProducts(allProductsCache.current);
      setLoading(false);
      return;
    }

    try {
      const toFetch =
        activeCollection === 'All'
          ? COLLECTION_NAMES.filter(c => c !== 'All')
          : [activeCollection];

      let all = [];
      const promises = toFetch.map(col =>
        getDocs(collection(db, col)).then(snap =>
          snap.docs.map(d => ({ id: d.id, category: col, ...d.data() }))
        )
      );
      const results = await Promise.all(promises);
      results.forEach(items => all.push(...items));

      // Shuffle & cache only once on initial "All"
      if (activeCollection === 'All') {
        all = shuffleArray(all);
        allProductsCache.current = all;
      }

      setProducts(all);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCollection]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Modal handlers
  const openDetail = useCallback(prod => {
    setSelectedProduct(prod);
    setCurrentImageIndex(0);
    setProductDetailOpen(true);
    document.body.classList.add('modal-open');
  }, []);

  const closeDetail = useCallback(() => {
    setProductDetailOpen(false);
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      setSelectedProduct(null);
      setCurrentImageIndex(0);
    }, 300);
  }, []);

  // Image carousel navigation
  const navigateImages = useCallback(
    direction => {
      if (!selectedProduct?.images || selectedProduct.images.length <= 1) return;
      setCurrentImageIndex(prev => {
        const total = selectedProduct.images.length;
        return direction === 'next'
          ? (prev + 1) % total
          : (prev - 1 + total) % total;
      });
    },
    [selectedProduct]
  );

  const selectImage = useCallback(
    idx => {
      if (!selectedProduct?.images) return;
      setCurrentImageIndex(idx);
    },
    [selectedProduct]
  );

  // Price formatter
  const formatPrice = useMemo(
    () => num =>
      num == null
        ? ''
        : new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(num),
    []
  );

  // ESC to close modal
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && productDetailOpen) closeDetail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [productDetailOpen, closeDetail]);

  // Arrow keys for image nav
  useEffect(() => {
    const onArrow = e => {
      if (
        !productDetailOpen ||
        !selectedProduct?.images ||
        selectedProduct.images.length <= 1
      )
        return;
      if (e.key === 'ArrowLeft') navigateImages('prev');
      else if (e.key === 'ArrowRight') navigateImages('next');
    };
    window.addEventListener('keydown', onArrow);
    return () => window.removeEventListener('keydown', onArrow);
  }, [productDetailOpen, selectedProduct, navigateImages]);

  // Display-friendly category names
  const getCategoryDisplay = cat => {
    switch (cat) {
      case 'Bracelet': return 'Bracelets';
      case 'Brooch': return 'Brooches';
      case 'Earring': return 'Earrings';
      case 'Necklace': return 'Necklaces';
      case 'Pendant': return 'Pendants';
      case 'Ring': return 'Rings';
      case 'Watch': return 'Watches';
      case 'Pin': return 'Pins';
      case 'Art': return 'Art';
      default: return cat;
    }
  };

  // Loading skeleton
  const loadingSkeletons = (
    <div className="product-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="product-skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-text-short" />
          <div className="skeleton-text-long" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="home-container">
      <Navbar />
      <main className="main-content">
        <div className="container">
          {loading ? (
            loadingSkeletons
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map(prod => (
                <div
                  key={prod.id}
                  className="product-item"
                  onClick={() => openDetail(prod)}
                >
                  <div className="product-image-container">
                    {prod.images?.[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={prod.title || 'Product'}
                        className="product-image"
                        loading="lazy"
                        onError={e =>
                          (e.currentTarget.src =
                            'https://via.placeholder.com/400x400?text=Product')
                        }
                      />
                    ) : (
                      <div className="product-no-image">
                        Image not available
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">
                      {prod.title || prod.cut || prod.id}
                    </h3>
                    <p className="product-price">
                      {formatPrice(prod.wholesale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No products in this category.</p>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      {productDetailOpen && (
        <div
          className="product-detail-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div className="product-detail-modal">
            <button className="close-modal" onClick={closeDetail}>×</button>
            {selectedProduct && (
              <div className="product-detail-content">
                <div className="product-detail-image">
                  <div className="product-detail-image-container">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <>
                        <div className="carousel-image-wrapper">
                          <img
                            src={selectedProduct.images[currentImageIndex]}
                            alt={selectedProduct.title || 'Product'}
                            className="carousel-image"
                            onError={e =>
                              (e.currentTarget.src =
                                'https://via.placeholder.com/500x500?text=No+Image')
                            }
                          />
                        </div>
                        {selectedProduct.images.length > 1 && (
                          <>
                            <button
                              className="image-nav image-nav-prev"
                              onClick={e => {
                                e.stopPropagation();
                                navigateImages('prev');
                              }}
                              aria-label="Previous image"
                            >
                              ‹
                            </button>
                            <button
                              className="image-nav image-nav-next"
                              onClick={e => {
                                e.stopPropagation();
                                navigateImages('next');
                              }}
                              aria-label="Next image"
                            >
                              ›
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="product-no-image">Image not available</div>
                    )}
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="pagination-dots">
                      {selectedProduct.images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`pagination-dot ${idx === currentImageIndex ? 'active' : ''}`}
                          onClick={e => {
                            e.stopPropagation();
                            selectImage(idx);
                          }}
                          aria-label={`View image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="product-detail-info">
                  <p className="product-detail-category">
                    {getCategoryDisplay(selectedProduct.category)}
                  </p>
                  <h2 className="product-detail-title">
                    {selectedProduct.title || selectedProduct.cut || selectedProduct.id}
                  </h2>
                  <p className="product-detail-price">
                    {formatPrice(selectedProduct.wholesale)}
                  </p>
                  {selectedProduct.description && (
                    <div className="product-detail-description">
                      {selectedProduct.description}
                    </div>
                  )}
                  <div className="specifications-section">
                    <h3 className="specifications-title">Specifications</h3>
                    <div className="specifications-table">
                      {selectedProduct.sku && (
                        <div className="spec-row">
                          <div className="spec-label">SKU</div>
                          <div className="spec-value">{selectedProduct.sku}</div>
                        </div>
                      )}
                      {selectedProduct.stone && (
                        <div className="spec-row">
                          <div className="spec-label">Stone Type</div>
                          <div className="spec-value">{selectedProduct.stone}</div>
                        </div>
                      )}
                      {selectedProduct.total_weight && (
                        <div className="spec-row">
                          <div className="spec-label">Total Weight</div>
                          <div className="spec-value">{selectedProduct.total_weight}</div>
                        </div>
                      )}
                      {selectedProduct.metal && (
                        <div className="spec-row">
                          <div className="spec-label">Metal</div>
                          <div className="spec-value">{selectedProduct.metal}</div>
                        </div>
                      )}
                      {selectedProduct.cut && (
                        <div className="spec-row">
                          <div className="spec-label">Cut</div>
                          <div className="spec-value">{selectedProduct.cut}</div>
                        </div>
                      )}
                      {selectedProduct.availability !== undefined && (
                        <div className="spec-row">
                          <div className="spec-label">Availability</div>
                          <div className="spec-value">
                            {selectedProduct.availability ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../index.css';

// Singular collection names in Firebase
const COLLECTION_NAMES = [
  'All', 'Bracelet', 'Brooch', 'Earring',
  'Necklace', 'Pendant', 'Pin', 'Ring', 'Watch', 'Art', 'Gem'
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
  'art': 'Art',
  'stones': 'Gem',
  'gems': 'Gem'
};

export default function HomePage({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [randomizedAllProducts, setRandomizedAllProducts] = useState([]);
  const { category } = useParams();
  const navigate = useNavigate();

  // Map URL category parameter to Firebase collection name
  useEffect(() => {
    if (category) {
      const categoryLower = category.toLowerCase();
      const collectionName = PATH_TO_COLLECTION[categoryLower] || 'All';
      setActiveCollection(collectionName);
    } else {
      setActiveCollection('All');
    }
  }, [category]);

  // Fetch products whenever activeCollection changes
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let collectionsToFetch = [];

      if (activeCollection === 'All') {
        // Fetch all collections except 'All'
        collectionsToFetch = COLLECTION_NAMES.filter(c => c !== 'All');
      } else {
        // Fetch only the active collection
        collectionsToFetch = [activeCollection];
      }

      const allProducts = [];
      const promises = collectionsToFetch.map(col =>
        getDocs(collection(db, col)).then(snap =>
          snap.docs.map(d => ({ id: d.id, category: col, ...d.data() }))
        )
      );

      const results = await Promise.all(promises);
      results.forEach(items => allProducts.push(...items));

      // Use randomized products for "All" tab if available, otherwise create and store them
      if (activeCollection === 'All' && randomizedAllProducts.length > 0) {
        // Use the stored randomized products
        setProducts(randomizedAllProducts);
        setFilteredProducts(randomizedAllProducts);
      } else if (activeCollection === 'All') {
        // Create a randomized version of all products for the "All" tab
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        setRandomizedAllProducts(shuffled);
        setProducts(shuffled);
        setFilteredProducts(shuffled);
      } else {
        // For specific categories, keep original order and only show products from that category
        setProducts(allProducts.filter(product => product.category === activeCollection));
        setFilteredProducts(allProducts.filter(product => product.category === activeCollection));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCollection, randomizedAllProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search functionality
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // When clearing search, show either randomized or filtered products depending on active collection
      if (activeCollection === 'All') {
        setFilteredProducts(randomizedAllProducts.length > 0 ? randomizedAllProducts : products);
      } else {
        setFilteredProducts(products);
      }
      return;
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

    const filtered = products.filter(product => {
      // Search in these fields
      const searchableFields = [
        product.title,
        product.cut,
        product.description,
        product.stone,
        product.metal,
        product.sku,
        product.category
      ];

      // Convert to string and filter out null/undefined
      const searchableText = searchableFields
        .filter(field => field)
        .map(field => String(field).toLowerCase());

      // Check if all search terms are found in at least one of the searchable fields
      return searchTerms.every(term =>
        searchableText.some(text => text.includes(term))
      );
    });

    setFilteredProducts(filtered);
  }, [products, activeCollection, randomizedAllProducts]);

  // Reset filtered products when products change
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
    } else {
      // Re-apply search filter when products change
      handleSearch(searchQuery);
    }
  }, [products, searchQuery, handleSearch]);

  // Navigate to category pages
  const handleCategoryChange = useCallback((collectionName) => {
    // Map from Firebase collection name to URL path
    const getCategoryPath = (collection) => {
      switch (collection) {
        case 'All': return '/';
        case 'Bracelet': return '/bracelets';
        case 'Brooch': return '/brooches';
        case 'Earring': return '/earrings';
        case 'Necklace': return '/necklaces';
        case 'Pendant': return '/pendants';
        case 'Pin': return '/pins';
        case 'Ring': return '/rings';
        case 'Watch': return '/watches';
        case 'Art': return '/art';
        case 'Gem': return '/stones';
        default: return '/';
      }
    };

    navigate(getCategoryPath(collectionName));
  }, [navigate]);

  // Modal handlers
  const openDetail = useCallback(prod => {
    setSelectedProduct(prod);
    setCurrentImageIndex(0); // Reset image index when opening modal
    setProductDetailOpen(true);
    document.body.classList.add('modal-open');
  }, []);

  const closeDetail = useCallback(() => {
    setProductDetailOpen(false);
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      setSelectedProduct(null);
      setCurrentImageIndex(0); // Reset image index when closing modal
    }, 300);
  }, []);

  // Image carousel - improved navigation
  const navigateImages = useCallback(
    direction => {
      if (!selectedProduct?.images || selectedProduct.images.length <= 1) return;

      setCurrentImageIndex(prevIndex => {
        const totalImages = selectedProduct.images.length;
        if (direction === 'next') {
          return (prevIndex + 1) % totalImages;
        } else {
          return (prevIndex - 1 + totalImages) % totalImages;
        }
      });
    },
    [selectedProduct]
  );

  const selectImage = useCallback(
    index => {
      if (!selectedProduct?.images) return;
      setCurrentImageIndex(index);
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

  // ESC key → close modal
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && productDetailOpen) closeDetail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [productDetailOpen, closeDetail]);

  // Arrow key navigation for images
  useEffect(() => {
    const handleKeyDown = e => {
      if (!productDetailOpen || !selectedProduct?.images || selectedProduct.images.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        navigateImages('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImages('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productDetailOpen, selectedProduct, navigateImages]);

  // Loading skeleton
  const loadingSkeletons = useMemo(
    () => (
      <div className="product-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="product-skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-text-short" />
            <div className="skeleton-text-long" />
          </div>
        ))}
      </div>
    ),
    []
  );

  // Get a display-friendly category name (pluralized)
  const getCategoryDisplay = (category) => {
    switch (category) {
      case 'Bracelet': return 'Bracelets';
      case 'Brooch': return 'Brooches';
      case 'Earring': return 'Earrings';
      case 'Necklace': return 'Necklaces';
      case 'Pendant': return 'Pendants';
      case 'Ring': return 'Rings';
      case 'Watch': return 'Watches';
      case 'Pin': return 'Pins';
      case 'Art': return 'Art';
      case 'Gem': return 'Stones';
      default: return category;
    }
  };

  return (
    <div className="home-container">
      <Navbar onSearch={handleSearch} activeCollection={activeCollection} onCategoryChange={handleCategoryChange} />
      <main className="main-content">
        <div className="container">
          {searchQuery && (
            <div className="search-results-header">
              <h2>Results for "{searchQuery}"</h2>
              <button
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setFilteredProducts(activeCollection === 'All' ? randomizedAllProducts : products);
                }}
                aria-label="Clear search results"
              >
                Clear
              </button>
            </div>
          )}
          <div className="products-section">
            {loading ? (
              loadingSkeletons
            ) : filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map(prod => (
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
              <p className="empty-message">
                {searchQuery
                  ? `No products found matching "${searchQuery}"`
                  : `No products found in ${getCategoryDisplay(activeCollection)}.`}
              </p>
            )}
          </div>
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
            <button className="close-modal" onClick={closeDetail}>
              ×
            </button>

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

                          {/* Pagination dots positioned inside the image container */}
                          {selectedProduct.images.length > 1 && (
                            <div className="pagination-dots">
                              {selectedProduct.images.map((_, index) => (
                                <button
                                  key={index}
                                  className={`pagination-dot ${index === currentImageIndex ? 'active' : ''}`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    selectImage(index);
                                  }}
                                  aria-label={`View image ${index + 1}`}
                                />
                              ))}
                            </div>
                          )}
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
                              <span className="nav-arrow">‹</span>
                            </button>
                            <button
                              className="image-nav image-nav-next"
                              onClick={e => {
                                e.stopPropagation();
                                navigateImages('next');
                              }}
                              aria-label="Next image"
                            >
                              <span className="nav-arrow">›</span>
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="product-no-image">Image not available</div>
                    )}
                  </div>
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
                      {/* Display all relevant product data as specs */}
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
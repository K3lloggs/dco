// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../context/NavbarContext';

export default function HomePage({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories] = useState(['All', 'Bracelet', 'Brooch', 'Earring', 'Necklace', 'Pendant', 'Pin', 'Ring', 'Watch']);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  
  const navigate = useNavigate();
  
  // Get category from URL params if provided
  const { category } = useParams();
  
  // Set active category based on URL parameter
  useEffect(() => {
    if (category) {
      // Capitalize first letter to match our categories array format
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      if (categories.includes(formattedCategory)) {
        setActiveCategory(formattedCategory);
      }
    }
  }, [category, categories]);

  // Fetch products based on active category
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let allProducts = [];
        
        // If "All" is selected, fetch from all collections
        if (activeCategory === 'All') {
          const collectionsToFetch = categories.filter(cat => cat !== 'All');
          
          for (const collectionName of collectionsToFetch) {
            try {
              const querySnapshot = await getDocs(collection(db, collectionName));
              const productsFromCollection = querySnapshot.docs.map(doc => ({
                id: doc.id,
                category: collectionName,
                ...doc.data()
              }));
              allProducts = [...allProducts, ...productsFromCollection];
            } catch (err) {
              console.error(`Error fetching from ${collectionName}:`, err);
            }
          }
        } else {
          // Fetch from the selected category only
          const querySnapshot = await getDocs(collection(db, activeCategory));
          allProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            category: activeCategory,
            ...doc.data()
          }));
        }
        
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, categories]);

  // Function to handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Stay on the same page, don't navigate
    window.scrollTo(0, 0);
  };

  // Function to open product detail view
  const openProductDetail = async (product) => {
    setSelectedProduct(product);
    setProductDetailOpen(true);
    // Add a class to the body to prevent scrolling
    document.body.classList.add('modal-open');
  };

  // Function to close product detail view
  const closeProductDetail = () => {
    setProductDetailOpen(false);
    document.body.classList.remove('modal-open');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Component */}
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-20 md:pt-24">
        <div className="container mx-auto px-4">
          {/* Collection Title */}
          <div className="text-left">
            <h1 className="collection-title">Collection</h1>
          </div>
          
          {/* Category Filters */}
          <div className="category-filters overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="mb-16">
            {loading ? (
              <div className="product-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="product-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text-short"></div>
                    <div className="skeleton-text-long"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="empty-message">No products available in this category</p>
                  </div>
                ) : (
                  <div className="product-grid">
                    {products.map(product => (
                      <div 
                        key={product.id} 
                        className="product-item"
                        onClick={() => openProductDetail(product)}
                      >
                        {/* Product Image */}
                        <div className="product-image-container">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.cut || product.category}
                              className="product-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="product-no-image">
                              <span>Image not available</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="product-info">
                          <h3 className="product-title">
                            {product.title || product.cut || product.name || product.id}
                          </h3>
                          <p className="product-price">
                            {product.wholesale ? `${Number(product.wholesale).toLocaleString()}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      {productDetailOpen && selectedProduct && (
        <div className="product-detail-overlay" onClick={closeProductDetail}>
          <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeProductDetail}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6 18L18 6M6 6L18 18" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            <div className="product-detail-content">
              <div className="product-detail-image">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img 
                    src={selectedProduct.images[0]} 
                    alt={selectedProduct.cut || selectedProduct.name || selectedProduct.id}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="product-no-image">
                    <span>Image not available</span>
                  </div>
                )}
                
                {/* Additional images carousel - if there are multiple images */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="image-thumbnails">
                    {selectedProduct.images.map((image, index) => (
                      <img 
                        key={index}
                        src={image}
                        alt={`${selectedProduct.cut || selectedProduct.name || selectedProduct.id} view ${index + 1}`}
                        className="thumbnail"
                        onClick={() => {
                          // Clone the product and change the first image to this one
                          const updatedProduct = {...selectedProduct};
                          // Swap images
                          [updatedProduct.images[0], updatedProduct.images[index]] = 
                            [updatedProduct.images[index], updatedProduct.images[0]];
                          setSelectedProduct(updatedProduct);
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="product-detail-info">
                <div className="product-detail-header">
                  <h2 className="product-detail-title">
                    {selectedProduct.title || selectedProduct.cut || selectedProduct.name || selectedProduct.id}
                  </h2>
                  <p className="product-detail-category">{selectedProduct.category}</p>
                  {selectedProduct.wholesale && (
                    <p className="product-detail-price">${Number(selectedProduct.wholesale).toLocaleString()}</p>
                  )}
                </div>
                
                <div className="product-detail-description">
                  <p>{selectedProduct.description || 'No description available.'}</p>
                </div>
                
                {/* Product details/specifications */}
                <div className="product-specifications">
                  <h3>Specifications</h3>
                  <ul>
                    {selectedProduct.metal && (
                      <li><span>Metal:</span> {selectedProduct.metal}</li>
                    )}
                    {selectedProduct.stone && (
                      <li><span>Stone:</span> {selectedProduct.stone}</li>
                    )}
                    {selectedProduct.total_weight && (
                      <li><span>Weight:</span> {selectedProduct.total_weight}g</li>
                    )}
                    {selectedProduct.sku && (
                      <li><span>SKU:</span> {selectedProduct.sku}</li>
                    )}
                  </ul>
                </div>
                
                {/* Contact button */}
                <div className="product-detail-actions">
                  <a 
                    href={`mailto:HELLO@DAVID&CO.COM?subject=Inquiry about ${selectedProduct.cut || selectedProduct.name || selectedProduct.id}&body=I'm interested in the ${selectedProduct.category}: ${selectedProduct.cut || selectedProduct.name || selectedProduct.id}.`} 
                    className="contact-button"
                  >
                    Inquire About This Piece
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer>
        <div className="container mx-auto px-4">
          <div className="footer-content">
            <div className="copyright">
              © {new Date().getFullYear()} David & Co
            </div>
            <div className="footer-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
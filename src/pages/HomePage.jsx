// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function HomePage({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories] = useState(['All', 'Bracelet', 'Brooch', 'Earring', 'Necklace', 'Pendant', 'Pin', 'Ring', 'Watch']);

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
        console.log('Fetched products:', allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, categories]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">DCO</h1>
          <button 
            onClick={onLogout}
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 focus:outline-none"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            {activeCategory === 'All' ? 'All Products' : activeCategory}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-white p-4 rounded-lg">
                  <div className="bg-gray-200 h-40 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.cut || product.id}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                        <h3 className="text-lg font-medium text-gray-900">{product.cut || product.id}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2 h-10" title={product.description}>
                          {product.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Display names (plural) for UI
const DISPLAY_CATEGORIES = [
  'All', 'Bracelets', 'Brooches', 'Earrings',
  'Necklaces', 'Pendants', 'Rings', 'Watches', 'Art', 'Stones'
];

// Mapping between display names and collection names
const CATEGORY_MAPPING = {
  'All': 'All',
  'Bracelets': 'Bracelet',
  'Brooches': 'Brooch',
  'Earrings': 'Earring',
  'Necklaces': 'Necklace',
  'Pendants': 'Pendant',
  'Rings': 'Ring',
  'Watches': 'Watch',
  'Art': 'Art',
  'Stones': 'Gem'  // Updated to point to Gem collection
};

// Reverse mapping (singular to plural) for URL path handling
const REVERSE_MAPPING = Object.entries(CATEGORY_MAPPING).reduce((acc, [display, collection]) => {
  acc[collection.toLowerCase()] = display;
  return acc;
}, {});

const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Determine active category from URL path
  const activeCategory = (() => {
    const path = location.pathname.slice(1); // Remove leading slash
    if (!path) return 'All'; // Home path

    // Convert path to display category
    const pathLower = path.toLowerCase();
    return REVERSE_MAPPING[pathLower] || 'All';
  })();

  const handleCategoryChange = (displayCat) => {
    if (displayCat === 'All') {
      navigate('/');
    } else {
      // Use the singular form for the URL
      const collectionName = CATEGORY_MAPPING[displayCat].toLowerCase();
      navigate(`/${collectionName}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <header className="main-header">
      <div className="container navbar">
        <div className="navbar-left">
          <Link to="/" className="brand-logo">David & Co</Link>
        </div>

        <nav className="category-nav">
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              style={activeCategory === cat ? { borderBottom: '2px solid #d4af37' } : {}}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            )}
            <button type="submit" className="search-submit-btn" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
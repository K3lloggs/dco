import { Link, useNavigate, useLocation } from 'react-router-dom';

// Display names (plural) for UI
const DISPLAY_CATEGORIES = [
  'All', 'Bracelets', 'Brooches', 'Earrings',
  'Necklaces', 'Pendants', 'Rings', 'Watches', 'Art'
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
  'Art': 'Art'
};

// Reverse mapping (singular to plural) for URL path handling
const REVERSE_MAPPING = Object.entries(CATEGORY_MAPPING).reduce((acc, [display, collection]) => {
  acc[collection.toLowerCase()] = display;
  return acc;
}, {});

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <header className="main-header">
      <div className="container navbar">
        <Link to="/" className="brand-logo">David & Co</Link>

        <nav className="category-nav">
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
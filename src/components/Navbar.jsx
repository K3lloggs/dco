import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Display labels shown in the UI
const DISPLAY_CATEGORIES = [
  'All', 'Bracelets', 'Brooches', 'Earrings',
  'Necklaces', 'Pendants', 'Rings', 'Watches', 'Art'
];

// Map UI labels → collection names
const CATEGORY_MAPPING = {
  All: 'All',
  Bracelets: 'Bracelet',
  Brooches: 'Brooch',
  Earrings: 'Earring',
  Necklaces: 'Necklace',
  Pendants: 'Pendant',
  Rings: 'Ring',
  Watches: 'Watch',
  Art: 'Art',
};

// Reverse mapping (singular → plural) for URL handling
const REVERSE_MAPPING = Object.entries(CATEGORY_MAPPING).reduce(
  (acc, [display, collection]) => {
    acc[collection.toLowerCase()] = display;
    return acc;
  },
  {},
);

export default function Navbar({ onSearch }) {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [query, setQuery] = useState('');

  /* ── Derive the active category from URL ─────────────────── */
  const activeCategory = (() => {
    const slug = location.pathname.slice(1).toLowerCase();
    return slug ? REVERSE_MAPPING[slug] || 'All' : 'All';
  })();

  /* ── Handlers ─────────────────────────────────────────────── */
  const selectCategory = (display) => {
    if (display === 'All') return navigate('/');
    navigate(`/${CATEGORY_MAPPING[display].toLowerCase()}`);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const clearSearch = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <header className="main-header">
      {/* Top contact strip */}
      <div className="top-contact">
        <a href="mailto:info@davidandco.com">info@davidandco.com</a>
        <span className="divider">•</span>
        <a href="tel:+16175551234">(617) 555-1234</a>
      </div>

      {/* Primary nav */}
      <div className="container navbar">
        <Link to="/" className="brand-logo">David & Co</Link>

        <nav className="category-nav">
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`category-btn${activeCategory === cat ? ' active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <button type="submit" className="search-submit-btn" aria-label="Search">
            🔍
          </button>
        </form>
      </div>
    </header>
  );
}

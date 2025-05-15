import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/* ── Category definitions ───────────────────────────────────── */
const DISPLAY_CATEGORIES = [
  'All', 'Bracelets', 'Brooches', 'Earrings',
  'Necklaces', 'Pendants', 'Rings', 'Watches', 'Art'
];
const CATEGORY_MAPPING = {
  All: 'All',
  Bracelets: 'Bracelet',
  Brooches: 'Brooch',
  Earrings: 'Earring',
  Necklaces: 'Necklace',
  Pendants: 'Pendant',
  Rings: 'Ring',
  Watches: 'Watch',
  Art: 'Art'
};
const REVERSE_MAPPING = Object.entries(CATEGORY_MAPPING).reduce((acc, [d, c]) => {
  acc[c.toLowerCase()] = d;
  return acc;
}, {});

/* ───────────────────────────────────────────────────────────── */
export default function Navbar({ onSearch }) {
  const navigate          = useNavigate();
  const location          = useLocation();
  const [query, setQuery] = useState('');

  /* active tab from URL */
  const activeCategory = (() => {
    const slug = location.pathname.slice(1).toLowerCase();
    return slug ? REVERSE_MAPPING[slug] || 'All' : 'All';
  })();

  /* handlers */
  const selectCategory = (display) =>
    display === 'All'
      ? navigate('/')
      : navigate(`/${CATEGORY_MAPPING[display].toLowerCase()}`);

  const submitSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const clearSearch = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  /* ── render ───────────────────────────────────────────────── */
  return (
    <header className="main-header">
      {/* contact strip */}
      <div className="top-contact">
        <a href="mailto:info@davidandco.com">info@davidandco.com</a>
        <span className="divider">•</span>
        <a href="tel:+16175551234">(617) 555-1234</a>
      </div>

      {/* nav */}
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
            placeholder="Search …"
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

          {/* magnifying-glass icon (SVG) */}
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}

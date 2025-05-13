// src/pages/HomePage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo
} from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './HomePage.css';

// ——— Constants ——————————————————————————————————————
const COLLECTION_NAMES = ['Bracelet','Brooch','Earring','Necklace','Pendant','Pin','Ring','Watch','Art'];
const PATH_TO_COLLECTION = { /* same mapping as before */ };

// Fisher–Yates shuffle
function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ——— Product Card ————————————————————————————————————
const ProductItem = memo(function ProductItem({ prod, onClick, formatPrice }) {
  return (
    <button
      className="product-item"
      onClick={() => onClick(prod)}
      aria-label={`View ${prod.title || prod.id}`}
    >
      <div className="product-image-container">
        {prod.images?.[0] ? (
          <img
            src={prod.images[0]}
            alt=""
            loading="lazy"
            className="product-image"
            onError={e => (e.currentTarget.src = '/placeholder.png')}
          />
        ) : (
          <div className="product-no-image">No Image</div>
        )}
      </div>
      <div className="product-info">
        <p className="product-title">{prod.title || prod.cut || prod.id}</p>
        <p className="product-price">{formatPrice(prod.wholesale)}</p>
      </div>
    </button>
  );
});

// ——— Home Page —————————————————————————————————————
export default function HomePage({ onLogout }) {
  const cacheAll = useRef(null);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);
  const { category } = useParams();

  // Map URL → collection
  useEffect(() => {
    const key = category?.toLowerCase() || '';
    setActive(PATH_TO_COLLECTION[key] || 'All');
  }, [category]);

  // Fetch & cache
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    if (active === 'All' && cacheAll.current) {
      setProducts(cacheAll.current);
      setLoading(false);
      return;
    }
    try {
      const cols = active === 'All' ? COLLECTION_NAMES : [active

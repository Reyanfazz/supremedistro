import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CartContext from '../components/context/CartContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

const Home = () => {
  const [isFaded, setIsFaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCat, setActiveCat] = useState('');
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFaded(true), 5000);
    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, dealsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/products?featured=true`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/products?dealOfDay=true`),
        ]);

        const dealsWithFlag = dealsRes.data.map((p) => ({ ...p, _isDeal: true }));
        const featuredWithFlag = featuredRes.data.map((p) => ({ ...p, _isDeal: false }));

        const combinedMap = new Map();
        featuredWithFlag.forEach((p) => combinedMap.set(p._id, p));
        dealsWithFlag.forEach((p) => combinedMap.set(p._id, p));

        const combinedProducts = Array.from(combinedMap.values());
        setProducts(combinedProducts);
        setFiltered(combinedProducts);
      } catch (err) {
        console.error('Failed to fetch products or deals', err);
      }
    };
    fetchData();
  }, []);

  const filterByCategory = (cat) => {
    if (activeCat === cat) {
      setFiltered(products);
      setActiveCat('');
    } else {
      setFiltered(products.filter((p) => p.category === cat));
      setActiveCat(cat);
    }
  };

  const formatTimeDiff = (diff) => {
    if (diff <= 0) return '00:00:00';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const ProductCard = ({ p }) => {
    let timeLeft = null;
    if (p._isDeal && p.expiryDate) {
      const expiry = new Date(p.expiryDate);
      const diff = expiry - now;
      timeLeft = formatTimeDiff(diff);
    }

    return (
      <div
        className="border p-4 rounded shadow hover:shadow-lg transition duration-300 relative min-w-[250px] cursor-pointer flex flex-col justify-between h-full"
        onClick={() => navigate(`/productdetails/${p._id}`)}
      >
        <div>
          {!p._isDeal && p.isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded font-semibold">
              Featured
            </span>
          )}
          {p._isDeal && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
              Deal of the Day
            </span>
          )}

          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${p.image}`}
            alt={p.name}
            className="w-full h-40 object-cover mb-3 rounded"
          />
          <h3 className="font-semibold text-lg line-clamp-1">{p.name}</h3>
          <p className="text-sm text-gray-600 h-[3rem] overflow-hidden line-clamp-2">
            {p.description?.slice(0, 100)}
          </p>

          {p._isDeal && timeLeft && (
            <p className="text-xs text-red-600 font-semibold mt-1">
              Ends in: <span>{timeLeft}</span>
            </p>
          )}
        </div>

        {user ? (
          <div className="mt-3 space-y-2">
            <div className="text-green-600 font-bold">₹{p.dailyPrice}</div>
            {p.offSalePrice && (
              <div className="text-sm text-red-500 line-through">₹{p.offSalePrice}</div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(p);
              }}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        ) : (
          <p className="text-xs mt-3 text-gray-500 italic">Login to see prices & buy</p>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="bg-gray-100 p-3 pt-20 text-center text-sm">
        <p>
          Same day dispatch if ordered before 2pm | Free delivery on orders over £50 | Contact us: 01234
          567890
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Featured & Deals</h2>

          <div className="mb-6 flex flex-wrap gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => filterByCategory(cat)}
                className={`px-4 py-1 rounded-full border ${
                  activeCat === cat ? 'bg-green-600 text-white' : 'text-gray-700 bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
            {activeCat && (
              <button
                onClick={() => filterByCategory(activeCat)}
                className="px-4 py-1 rounded-full border text-gray-700 bg-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/shop')}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Load More Products
            </button>
          </div>
        </section>
      </main>

      <a
        href="https://wa.me/441234567890"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg z-50 transition-opacity duration-1000 ${
          isFaded ? 'opacity-20 hover:opacity-80' : 'opacity-100'
        }`}
        aria-label="Chat with us on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-5 h-5"
        >
          <path d="M20.52 3.48A11.931 11.931 0 0012 0C5.372 0 0 5.373 0 12c0 2.11.55 4.1 1.5 5.84L0 24l6.39-1.47A11.959 11.959 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zm-8.06 17.56a9.05 9.05 0 01-4.61-1.32l-.33-.2-3.01.7.74-2.93-.22-.31a9.05 9.05 0 114.61 4.06zm5.74-6.66c-.31-.16-1.85-.91-2.14-1.01-.29-.1-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.24-.67.08-.31-.16-1.3-.48-2.48-1.53-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.15-.18.2-.3.31-.5.1-.2.05-.37-.03-.54-.08-.16-.71-1.7-.98-2.34-.26-.61-.53-.52-.71-.53l-.61-.01c-.2 0-.53.07-.81.37-.27.31-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.14.21 2.1 3.2 5.1 4.49.71.31 1.27.5 1.7.64.71.22 1.36.19 1.87.12.57-.08 1.85-.75 2.11-1.48.26-.72.26-1.34.18-1.48-.07-.12-.27-.2-.58-.37z" />
        </svg>
      </a>
    </>
  );
};

export default Home;

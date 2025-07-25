import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CartContext from '../components/context/CartContext';
import { FaCartPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

const Shop = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [brandsList, setBrandsList] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [now, setNow] = useState(new Date());

  const loaderRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        const products = res.data.map((p) => ({
          ...p,
          _isDeal: p.isDealOfDay === true,
        }));
        setAllProducts(products);
        const uniqueBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
        setBrandsList(uniqueBrands);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0)
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    if (selectedBrands.length > 0)
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    if (minRating > 0) filtered = filtered.filter((p) => p.rating >= minRating);
    filtered = filtered.filter((p) => p.dailyPrice >= minPrice && p.dailyPrice <= maxPrice);

    if (sortOption === 'priceLow') filtered.sort((a, b) => a.dailyPrice - b.dailyPrice);
    else if (sortOption === 'priceHigh') filtered.sort((a, b) => b.dailyPrice - a.dailyPrice);
    else if (sortOption === 'nameAsc') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOption === 'nameDesc') filtered.sort((a, b) => b.name.localeCompare(a.name));

    setFilteredProducts(filtered);
    setVisibleProducts(filtered.slice(0, itemsPerPage));
  }, [
    allProducts,
    searchQuery,
    sortOption,
    itemsPerPage,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleProducts.length < filteredProducts.length) {
          setVisibleProducts((prev) => [
            ...prev,
            ...filteredProducts.slice(prev.length, prev.length + itemsPerPage),
          ]);
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = loaderRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => currentRef && observer.unobserve(currentRef);
  }, [filteredProducts, visibleProducts.length, itemsPerPage]);

  const toggleSelection = (value, listSetter, currentList) => {
    if (currentList.includes(value)) {
      listSetter(currentList.filter((v) => v !== value));
    } else {
      listSetter([...currentList, value]);
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
    const expiry = p.expiryDate ? new Date(p.expiryDate) : null;
    const timeLeft = p._isDeal && expiry ? formatTimeDiff(expiry - now) : null;
    const discount =
      p.offSalePrice && p.dailyPrice
        ? Math.round(((p.dailyPrice - p.offSalePrice) / p.dailyPrice) * 100)
        : null;

    return (
      <Link
        to={`/product/${p._id}`}
        className="block bg-white border rounded-lg shadow-md hover:shadow-xl transition relative overflow-hidden group"
        title={p.name}
      >
        {p._isDeal && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-semibold z-10">
            Deal of the Day
          </span>
        )}
        {!p._isDeal && p.isFeatured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded font-semibold z-10">
            Featured
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded font-semibold z-10">
            -{discount}%
          </span>
        )}

        <img
          src={`${import.meta.env.VITE_API_URL}/uploads/${p.image}`}
          alt={p.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-base line-clamp-1">{p.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
          {p.brand && <p className="text-xs text-gray-600 mt-1">Brand: {p.brand}</p>}
          {p._isDeal && timeLeft && (
            <p className="text-xs text-red-600 font-medium mt-1">Ends in: {timeLeft}</p>
          )}

          {user ? (
            <div className="flex items-center justify-between mt-2">
              <div>
                {p.offSalePrice ? (
                  <>
                    <div className="text-green-700 font-bold text-lg">₹{p.offSalePrice}</div>
                    <div className="text-xs line-through text-gray-400">₹{p.dailyPrice}</div>
                  </>
                ) : (
                  <div className="text-green-700 font-bold text-lg">₹{p.dailyPrice}</div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(p);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaCartPlus size={18} />
              </button>
            </div>
          ) : (
            <p className="text-xs mt-2 text-gray-500 italic">Login to see prices & buy</p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold mb-4">🛍️ Explore All Products</h1>

      {/* Filters */}
      <div className="sticky top-20 bg-white z-20 p-4 border rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleSelection(cat, setSelectedCategories, selectedCategories)}
                />
                {cat}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {brandsList.map((b) => (
              <label key={b} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => toggleSelection(b, setSelectedBrands, selectedBrands)}
                />
                {b}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value={0}>All Ratings</option>
            <option value={4}>4★ & above</option>
            <option value={3}>3★ & above</option>
            <option value={2}>2★ & above</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value="">Sort by</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="nameAsc">Name: A-Z</option>
            <option value="nameDesc">Name: Z-A</option>
          </select>

          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value={12}>Show 12</option>
            <option value={24}>Show 24</option>
            <option value={48}>Show 48</option>
          </select>
        </div>
      </div>

      {/* Price Filter */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm">Min ₹</label>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={minPrice}
          onChange={(e) => setMinPrice(Number(e.target.value))}
        />
        <span className="text-sm">{minPrice}</span>

        <label className="text-sm ml-4">Max ₹</label>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
        <span className="text-sm">{maxPrice}</span>
      </div>

      {/* Product List */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleProducts.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      ) : (
        <p>No products found</p>
      )}

      <div ref={loaderRef} className="h-10 mt-10 flex justify-center items-center">
        {visibleProducts.length < filteredProducts.length && <span>Loading more...</span>}
      </div>
    </main>
  );
};

export default Shop;

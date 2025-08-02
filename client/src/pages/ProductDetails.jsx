import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import CartContext from '../components/context/CartContext';
import { toast } from 'react-toastify';
import '../index.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [brandRelated, setBrandRelated] = useState([]);
  const [categoryRelated, setCategoryRelated] = useState([]);
  const [now, setNow] = useState(new Date());

  const apiUrl = import.meta.env.VITE_API_URL;
  const isLoggedIn = !!localStorage.getItem('user');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeDiff = (expiry) => {
    const diff = new Date(expiry) - now;
    if (diff <= 0) return '00:00:00';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const carouselImages = product
    ? [product.image, ...(product.images || [])].filter(Boolean)
    : [];

  const prevImage = () => {
    setCurrentImageIndex((idx) => (idx === 0 ? carouselImages.length - 1 : idx - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((idx) => (idx === carouselImages.length - 1 ? 0 : idx + 1));
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/api/products/${id}`);
        setProduct(res.data);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [apiUrl, id]);

  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/products`);
        const all = res.data;

        setBrandRelated(
          all.filter((p) => p._id !== product._id && p.brand === product.brand).slice(0, 4)
        );
        setCategoryRelated(
          all.filter((p) => p._id !== product._id && p.category === product.category).slice(0, 4)
        );
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    };

    fetchRelated();
  }, [product, apiUrl]);

  if (loading) return <p className="text-center mt-10 text-lg">Loading product...</p>;
  if (!product) return <p className="text-center mt-10 text-lg text-red-500">Product not found</p>;

  const {
    name,
    description,
    category,
    brand,
    brandDescription,
    dailyPrice,
    offSalePrice,
    stock,
    brandLogo,
    isFeatured,
    isDealOfDay,
    expiryDate,
  } = product;

  const discount = offSalePrice
    ? Math.round(((dailyPrice - offSalePrice) / dailyPrice) * 100)
    : null;

  const handleAddToCart = () => {
  if (!isLoggedIn) {
    navigate('/login');
 toast.warn('Please login to add items to cart.', {
      position: 'top-right',
      autoClose: 3000,
      theme: 'colored',
    });  } else {
    addToCart(product);
toast.success('Added to cart!', {
      position: 'top-right',
      autoClose: 2000,
      theme: 'colored',
    });  }
};


  const renderBadge = (p) => {
    if (p.isDealOfDay) {
      return (
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded z-10">
          Deal of the Day
        </span>
      );
    } else if (p.isFeatured) {
      return (
        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded z-10">
          Featured
        </span>
      );
    }
    return null;
  };

  const renderRelatedCard = (p) => {
    const isDeal = p.isDealOfDay && p.expiryDate;
    const dealEnds = isDeal ? formatTimeDiff(p.expiryDate) : null;
    const dealDiscount =
      p.offSalePrice && p.dailyPrice
        ? Math.round(((p.dailyPrice - p.offSalePrice) / p.dailyPrice) * 100)
        : null;

    return (
      <div
        key={p._id}
        onClick={() => navigate(`/productdetails/${p._id}`)}
        className="relative border rounded-lg shadow hover:shadow-lg transition p-3 cursor-pointer"
      >
        {renderBadge(p)}
        {dealDiscount && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded z-10">
            -{dealDiscount}%
          </span>
        )}
        <img
          src={`${apiUrl}/uploads/${p.image}`}
          alt={p.name}
          className="w-full h-40 object-cover rounded-md"
        />
        <h3 className="mt-2 font-medium text-sm line-clamp-2">{p.name}</h3>
        {isLoggedIn && (
          <p className="text-green-700 font-bold text-sm">
            ₹{p.offSalePrice || p.dailyPrice}
          </p>
        )}
        {isDeal && (
          <p className="text-xs text-red-600 font-medium mt-1">
            Ends in: {dealEnds}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto mt-11 p-4 sm:p-6">
      {/* PRODUCT DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div {...handlers} className="relative cursor-zoom-in">
          <img
            src={`${apiUrl}/uploads/${carouselImages[currentImageIndex]}`}
            alt={name}
            className="w-full h-72 sm:h-[400px] object-cover rounded-xl shadow-lg hover:scale-105 transition"
          />
          {carouselImages.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-70">‹</button>
              <button onClick={nextImage} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-70">›</button>
            </>
          )}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {carouselImages.map((img, idx) => (
              <img
                key={idx}
                src={`${apiUrl}/uploads/${img}`}
                alt={`Thumbnail ${idx + 1}`}
                className={`h-16 w-16 object-cover rounded border cursor-pointer ${idx === currentImageIndex ? 'border-blue-600 scale-105' : 'border-gray-300'}`}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">{name}</h1>

          {isDealOfDay && expiryDate && (
            <p className="text-red-600 font-semibold text-sm">Deal ends in: {formatTimeDiff(expiryDate)}</p>
          )}

<p className="text-gray-700 text-base leading-relaxed break-words">{description}</p>

          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Stock:</strong> {stock ?? 0}</p>
            <p><strong>Featured:</strong> {isFeatured ? 'Yes' : 'No'}</p>
            <p><strong>Brand:</strong> {brand}</p>
          </div>

          {brandLogo && (
            <div>
              <img src={`${apiUrl}/uploads/${brandLogo}`} alt="Brand Logo" className="h-12 object-contain" />
              {brandDescription && <p className="text-sm text-gray-500 mt-1">{brandDescription}</p>}
            </div>
          )}

          {isLoggedIn ? (
            <div>
              {offSalePrice ? (
                <>
                  <p className="text-2xl font-bold text-green-700">₹{offSalePrice}</p>
                  <p className="text-gray-400 line-through">₹{dailyPrice}</p>
                  {discount && <p className="text-sm text-green-600">Save {discount}%</p>}
                </>
              ) : (
                <p className="text-2xl font-bold text-green-700">₹{dailyPrice}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-500">Login to see price</p>
          )}

          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700"
            disabled={!isLoggedIn}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          {!isLoggedIn && (
            <p className="text-sm text-blue-500 underline cursor-pointer" onClick={() => navigate('/login')}>
              Login to see full details
            </p>
          )}
        </div>
      </div>

      {/* BRAND RELATED */}
      {brandRelated.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">You may also like (Same Brand)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {brandRelated.map(renderRelatedCard)}
          </div>
        </section>
      )}

      {/* CATEGORY RELATED */}
      {categoryRelated.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">More in {category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categoryRelated.map(renderRelatedCard)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;

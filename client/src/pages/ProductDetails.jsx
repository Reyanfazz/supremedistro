import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [brandRelated, setBrandRelated] = useState([]);
  const [categoryRelated, setCategoryRelated] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  const isLoggedIn = !!localStorage.getItem('user');

  const carouselImages = product
    ? [product.image, ...(product.images || [])].filter(Boolean)
    : [];

  const prevImage = () => {
    setCurrentImageIndex((idx) =>
      idx === 0 ? carouselImages.length - 1 : idx - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((idx) =>
      idx === carouselImages.length - 1 ? 0 : idx + 1
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setProduct(null);
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/api/products/${id}`);
        setProduct(res.data);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [apiUrl, id]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!product) return;
      try {
        const res = await axios.get(`${apiUrl}/api/products`);
        const allProducts = res.data;

        const brandFiltered = allProducts.filter(
          (p) => p._id !== product._id && p.brand === product.brand
        ).slice(0, 4);
        setBrandRelated(brandFiltered);

        const categoryFiltered = allProducts.filter(
          (p) => p._id !== product._id && p.category === product.category
        ).slice(0, 4);
        setCategoryRelated(categoryFiltered);
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    };
    fetchRelated();
  }, [apiUrl, product]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!product) return <p className="text-center mt-10">Product not found</p>;

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

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      alert('Please login to add items to cart.');
      navigate('/login');
    } else {
      alert('Add to Cart logic here');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div {...handlers} className="relative cursor-zoom-in overflow-hidden">
          <img
            src={`${apiUrl}/uploads/${carouselImages[currentImageIndex]}`}
            alt={`${name} image ${currentImageIndex + 1}`}
            className="w-full h-64 sm:h-[400px] object-cover rounded shadow transform transition-transform duration-300 ease-in-out hover:scale-110"
          />
          {carouselImages.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition">‹</button>
              <button onClick={nextImage} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition">›</button>
            </>
          )}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {carouselImages.map((img, idx) => (
              <img
                key={idx}
                src={`${apiUrl}/uploads/${img}`}
                alt={`Thumbnail ${idx + 1}`}
                className={`h-16 w-16 object-cover rounded border cursor-pointer transition ${idx === currentImageIndex ? 'border-blue-600 scale-110' : 'border-transparent'}`}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 break-words">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{name}</h1>

          {isDealOfDay && expiryDate && (
            <p className="text-red-600 font-semibold text-sm">Deal ends on: {formatDate(expiryDate)}</p>
          )}

          <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">{description}</p>

          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="font-semibold">Category:</span> {category}</p>
            <p><span className="font-semibold">Stock:</span> {stock ?? 0}</p>
            <p><span className="font-semibold">Featured:</span> {isFeatured ? 'Yes' : 'No'}</p>
            <p><span className="font-semibold">Brand:</span> {brand}</p>
          </div>

          {brandLogo && (
            <div className="mt-2">
              <img src={`${apiUrl}/uploads/${brandLogo}`} alt="Brand Logo" className="h-12 sm:h-16 object-contain" />
              {brandDescription && <p className="text-sm text-gray-500 mt-1">{brandDescription}</p>}
            </div>
          )}

          {isLoggedIn ? (
            <div className="mt-4">
              {offSalePrice ? (
                <>
                  <div className="text-green-700 font-bold text-xl sm:text-2xl">₹{offSalePrice}</div>
                  <div className="line-through text-gray-400">₹{dailyPrice}</div>
                  {discount && <div className="text-sm text-green-600">Save {discount}%</div>}
                </>
              ) : (
                <div className="text-green-700 font-bold text-xl sm:text-2xl">₹{dailyPrice}</div>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-500 mt-2">Login to see price</p>
          )}

          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!isLoggedIn}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          {!isLoggedIn && (
            <p className="mt-2 text-blue-500 underline cursor-pointer" onClick={() => navigate('/login')}>
              Login to your account to see full details.
            </p>
          )}
        </div>
      </div>

      {brandRelated.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">You may also like (Same Brand)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {brandRelated.map((rp) => (
              <div
                key={rp._id}
                className="block border rounded shadow hover:shadow-lg transition p-3 cursor-pointer"
                onClick={() => navigate(`/productdetails/${rp._id}`)}
              >
                <img src={`${apiUrl}/uploads/${rp.image}`} alt={rp.name} className="w-full h-36 sm:h-40 object-cover rounded" />
                <h3 className="mt-2 font-semibold text-sm line-clamp-2">{rp.name}</h3>
                {isLoggedIn && <p className="text-green-700 font-bold">₹{rp.offSalePrice || rp.dailyPrice}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {categoryRelated.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">More in {category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {categoryRelated.map((rp) => (
              <div
                key={rp._id}
                className="block border rounded shadow hover:shadow-lg transition p-3 cursor-pointer"
                onClick={() => navigate(`/productdetails/${rp._id}`)}
              >
                <img src={`${apiUrl}/uploads/${rp.image}`} alt={rp.name} className="w-full h-36 sm:h-40 object-cover rounded" />
                <h3 className="mt-2 font-semibold text-sm line-clamp-2">{rp.name}</h3>
                {isLoggedIn && <p className="text-green-700 font-bold">₹{rp.offSalePrice || rp.dailyPrice}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;

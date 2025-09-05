// src/pages/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CartContext from '../components/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BANNER_IMAGES = ['banner1.jpg', 'banner2.jpg', 'banner3.jpg'];
const PROMO_IMAGE = 'promo-banner.jpg';

// ✅ Custom Arrow Components
const NextArrow = ({ className, onClick }) => (
  <div
    className={`${className} !flex !items-center !justify-center !bg-black/60 hover:!bg-black text-white !rounded-full z-10`}
    style={{ width: '35px', height: '35px', right: '10px' }}
    onClick={onClick}
  />
);

const PrevArrow = ({ className, onClick }) => (
  <div
    className={`${className} !flex !items-center !justify-center !bg-black/60 hover:!bg-black text-white !rounded-full z-10`}
    style={{ width: '35px', height: '35px', left: '10px' }}
    onClick={onClick}
  />
);

const ProductSlider = ({ title, products, isDeal = false, now, addToCart, user, navigate }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2.5 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1.2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
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

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      {products.length > 0 ? (
        <Slider {...settings} key={products.length}>
          {products.map((p) => {
            let timeLeft = null;
            if (isDeal && p.expiryDate) {
              const expiry = new Date(p.expiryDate);
              timeLeft = formatTimeDiff(expiry - now);
            }

            return (
              <div key={p._id} className="p-2">
                <div
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 relative cursor-pointer flex flex-col justify-between border"
                  onClick={() => navigate(`/productdetails/${p._id}`)}
                >
                  <div>
                    {isDeal && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-semibold z-10">
                        Deal of the Day
                      </span>
                    )}
                    {!isDeal && p.isFeatured && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded font-semibold z-10">
                        Featured
                      </span>
                    )}
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${p.image}`}
                      alt={p.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="px-4 py-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {p.description?.slice(0, 100)}
                      </p>
                      {isDeal && timeLeft && (
                        <p className="text-xs text-red-600 font-medium mt-1">Ends in: {timeLeft}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 pb-4">
                    {user ? (
                      <>
                        <div>
                          <div className="text-black font-bold text-base">£{p.offSalePrice || p.dailyPrice}</div>
                          {p.offSalePrice && (
                            <div className="text-sm text-red-500 line-through">£{p.dailyPrice}</div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                        >
                          <FiShoppingCart />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/login');
                        }}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Login to view price
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      ) : (
        <p className="text-gray-600">No products available</p>
      )}
    </section>
  );
};

const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isFaded, setIsFaded] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFaded(true), 5000);
    return () => clearTimeout(fadeTimer);
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
        setFeaturedProducts(products.filter((p) => p.isFeatured));
        setDealProducts(products.filter((p) => p._isDeal));

        // Extract unique brands with logo
        const uniqueBrandsMap = {};
        products.forEach((p) => {
          if (p.brand && p.brandLogo && !uniqueBrandsMap[p.brand]) {
            uniqueBrandsMap[p.brand] = p.brandLogo;
          }
        });
        const uniqueBrandsArr = Object.entries(uniqueBrandsMap).map(([name, logo]) => ({
          name,
          logo,
        }));
        setBrands(uniqueBrandsArr);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <header className="bg-gray-100 p-3 pt-20 text-center text-sm text-gray-700">
        <p>Same day dispatch before 2pm | Free delivery over £50 | Call: 01234 567890</p>
      </header>

      {/* Banner */}
      <section className="mt-4 mb-6">
        <Slider
          dots
          infinite
          speed={500}
          autoplay
          autoplaySpeed={4000}
          slidesToShow={1}
          slidesToScroll={1}
          arrows={false}
          pauseOnHover
        >
          {BANNER_IMAGES.map((img, idx) => (
            <div key={idx}>
              <img
                src={`banners/${img}`}
                alt={`Banner ${idx + 1}`}
                className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover rounded-xl"
              />
            </div>
          ))}
        </Slider>
      </section>

      {/* Promo Image */}
      <section className="mb-14">
        <img src={`/banners/${PROMO_IMAGE}`} alt="Promo" className="w-full rounded-xl shadow-md" />
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white">
        <ProductSlider
          title="Featured Products"
          products={featuredProducts}
          now={now}
          addToCart={addToCart}
          user={user}
          navigate={navigate}
        />

        <ProductSlider
          title="Deal of the Day"
          products={dealProducts}
          now={now}
          addToCart={addToCart}
          user={user}
          navigate={navigate}
          isDeal
        />

        {/* Brands Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Brands We Work With</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {brands.length > 0 ? (
              brands.map((brand) => (
                <div
                  key={brand.name}
                  onClick={() =>
                    navigate(`/brand/${encodeURIComponent(brand.name)}`, { state: { brand } })
                  }
                  className="bg-gray-100 p-6 rounded-lg text-center font-semibold flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${brand.logo}`}
                    alt={brand.name}
                    className="h-16 object-contain"
                  />
                  <span className="text-gray-800">{brand.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No brands available</p>
            )}
          </div>
        </section>
      </main>
      {/* Blog Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">From Our Blog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Top 10 Fashion Trends in 2025',
                desc: 'Explore the hottest fashion styles you can’t miss this year.',
              },
              {
                title: 'How to Choose Electronics Online',
                desc: 'Tips on comparing products, checking reviews, and finding deals.',
              },
              {
                title: 'Make Your Home Stylish and Cozy',
                desc: 'Ideas to transform your space without breaking the bank.',
              },
            ].map((blog, idx) => (
              <div
                key={idx}
                className="bg-white border p-5 rounded-xl shadow hover:shadow-md"
              >
                <h4 className="text-lg font-bold text-gray-900 mb-2">{blog.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{blog.desc}</p>
                <button className="mt-2 text-red-600 hover:underline text-sm">Read More</button>
              </div>
            ))}
          </div>
        </section>


      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800 py-10 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="text-lg font-bold mb-2 text-red-600">SupremeDistro</h4>
            <p className="text-gray-600">
              Elevating your everyday shopping experience with premium deals and curated collections.
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-2 text-red-600">Quick Links</h5>
            <ul className="space-y-1 text-gray-700">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/shop" className="hover:underline">Shop</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2 text-red-600">Support</h5>
            <ul className="space-y-1 text-gray-700">
              <li>FAQ</li>
              <li>Shipping & Returns</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2 text-red-600">Contact Us</h5>
            <p className="text-gray-700">Email: support@supremedistro.com</p>
            <p className="text-gray-700">Phone: +44 1234 567890</p>
          </div>
        </div>
        <div className="text-center mt-6 text-xs text-gray-500">
          © 2025 SupremeDistro. All rights reserved.
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/441234567890"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-4 bottom-4 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg z-50 transition-opacity duration-1000 ${
          isFaded ? 'opacity-20 hover:opacity-80' : 'opacity-100'
        }`}
        aria-label="Chat with us on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20.52 3.48A11.931 11.931 0 0012 0C5.372 0 0 5.373 0 12c0 2.11.55 4.1 1.5 5.84L0 24l6.39-1.47A11.959 11.959 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zm-8.06 17.56a9.05 9.05 0 01-4.61-1.32l-.33-.2-3.01.7.74-2.93-.22-.31a9.05 9.05 0 114.61 4.06zm5.74-6.66c-.31-.16-1.85-.91-2.14-1.01-.29-.1-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.36.24-.67.08-.31-.16-1.3-.48-2.48-1.53-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.15-.18.2-.3.31-.5.1-.2.05-.37-.03-.54-.08-.16-.71-1.7-.98-2.34-.26-.61-.53-.52-.71-.53l-.61-.01c-.2 0-.53.07-.81.37-.27.31-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.14.21 2.1 3.2 5.1 4.49.71.31 1.27.5 1.7.64.71.22 1.36.19 1.87.12.57-.08 1.85-.75 2.11-1.48.26-.72.26-1.34.18-1.48-.07-.12-.27-.2-.58-.37z" />
        </svg>
      </a>
    </>
  );
};

export default Home;

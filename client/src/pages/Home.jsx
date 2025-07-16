// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';

const Home = () => {
  const [isFaded, setIsFaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFaded(true);
    }, 5000); // fade after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <header className="bg-gray-100 p-3 pt-20 text-center text-sm">
        <p>
          Same day dispatch if ordered before 2pm | Free delivery on orders over £50 | Contact us: 01234 567890
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Latest Deals / Delivery info section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Latest Deals & Delivery Info</h2>
          <p>Get your favourite products delivered fast with our reliable shipping service.</p>
        </section>

        {/* Product Gallery Placeholder */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Our Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border p-4 rounded shadow hover:shadow-lg cursor-pointer">
              <img
                src="/images/sample-product.jpg"
                alt="Sample Product"
                className="w-full h-48 object-cover mb-3"
              />
              <h3 className="font-semibold text-lg">Sample Product Name</h3>
              <p className="text-sm text-gray-600">Short product description here.</p>
            </div>
          </div>
        </section>

        {/* Brands Logos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Brands We Work With</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <img src="/images/brand1.png" alt="Brand 1" className="h-12" />
            <img src="/images/brand2.png" alt="Brand 2" className="h-12" />
            <img src="/images/brand3.png" alt="Brand 3" className="h-12" />
          </div>
        </section>

        {/* Latest Blog Previews */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Latest From Our Blog</h2>
          <div className="space-y-6">
            <article className="border-b pb-4">
              <h3 className="text-xl font-semibold cursor-pointer hover:text-red-600">
                Exciting New Product Launches This Month
              </h3>
              <p className="text-gray-700">Stay updated on the latest in vaping and accessories...</p>
            </article>
          </div>
        </section>

        {/* Shortcut links */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-6">
            <a href="/shop" className="text-red-700 hover:underline">Shop</a>
            <a href="/about" className="text-red-700 hover:underline">About Us</a>
            <a href="/contact" className="text-red-700 hover:underline">Contact</a>
            <a href="/faqs" className="text-red-700 hover:underline">FAQs</a>
            <a href="/blog" className="text-red-700 hover:underline">Blog</a>
            <a href="/legal/terms" className="text-red-700 hover:underline">Terms & Conditions</a>
          </div>
        </section>
      </main>

      {/* WhatsApp Floating Button (Smaller + Fade Effect) */}
      <a
        href="https://wa.me/441234567890" // Replace with your actual number
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg z-50 transition-opacity duration-1000 ${
          isFaded ? 'opacity-20 hover:opacity-80' : 'opacity-100'
        }`}
        aria-label="Chat with us on WhatsApp"
      >
        {/* WhatsApp Icon */}
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

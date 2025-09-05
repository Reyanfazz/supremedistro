import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiUser,
  FiShoppingCart,
  FiHome,
  FiShoppingBag,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import CartContext from "../components/context/CartContext";
import axios from "axios";

const Header = ({ onOpenSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  const dropdownRef = useRef();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const avatarUrl = user
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email || user.name}`
    : null;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        const grouped = {};
        res.data.forEach((p) => {
          if (!p.category || !p.brand) return;
          if (!grouped[p.category]) grouped[p.category] = new Set();
          grouped[p.category].add(p.brand.trim());
        });

        const formatted = Object.entries(grouped).map(([category, brands]) => ({
          category,
          brands: Array.from(brands),
        }));

        setCategories(formatted);
      } catch (err) {
        console.error("Error loading categories:", err.message);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  if (isAdminRoute) return null;

  const encodeBrand = (brand) => encodeURIComponent(`${brand} `);

  return (
    <>
      {/* ================= Desktop Header ================= */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between px-6 h-16 md:px-12">
        <button
          className="text-3xl md:hidden text-gray-700 hover:text-blue-600 transition"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

        <Link
          to={user?.role === "admin" ? "/admin/dashboard" : "/"}
          className="font-extrabold text-2xl tracking-wide text-blue-700 hover:text-blue-900"
        >
          SupremeDistro
        </Link>

        <nav className="hidden md:flex space-x-10 font-semibold items-center text-gray-700">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setShopDropdown(true)}
            onMouseLeave={() => setShopDropdown(false)}
          >
            <button className="hover:text-blue-600 transition flex items-center space-x-1">
              <FiShoppingBag />
              <span>Shop</span>
              <FiChevronDown className="text-sm" />
            </button>

            {shopDropdown && categories.length > 0 && (
              <div className="absolute left-0 w-64 bg-white border rounded shadow-lg z-50">
                {categories.map((cat) => (
                  <div key={cat.category} className="relative group">
                    <div className="px-5 py-3 text-sm font-semibold hover:bg-gray-100 flex justify-between items-center cursor-pointer">
                      <span>{cat.category}</span>
                      {cat.brands.length > 0 && <FiChevronRight className="text-xs" />}
                    </div>

                    {cat.brands.length > 0 && (
                      <div className="absolute left-full top-0 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                        {cat.brands.map((brand) => (
                          <button
                            key={`${cat.category}-${brand}`}
                            onClick={() => {
                              navigate(`/brand/${encodeBrand(brand)}`);
                              setShopDropdown(false);
                            }}
                            className="block w-full text-left px-5 py-3 text-sm hover:bg-gray-100 transition"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/about" className="hover:text-blue-600 transition">
            About Us
          </Link>
          <Link to="/blog" className="hover:text-blue-600 transition">
            Blog
          </Link>

          {/* ✅ Cart button navigates to /cart */}
          <button
            className="relative flex items-center text-gray-700 hover:text-blue-600 transition"
            onClick={() => navigate("/cart")}
            aria-label="Go to Cart"
          >
            <FiShoppingCart className="text-2xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow">
                {cartItemCount}
              </span>
            )}
          </button>
        </nav>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-3 hover:bg-gray-100 px-3 py-1 rounded transition"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-9 h-9 rounded-full border border-gray-300"
              />
              <span className="text-gray-800 font-semibold">{user.name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-lg z-50">
                <Link
                  to="/profile"
                  className="block px-5 py-3 text-sm hover:bg-gray-100 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Personal Details
                </Link>
                {user.role !== "admin" && (
                  <Link
                    to="/orders"
                    className="block px-5 py-3 text-sm hover:bg-gray-100 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Orders
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
          >
            <FiUser className="text-xl" />
            <span className="font-semibold">Login</span>
          </Link>
        )}
      </header>

      {/* ================= Mobile Bottom Nav ================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around items-center h-16 md:hidden z-40 text-gray-700 border-t border-gray-200">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition"
          aria-label="Home"
        >
          <FiHome className="text-2xl mb-1" />
          Home
        </Link>

        <div className="relative">
          <button
            className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition"
            onClick={() => setMobileShopOpen((prev) => !prev)}
            aria-label="Shop"
          >
            <FiShoppingBag className="text-2xl mb-1" />
            Shop
          </button>

          {mobileShopOpen && categories.length > 0 && (
            <div className="absolute bottom-16 left-0 w-56 bg-white border rounded shadow-lg z-50 max-h-80 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.category}>
                  <div
                    className="px-4 py-2 font-semibold text-gray-700 flex justify-between items-center hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      setOpenCategory(
                        openCategory === cat.category ? null : cat.category
                      )
                    }
                  >
                    {cat.category}
                    {cat.brands.length > 0 && <FiChevronDown className="text-xs" />}
                  </div>

                  {openCategory === cat.category &&
                    cat.brands.map((brand) => (
                      <button
                        key={`${cat.category}-${brand}`}
                        onClick={() => {
                          navigate(`/brand/${encodeBrand(brand)}`);
                          setMobileShopOpen(false);
                          setOpenCategory(null);
                        }}
                        className="block w-full text-left px-8 py-2 text-sm hover:bg-gray-100 transition"
                      >
                        {brand}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Cart button navigates to /cart */}
        <button
          className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition relative"
          onClick={() => navigate("/cart")}
          aria-label="Cart"
        >
          <FiShoppingCart className="text-2xl mb-1" />
          Cart
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow">
              {cartItemCount}
            </span>
          )}
        </button>

        <Link
          to={user ? "/profile" : "/login"}
          className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition"
          aria-label="Profile"
        >
          <FiUser className="text-2xl mb-1" />
          {user ? "Profile" : "Login"}
        </Link>
      </nav>
    </>
  );
};

export default Header;

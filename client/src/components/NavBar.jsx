import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiUser, FiShoppingCart, FiHome, FiShoppingBag, FiUserCheck } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import CartDrawer from "../components/CartDrawer";
import CartContext from "../components/context/CartContext";

const Header = ({ onOpenSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const avatarUrl = user
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email || user.name}`
    : null;

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

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {!isAdminRoute && (
        <>
          {/* Desktop Header */}
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
              <Link to="/" className="hover:text-blue-600 transition">Home</Link>
              <Link to="/shop" className="hover:text-blue-600 transition">Shop</Link>
              <Link to="/about" className="hover:text-blue-600 transition">About Us</Link>
              <Link to="/blog" className="hover:text-blue-600 transition">Blog</Link>

              {/* Cart Icon */}
              {user && (
                <button
                  className="relative flex items-center text-gray-700 hover:text-blue-600 transition"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open Cart"
                >
                  <FiShoppingCart className="text-2xl" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}
            </nav>

            {/* Profile / Login */}
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

          {/* Bottom Nav (Mobile) */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around items-center h-16 md:hidden z-40 text-gray-700 border-t border-gray-200">
            <Link
              to="/"
              className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition"
              aria-label="Home"
            >
              <FiHome className="text-2xl mb-1" />
              Home
            </Link>
            <Link
              to="/shop"
              className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition"
              aria-label="Shop"
            >
              <FiShoppingBag className="text-2xl mb-1" />
              Shop
            </Link>
            {user && (
              <button
                className="flex flex-col items-center justify-center text-xs font-medium relative hover:text-blue-600 transition"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open Cart"
              >
                <FiShoppingCart className="text-2xl mb-1" />
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
            {user ? (
              <Link
                to="/profile"
                className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition"
                aria-label="Profile"
              >
                <FiUserCheck className="text-2xl mb-1" />
                Profile
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex flex-col items-center justify-center text-xs font-medium hover:text-blue-600 transition"
                aria-label="Login"
              >
                <FiUser className="text-2xl mb-1" />
                Login
              </Link>
            )}
          </nav>

          {/* Cart Drawer */}
          <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
      )}
    </>
  );
};

export default Header;

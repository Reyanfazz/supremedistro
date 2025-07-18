import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiUser, FiShoppingCart } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const Header = ({onOpenSidebar}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between px-4 h-14">
        <button
          className="text-2xl md:hidden"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

        <Link
          to={user?.role === "admin" ? "/admin/dashboard" : "/"}
          className="font-bold text-xl tracking-wide"
        >
          SupremeDistro
        </Link>

        {/* Desktop Navigation */}
        {user?.role !== "admin" && (
          <nav className="hidden md:flex space-x-6 font-semibold items-center text-gray-700">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About Us</Link>
            <Link to="/blog">Blog</Link>

            {/* Cart icon only for logged-in non-admin users */}
            {user && (
              <Link to="/cart" className="relative flex items-center">
                <FiShoppingCart className="text-2xl" />
              </Link>
            )}
          </nav>
        )}

        {/* Profile / Login */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded"
            >
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-8 h-8 rounded-full border"
              />
              <span>{user.name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Personal Details
                </Link>
                {user.role !== "admin" && (
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Orders
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="flex items-center space-x-1">
            <FiUser />
            <span>Login</span>
          </Link>
        )}
      </header>

      {/* Bottom Nav (mobile) */}
      {user?.role !== "admin" && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around items-center h-14 md:hidden z-40 text-gray-700">
          <Link to="/" className="flex flex-col items-center text-xs">Home</Link>
          <Link to="/shop" className="flex flex-col items-center text-xs">Shop</Link>
          {user && (
            <Link to="/cart" className="flex flex-col items-center text-xs">Cart</Link>
          )}
          {user ? (
            <Link to="/profile" className="flex flex-col items-center text-xs">Profile</Link>
          ) : (
            <Link to="/login" className="flex flex-col items-center text-xs">Login</Link>
          )}
        </nav>
      )}
    </>
  );
};

export default Header;

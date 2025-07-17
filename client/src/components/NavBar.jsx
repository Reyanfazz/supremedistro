import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiShoppingBag,
  FiUser,
  FiInfo,
  FiEdit3,
  FiLogOut,
  FiUserCheck,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between px-4 h-14">
        <button
          className="text-2xl md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

        <Link to="/" className="font-bold text-xl tracking-wide">
          SupremeDistro
        </Link>

        <nav className="hidden md:flex space-x-6 font-semibold items-center text-gray-700">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <FiHome className="inline-block mr-2" />
            Home
          </Link>
          <Link to="/shop" className="flex items-center space-x-1">
            <FiShoppingBag />
            <span>Shop</span>
          </Link>
          <Link to="/about" className="flex items-center space-x-1">
            <FiInfo />
            <span>About Us</span>
          </Link>
          <Link to="/blog" className="flex items-center space-x-1">
            <FiEdit3 />
            <span>Blog</span>
          </Link>

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
        </nav>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around items-center h-14 md:hidden z-40 text-gray-700">
        <Link to="/" className="flex flex-col items-center text-xs">
          <FiHome className="text-xl" />
          Home
        </Link>
        <Link to="/shop" className="flex flex-col items-center text-xs">
          <FiShoppingBag className="text-xl" />
          Shop
        </Link>
        {user ? (
          <Link to="/profile" className="flex flex-col items-center text-xs">
            <FiUserCheck className="text-xl" />
            Profile
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center text-xs">
            <FiUser className="text-xl" />
            Login
          </Link>
        )}
      </nav>
    </>
  );
};

export default Header;

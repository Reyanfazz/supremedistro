import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiShoppingBag,
  FiUser,
  FiPhone,
  FiInfo,
  FiEdit3,
  FiLogOut,
  FiUserCheck,
} from "react-icons/fi";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get user from localStorage on mount and listen for changes
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      setUser(userData ? JSON.parse(userData) : null);
    };

    loadUser();

    // Listen to storage changes (updates from other tabs)
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const dashboardLink = user?.role === "admin" ? "/admin/dashboard" : "/";

  const avatarUrl = user
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email || user.name}`
    : null;

  return (
    <>
      {/* Main Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between px-4 h-14">
        {/* Hamburger for mobile */}
        <button
          className="text-2xl md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

        {/* Logo */}
        <Link to="/" className="font-bold text-xl tracking-wide">
          SupremeDistro
        </Link>

        {/* Desktop Nav Links */}
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
            <>
              <Link to={dashboardLink} className="flex items-center space-x-1">
                <FiUserCheck />
                <span>Dashboard</span>
              </Link>
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-8 h-8 rounded-full border"
              />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-500"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center space-x-1">
              <FiUser />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </header>

     
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="fixed top-0 left-0 w-64 h-full bg-white p-6 z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="text-2xl mb-6"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <FiX />
            </button>
            <nav className="flex flex-col space-y-4 text-lg text-gray-800">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <FiShoppingBag className="inline-block mr-2" />
                Home
              </Link>
              <Link to="/shop" onClick={() => setSidebarOpen(false)}>
                <FiShoppingBag className="inline-block mr-2" />
                Shop
              </Link>
              <Link to="/about" onClick={() => setSidebarOpen(false)}>
                <FiInfo className="inline-block mr-2" />
                About Us
              </Link>
              <Link to="/blog" onClick={() => setSidebarOpen(false)}>
                <FiEdit3 className="inline-block mr-2" />
                Blog
              </Link>
              {user ? (
                <>
                  <Link
                    to={dashboardLink}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FiUserCheck className="inline-block mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 flex items-center space-x-2"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setSidebarOpen(false)}>
                  <FiUser className="inline-block mr-2" />
                  Login
                </Link>
              )}
            </nav>
          </aside>
        </div>
      )}

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
          <Link to={dashboardLink} className="flex flex-col items-center text-xs">
            <FiUserCheck className="text-xl" />
            Dashboard
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

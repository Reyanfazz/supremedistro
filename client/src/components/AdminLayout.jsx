import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiGrid, FiBox, FiClipboard, FiFileText, FiUser, FiLogOut, FiPlusSquare, FiChevronLeft,
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const sidebarRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const avatarUrl = user ? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email || user.name}` : null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setSidebarOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowBottomNav(currentScroll < lastScroll || currentScroll < 10);
      lastScroll = currentScroll;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => (touchStartX = e.changedTouches[0].screenX);
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      if (diffX > 50 && touchStartX < 50) setSidebarOpen(true);
      else if (diffX < -50 && sidebarOpen) setSidebarOpen(false);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  const toggleSidebarCollapse = () => setSidebarCollapsed((prev) => !prev);

  const links = [
    { name: 'Dashboard', icon: FiGrid, to: '/admin/dashboard', badge: 0 },
    { name: 'Products', icon: FiBox, to: '/admin/products', badge: 0 },
    { name: 'Add', icon: FiPlusSquare, to: '/admin/addproduct', badge: 0 },
    { name: 'Orders', icon: FiClipboard, to: '/admin/orders', badge: 3 },
    { name: 'Blogs', icon: FiFileText, to: '/admin/blogs', badge: 0 },
    { name: 'Profile', icon: FiUser, to: '/profile', badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow z-50 flex justify-between items-center px-6 h-14">
        <button onClick={() => setSidebarOpen(true)} className="text-xl md:hidden">
          <FiMenu />
        </button>
        <h1 className="font-bold text-lg text-gray-800">SupremeDistro Admin</h1>
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded"
            >
              <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border" />
              <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-50">
                <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Personal Details</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-14 left-0 h-full bg-white shadow-md z-40 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${sidebarCollapsed ? 'w-20' : 'w-48'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="justify-end p-2 hidden md:flex">
            <button onClick={toggleSidebarCollapse} className="p-1 rounded hover:bg-gray-100">
              <FiChevronLeft className={`transform transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {links.map(({ name, icon: Icon, to, badge }) => {
                const IconComponent  = Icon;
              const active = location.pathname === to;
              return (
                <Link
                  key={name}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors duration-200
                    ${active ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  <div className="relative">
                    <IconComponent className="text-xl" />
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1.5 rounded-full">
                        {badge}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && <span>{name}</span>}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center space-x-3 px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-100"
            >
              <FiLogOut />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 mt-14 p-4 pb-20 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-48'}`}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white shadow border-t border-gray-200 md:hidden
          flex justify-around px-6 py-2 transition-transform duration-300
          ${showBottomNav ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {[
          { name: 'Dashboard', icon: <FiGrid />, to: '/admin/dashboard' },
          { name: 'Products', icon: <FiBox />, to: '/admin/products' },
          { name: 'Account', icon: <FiUser />, to: '/profile' },
          { name: 'Orders', icon: <FiClipboard />, to: '/admin/orders', badge: 3 },
          { name: 'Blogs', icon: <FiFileText />, to: '/admin/blogs' },
        ].map(({ name, icon, to, badge }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={name}
              to={to}
              className={`flex flex-col items-center text-sm ${active ? 'text-green-600' : 'text-gray-600'} hover:text-green-500`}
            >
              <div className="relative">
                <span className="text-xl">{icon}</span>
                {badge && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-[1px] rounded-full font-bold">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;

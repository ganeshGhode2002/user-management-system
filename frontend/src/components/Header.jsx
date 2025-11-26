// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaUsers, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/users', label: 'Users', icon: <FaUsers className="text-sm" /> },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 smooth-transition ${
      scrolled ? 'glass shadow-xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto  px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 smooth-transition">
              <FaUser />
            </div>
            <div>
              <div className="text-xl font-bold text-white drop-shadow-lg">MERN CRUD</div>
              <div className="text-sm text-white/80 font-medium">User Management</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium smooth-transition ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            
            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2 text-white border border-white/30 rounded-xl hover:bg-white/10 smooth-transition"
                >
                  <FaSignInAlt />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 smooth-transition"
                >
                  <FaUserPlus />
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 smooth-transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 smooth-transition"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden glass rounded-xl p-4 mt-2 shadow-2xl">
            <div className="flex flex-col gap-3">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium smooth-transition ${
                    location.pathname === item.path
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white border border-white/30 rounded-lg hover:bg-white/10"
                  >
                    <FaSignInAlt />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg text-center justify-center"
                  >
                    <FaUserPlus />
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 text-white/90 border-b border-white/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-lg"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
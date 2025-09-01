// components/Header.jsx (Using centralized config)
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { pageAvailability } from '../utils/pageAvailability';
import HotelFinderLogo from '/hotelFinderLogoBlackHorizontal.svg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Custom link component that checks availability
  const CustomLink = ({ to, children, className, onClick }) => {
    const handleClick = (e) => {
      if (!pageAvailability[to]) {
        e.preventDefault();
        navigate('/404');
      }
      if (onClick) onClick();
    };

    return (
      <Link 
        to={pageAvailability[to] ? to : '/404'} 
        className={className}
        onClick={handleClick}
      >
        {children}
      </Link>
    );
  };

  // Component to show "Coming Soon" tooltip
  const ComingSoonLink = ({ to, children, className, onClick }) => {
    const isAvailable = pageAvailability[to];
    
    if (!isAvailable) {
      return (
        <div className="relative group">
          <span 
            className={`${className} cursor-not-allowed opacity-75 relative`}
            onClick={(e) => {
              e.preventDefault();
              navigate('/404');
              if (onClick) onClick();
            }}
          >
            {children}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          </span>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-y-[-60px] transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Coming Soon
            <div className="absolute top-full left-1/2 -translate-y-[28px] transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 rotate-180 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      );
    }

    return (
      <CustomLink to={to} className={className} onClick={onClick}>
        {children}
      </CustomLink>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (pageAvailability['/search']) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate('/404');
      }
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleBookNow = () => {
    if (pageAvailability['/booking']) {
      navigate('/booking');
    } else {
      navigate('/404');
    }
  };

  // Helper function to check if current page matches the link
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const isAvailable = pageAvailability[path];
    const isActive = isActiveLink(path);
    
    return `font-medium transition-colors ${
      isActive 
        ? 'text-blue-600' 
        : isAvailable 
          ? 'text-gray-700 hover:text-blue-600'
          : 'text-gray-500 hover:text-gray-600'
    }`;
  };

  return (
    <header className="bg-white shadow-sm relative z-50">
      {/* Top Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <CustomLink to="/" className="flex items-center space-x-2">
              {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">☀</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Sunrise</span> */}
                <img src={HotelFinderLogo} alt="HotelFinder Logo" className="h-8 w-auto" />
            </CustomLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <CustomLink to="/" className={navLinkClass('/')}>
              Home
            </CustomLink>
            <ComingSoonLink to="/services" className={navLinkClass('/services')}>
              Hotels
            </ComingSoonLink>
            <ComingSoonLink to="/about" className={navLinkClass('/about')}>
              About Us
            </ComingSoonLink>
            <ComingSoonLink to="/facilities" className={navLinkClass('/facilities')}>
              Facilities
            </ComingSoonLink>
            <ComingSoonLink to="/contact" className={navLinkClass('/membership')}>
              Contact Us
            </ComingSoonLink>
            <ComingSoonLink to="/team" className={navLinkClass('/membership')}>
              Team
            </ComingSoonLink>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={!pageAvailability['/search']}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Book Now Button */}
            <button 
              onClick={handleBookNow}
              className={`hidden sm:inline-flex items-center px-4 py-2 rounded-full font-medium transition-colors ${
                pageAvailability['/booking']
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!pageAvailability['/booking']}
            >
              Book Now
              {!pageAvailability['/booking'] && (
                <span className="ml-1 text-xs">(Soon)</span>
              )}
            </button>


            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar (when expanded) */}
        {isSearchOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t">
            <div className="max-w-7xl mx-auto p-4">
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hotels..."
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                />
                <button className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t">
            <div className="px-4 py-6 space-y-4">
              <a href="#" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                Home
              </a>
              <a href="#" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                About Us
              </a>
              <a href="#" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                Services
              </a>
              <a href="#" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                Facilities
              </a>
              <a href="#" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                Membership
              </a>
              <button className="w-full mt-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium">
                Book Now
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
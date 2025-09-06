import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Sparkles, Bell } from 'lucide-react';
import { pageAvailability } from '../utils/pageAvailability';
import HotelFinderLogo from '/hotelFinderLogoBlackHorizontal.svg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Enhanced Coming Soon Link with better tooltip
  const ComingSoonLink = ({ to, children, className, onClick }) => {
    const isAvailable = pageAvailability[to];
    
    if (!isAvailable) {
      return (
        <div className="relative group">
          <span 
            className={`${className} cursor-not-allowed opacity-75 relative flex items-center`}
            onClick={(e) => {
              e.preventDefault();
              navigate('/404');
              if (onClick) onClick();
            }}
          >
            {children}
            <div className="ml-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-sm"></div>
          </span>
          {/* Enhanced Tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Coming Soon</span>
            </div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-900"></div>
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
    
    return `font-semibold transition-all duration-300 relative px-3 py-2 rounded-lg ${
      isActive 
        ? 'text-blue-600 bg-blue-50 shadow-sm' 
        : isAvailable 
          ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          : 'text-gray-500 hover:text-gray-600'
    }`;
  };

  return (
    <>
      {/* Enhanced Header with glassmorphism effect */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' 
          : 'bg-white/90 backdrop-blur-sm shadow-sm'
      }`}>
        {/* Top Navigation */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <div className="flex items-center">
              <CustomLink to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img 
                    src={HotelFinderLogo} 
                    alt="HotelFinder Logo" 
                    className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </CustomLink>
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <CustomLink to="/" className={navLinkClass('/')}>
                Home
              </CustomLink>
              {/* <ComingSoonLink to="/services" className={navLinkClass('/services')}>
                Hotels
              </ComingSoonLink> */}
              
              <ComingSoonLink to="/about" className={navLinkClass('/about')}>
                About Us
              </ComingSoonLink>
              {/* <ComingSoonLink to="/facilities" className={navLinkClass('/facilities')}>
                Facilities
              </ComingSoonLink> */}
              <ComingSoonLink to="/contact" className={navLinkClass('/contact')}>
                Contact Us
              </ComingSoonLink>
              <ComingSoonLink to="/team" className={navLinkClass('/team')}>
                Team
              </ComingSoonLink>
            </div>

            {/* Enhanced Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isSearchOpen 
                    ? 'bg-blue-100 text-blue-600 shadow-md' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                } ${!pageAvailability['/search'] ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!pageAvailability['/search']}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Enhanced Notification Button */}
              <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 relative">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>

              {/* Enhanced Book Now Button */}
              <button 
                onClick={handleBookNow}
                className={`hidden sm:inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  pageAvailability['/booking']
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                }`}
                disabled={!pageAvailability['/booking']}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Book Now
                {!pageAvailability['/booking'] && (
                  <span className="ml-2 text-xs opacity-75">(Soon)</span>
                )}
              </button>

              {/* Enhanced Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl border-t border-gray-100 animate-in slide-in-from-top duration-300">
              <div className="max-w-7xl mx-auto p-6">
                <form onSubmit={handleSearch} className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for hotels, destinations, or experiences..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-700 placeholder-gray-500 transition-all duration-300"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Search
                  </button>
                </form>
                
                {/* Quick Search Suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 mr-2">Popular:</span>
                  {['Mumbai Hotels', 'Udaipur Palace', 'Goa Resorts', 'Delhi Business'].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(suggestion)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl border-t border-gray-100 animate-in slide-in-from-top duration-300">
              <div className="px-6 py-8 space-y-2">
                <CustomLink 
                  to="/" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-4 px-4 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </CustomLink>
                <ComingSoonLink 
                  to="/services" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-4 px-4 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hotels
                </ComingSoonLink>
                <ComingSoonLink 
                  to="/about" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-4 px-4 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </ComingSoonLink>
                <ComingSoonLink 
                  to="/facilities" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-4 px-4 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Facilities
                </ComingSoonLink>
                <ComingSoonLink 
                  to="/contact" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-4 px-4 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </ComingSoonLink>
                <ComingSoonLink 
                  to="/team" 
                  className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-4 px-4 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Team
                </ComingSoonLink>
                
                {/* Enhanced Mobile Book Now Button */}
                <button 
                  onClick={() => {
                    handleBookNow();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full mt-6 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center ${
                    pageAvailability['/booking']
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!pageAvailability['/booking']}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Book Now
                  {!pageAvailability['/booking'] && (
                    <span className="ml-2 text-xs opacity-75">(Coming Soon)</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>
      
      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-20"></div>
    </>
  );
};

export default Header;
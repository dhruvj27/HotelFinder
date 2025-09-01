// utils/pageAvailability.js
// Centralized configuration for page availability
// Set to true when page is ready, false when it should redirect to 404

export const pageAvailability = {
  // Main Navigation Pages
  '/': true,                    // Home - available
  '/about': true,              // About - not ready yet
  '/services': false,           // Services - not ready yet
  '/facilities': false,         // Facilities - not ready yet
  '/membership': false,         // Membership - not ready yet
  '/contact': true,             // Contact - available
  '/team': true,             // Team - available
  
  // Hotel & Booking Pages
  '/search': true,              // Search - available
  '/booking': true,             // Booking - available
  
  // Support Pages
  '/help': false,               // Help Center - not ready yet
  '/privacy': false,            // Privacy Policy - not ready yet
  '/terms': false,              // Terms of Service - not ready yet
  '/cancellation': false,       // Cancellation Policy - not ready yet
  '/faq': false,                // FAQ - not ready yet
  '/cookies': false,            // Cookie Policy - not ready yet
  
  // User Account Pages (future)
  '/login': false,              // Login - not ready yet
  '/register': false,           // Register - not ready yet
  '/profile': false,            // User Profile - not ready yet
  '/bookings': false,           // User Bookings - not ready yet
  '/favorites': false,          // User Favorites - not ready yet
  
  // Admin Pages (future)
  '/admin': false,              // Admin Dashboard - not ready yet
  '/admin/hotels': false,       // Manage Hotels - not ready yet
  '/admin/bookings': false,     // Manage Bookings - not ready yet
};

// Helper function to check if a page is available
export const isPageAvailable = (path) => {
  return pageAvailability[path] === true;
};

// Helper function to get available pages only
export const getAvailablePages = () => {
  return Object.entries(pageAvailability)
    .filter(([path, available]) => available)
    .map(([path]) => path);
};

// Helper function to get unavailable pages
export const getUnavailablePages = () => {
  return Object.entries(pageAvailability)
    .filter(([path, available]) => !available)
    .map(([path]) => path);
};
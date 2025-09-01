// // pages/NotFound.jsx
// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Home, Search, ArrowLeft, MapPin, Clock } from 'lucide-react';

// const NotFound = () => {
//   const navigate = useNavigate();

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   // Popular destinations/suggestions
//   const popularDestinations = [
//     { name: "New York Hotels", path: "/search?q=new york" },
//     { name: "Miami Hotels", path: "/search?q=miami" },
//     { name: "Los Angeles Hotels", path: "/search?q=los angeles" },
//     { name: "Chicago Hotels", path: "/search?q=chicago" }
//   ];

//   const quickLinks = [
//     { name: "About Us", path: "/about", icon: "ℹ️" },
//     { name: "Services", path: "/services", icon: "⚡" },
//     { name: "Contact", path: "/contact", icon: "📞" },
//     { name: "Membership", path: "/membership", icon: "👑" }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
//       <div className="max-w-4xl w-full text-center">
//         {/* 404 Illustration */}
//         <div className="mb-8">
//           <div className="relative inline-block">
//             {/* Large 404 Text */}
//             <div className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-none">
//               404
//             </div>
            
//             {/* Floating hotel icons */}
//             <div className="absolute top-4 left-4 animate-bounce">
//               <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                 🏨
//               </div>
//             </div>
//             <div className="absolute top-8 right-8 animate-bounce delay-75">
//               <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
//                 🛏️
//               </div>
//             </div>
//             <div className="absolute bottom-12 left-12 animate-bounce delay-150">
//               <div className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center">
//                 🗝️
//               </div>
//             </div>
            
//             {/* Search icon with animation */}
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
//               <Search className="w-16 h-16 text-gray-300" />
//             </div>
//           </div>
//         </div>

//         {/* Error Message */}
//         <div className="mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Oops! Page Not Found
//           </h1>
//           <p className="text-lg text-gray-600 mb-2 max-w-2xl mx-auto">
//             The page you're looking for seems to have checked out. Don't worry, 
//             we'll help you find the perfect accommodation!
//           </p>
//           <p className="text-sm text-gray-500">
//             It might have been moved, deleted, or you entered the wrong URL.
//           </p>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
//           <Link
//             to="/"
//             className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium min-w-[160px] justify-center"
//           >
//             <Home className="w-5 h-5 mr-2" />
//             Go to Home
//           </Link>
          
//           <button
//             onClick={handleGoBack}
//             className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium min-w-[160px] justify-center"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Go Back
//           </button>
          
//           <Link
//             to="/search"
//             className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium min-w-[160px] justify-center"
//           >
//             <Search className="w-5 h-5 mr-2" />
//             Search Hotels
//           </Link>
//         </div>

//         {/* Quick Search Suggestions */}
//         <div className="grid md:grid-cols-2 gap-8 mb-12">
//           {/* Popular Destinations */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center mb-4">
//               <MapPin className="w-5 h-5 text-blue-600 mr-2" />
//               <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
//             </div>
//             <div className="space-y-2">
//               {popularDestinations.map((destination, index) => (
//                 <Link
//                   key={index}
//                   to={destination.path}
//                   className="block text-gray-600 hover:text-blue-600 transition-colors py-1 text-left"
//                 >
//                   {destination.name}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center mb-4">
//               <Clock className="w-5 h-5 text-purple-600 mr-2" />
//               <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
//             </div>
//             <div className="space-y-2">
//               {quickLinks.map((link, index) => (
//                 <Link
//                   key={index}
//                   to={link.path}
//                   className="flex items-center text-gray-600 hover:text-purple-600 transition-colors py-1"
//                 >
//                   <span className="mr-2">{link.icon}</span>
//                   {link.name}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Or search for hotels directly
//           </h3>
//           <form 
//             onSubmit={(e) => {
//               e.preventDefault();
//               const query = e.target.search.value.trim();
//               if (query) {
//                 navigate(`/search?q=${encodeURIComponent(query)}`);
//               }
//             }}
//             className="flex flex-col sm:flex-row gap-3"
//           >
//             <div className="flex-1">
//               <input
//                 type="text"
//                 name="search"
//                 placeholder="Enter destination, hotel name, or location..."
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <button
//               type="submit"
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               Search Hotels
//             </button>
//           </form>
//         </div>

//         {/* Help Text */}
//         <div className="mt-8 text-center text-sm text-gray-500">
//           <p>
//             Still can't find what you're looking for? 
//             <Link to="/contact" className="text-blue-600 hover:text-blue-700 ml-1">
//               Contact our support team
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotFound;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="text-center">
        {/* 404 Text */}
        <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Page not found. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <button
            onClick={handleGoBack}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <Link
            to="/search"
            className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Need help?{' '}
          <Link to="/contact" className="text-blue-500 hover:text-blue-600">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
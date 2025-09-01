import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-96 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Find amazing hotels, compare prices, and book your dream vacation easily
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl">
          Search trusted hotels for unforgettable stays and hassle-free bookings. Find the best hotels near you in seconds with ease and confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/search"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Here
          </Link>
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Book Now
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[url('https://via.placeholder.com/1200x600?text=Hotel+Image')] bg-cover bg-center opacity-50"></div>
    </section>
  );
};

export default HeroSection;
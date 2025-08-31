import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const ExploreSection = () => {
  const destinations = [
    { name: 'Lisbon, Portugal', type: 'Minimalist', priceRange: '10,000 - 20,000' },
  ];

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-900">Explore Stays</h2>
      </div>
      <p className="text-gray-600 mb-6">
        About Comfort, Your Stay, Our Priority
      </p>
      <form className="flex flex-col sm:flex-row gap-4">
        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Location</option>
          {destinations.map((dest, index) => (
            <option key={index} value={dest.name}>{dest.name}</option>
          ))}
        </select>
        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Type</option>
          {destinations.map((dest, index) => (
            <option key={index} value={dest.type}>{dest.type}</option>
          ))}
        </select>
        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Price</option>
          {destinations.map((dest, index) => (
            <option key={index} value={dest.priceRange}>{dest.priceRange}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Search Hotel
        </button>
      </form>
      <div className="text-center mt-4">
        <Link to="/search" className="text-blue-600 hover:text-blue-700">
          Let's know us +
        </Link>
      </div>
    </section>
  );
};

export default ExploreSection;
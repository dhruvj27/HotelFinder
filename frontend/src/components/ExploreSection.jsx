import React, { useState } from 'react';
import { MapPin, Calendar, Users, Search, Filter, Sparkles } from 'lucide-react';

const ExploreSection = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDates, setSelectedDates] = useState({ checkin: '', checkout: '' });
  const [guests, setGuests] = useState(1);
  const [priceRange, setPriceRange] = useState('');

  const destinations = [
    { name: 'Mumbai, Maharashtra', type: 'Business & Luxury', priceRange: '₹12,000 - ₹25,000', image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400&h=250&fit=crop' },
    { name: 'Udaipur, Rajasthan', type: 'Heritage & Palace', priceRange: '₹15,000 - ₹45,000', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop' },
    { name: 'New Delhi', type: 'Business & Cultural', priceRange: '₹10,000 - ₹20,000', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=250&fit=crop' },
    { name: 'Goa', type: 'Beach & Resort', priceRange: '₹8,000 - ₹18,000', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop' },
    { name: 'Chennai, Tamil Nadu', type: 'Business & Heritage', priceRange: '₹7,000 - ₹15,000', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop' },
    { name: 'Bengaluru, Karnataka', type: 'Business & Modern', priceRange: '₹8,000 - ₹16,000', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop' }
  ];

  const handleSearch = () => {
    console.log('Search initiated with:', { selectedLocation, selectedDates, guests, priceRange });
  };

  return (
    <section className="mb-12">
      {/* Search Section */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Find Your Perfect Stay</h2>
            <p className="text-gray-600 mt-1">AI-powered recommendations for your ideal hotel experience</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Location and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                Where to?
              </label>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white text-gray-900"
              >
                <option value="">Select destination</option>
                {destinations.map((dest, index) => (
                  <option key={index} value={dest.name}>{dest.name}</option>
                ))}
              </select>
            </div>

            {/* Check-in Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Check-in
              </label>
              <input
                type="date"
                value={selectedDates.checkin}
                onChange={(e) => setSelectedDates(prev => ({ ...prev, checkin: e.target.value }))}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Check-out
              </label>
              <input
                type="date"
                value={selectedDates.checkout}
                onChange={(e) => setSelectedDates(prev => ({ ...prev, checkout: e.target.value }))}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {/* Guests and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guests */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Guests
              </label>
              <select 
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              >
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-blue-600" />
                Budget Range
              </label>
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
              >
                <option value="">Any budget</option>
                <option value="budget">₹5,000 - ₹10,000</option>
                <option value="mid">₹10,000 - ₹20,000</option>
                <option value="luxury">₹20,000 - ₹35,000</option>
                <option value="premium">₹35,000+</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Find Perfect Hotels
            </button>
          </div>
        </div>
      </div>

    
      {/* <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Popular Destinations</h3>
            <p className="text-gray-600">Discover the most sought-after locations in India</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
            View all
            <span className="ml-1">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl mb-4">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {destination.type}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-bold text-lg">{destination.name}</h4>
                  <p className="text-sm opacity-90">{destination.priceRange}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
};

export default ExploreSection;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Wifi, Car, Utensils, Waves, Eye, ArrowRight } from 'lucide-react';

const FeaturedSection = () => {
  const [likedHotels, setLikedHotels] = useState(new Set());

  const toggleLike = (hotelId) => {
    setLikedHotels(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(hotelId)) {
        newLiked.delete(hotelId);
      } else {
        newLiked.add(hotelId);
      }
      return newLiked;
    });
  };

  // Using real hotel data with working images
  const hotels = [
    {
      id: 1,
      name: 'The Taj Mahal Palace',
      location: 'Mumbai, Maharashtra',
      price: '₹15,000',
      rating: 4.8,
      reviews: 2847,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      badge: 'Heritage'
    },
    {
      id: 2,
      name: 'Oberoi Udaivilas',
      location: 'Udaipur, Rajasthan',
      price: '₹18,000',
      rating: 4.9,
      reviews: 1923,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      badge: 'Luxury Palace'
    },
    {
      id: 3,
      name: 'The Leela Palace',
      location: 'New Delhi',
      price: '₹12,000',
      rating: 4.7,
      reviews: 3156,
      image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      badge: 'Business'
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="bg-white rounded-3xl shadow-lg p-8 mb-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mr-4">
            <Heart className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Explore Best Hotels</h2>
            <p className="text-gray-600 mt-1">Hand-picked luxury accommodations with AI recommendations</p>
          </div>
        </div>
        {/* FIXED: Keep your existing "View all" link */}
        <Link 
          to="/search" 
          className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <Eye className="w-5 h-5 mr-2" />
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Enhanced Hotels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="group cursor-pointer">
            {/* Enhanced Image Container */}
            <div className="relative overflow-hidden rounded-2xl mb-4">
              <img 
                src={hotel.image} 
                alt={hotel.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Enhanced Overlays */}
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {hotel.badge}
                </span>
              </div>

              {/* Enhanced Like Button */}
              <button
                onClick={() => toggleLike(hotel.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    likedHotels.has(hotel.id) 
                      ? 'text-red-500 fill-current' 
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                />
              </button>
            </div>

            {/* Enhanced Content */}
            <div className="space-y-3">
              {/* Title and Location */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {hotel.name}
                </h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{hotel.location}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {renderStars(hotel.rating)}
                </div>
                <span className="text-sm font-semibold text-gray-900 mr-1">
                  {hotel.rating}
                </span>
                <span className="text-sm text-gray-600">
                  ({hotel.reviews.toLocaleString()} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {hotel.price}
                  </span>
                  <span className="text-sm text-gray-600">/night</span>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FIXED: Keep your existing "View all" link but enhanced */}
      <div className="text-center mt-8">
        <Link 
          to="/search" 
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          View all +
        </Link>
      </div>
    </section>
  );
};

export default FeaturedSection;
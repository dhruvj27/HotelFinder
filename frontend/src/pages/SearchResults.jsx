import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart } from 'lucide-react';
import hotelsData from '../data/hotels.json';

const SearchResults = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    // Simulate API loading
    const loadHotels = () => {
      setTimeout(() => {
        setHotels(hotelsData);
        setLoading(false);
      }, 800);
    };

    loadHotels();
  }, []);

  const toggleFavorite = (hotelId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId);
      } else {
        newFavorites.add(hotelId);
      }
      return newFavorites;
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading hotels...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Featured Hotels in India
          </h1>
          <p className="text-gray-600 text-lg">
            Discover {hotels.length} luxury hotels across India
          </p>
        </div>

        {/* Hotels Grid */}
        <div className="grid gap-8">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                {/* Hotel Image */}
                <div className="md:w-2/5">
                  <div className="h-64 md:h-full relative">
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(hotel.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                        favorites.has(hotel.id)
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-105'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.has(hotel.id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* Score Badge */}
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {hotel.score}/10
                    </div>
                  </div>
                </div>
                
                {/* Hotel Details */}
                <div className="md:w-3/5 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        <Link to={`/hotel/${hotel.id}`}>
                          {hotel.name}
                        </Link>
                      </h3>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span className="text-base">{hotel.location}</span>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center space-x-1">
                          {renderStars(hotel.rating)}
                        </div>
                        <span className="text-gray-600 text-sm">
                          {hotel.rating} ({hotel.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-blue-600">
                        ₹{hotel.price.toLocaleString()}
                      </div>
                      <div className="text-gray-600 text-sm">per night</div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                    {hotel.description}
                  </p>
                  
                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {hotel.amenities.slice(0, 4).map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{hotel.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4">
                    <Link
                      to={`/hotel/${hotel.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/booking/${hotel.id}`}
                      className="flex-1 border-2 border-blue-600 text-blue-600 text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button (for future pagination) */}
        <div className="text-center mt-12">
          <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Load More Hotels
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
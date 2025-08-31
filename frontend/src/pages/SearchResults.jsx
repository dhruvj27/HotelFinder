// pages/SearchResults.jsx (Zustand version)
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useHotelStore from '../store/hotelStore';
import { Star, MapPin, Heart, Filter, SlidersHorizontal } from 'lucide-react';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [showFilters, setShowFilters] = useState(false);

  // Zustand store
  const {
    searchResults,
    searchHotels,
    filters,
    setFilters,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loading
  } = useHotelStore();

  // Local filter state
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    // Perform search when component mounts or query changes
    searchHotels(query, filters);
  }, [query, filters, searchHotels]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    setFilters(localFilters);
    searchHotels(query, localFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const defaultFilters = {
      minPrice: 0,
      maxPrice: 1000,
      location: '',
      minRating: 0,
      amenities: []
    };
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
    searchHotels(query, defaultFilters);
  };

  const handleFavoriteToggle = (hotelId) => {
    if (isFavorite(hotelId)) {
      removeFromFavorites(hotelId);
    } else {
      addToFavorites(hotelId);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {query ? `Search Results for "${query}"` : 'All Hotels'}
            </h1>
            <p className="text-gray-600">
              {loading ? 'Searching...' : `${searchResults.length} hotels found`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: High to Low</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={localFilters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={localFilters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 1000)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-medium mb-3">Location</h4>
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    value={localFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Rating */}
                <div>
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={localFilters.minRating === rating}
                          onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                          className="text-blue-600"
                        />
                        <div className="flex items-center space-x-1">
                          {rating === 0 ? (
                            <span className="text-sm">Any rating</span>
                          ) : (
                            <>
                              {renderStars(rating)}
                              <span className="text-sm ml-1">{rating}+</span>
                            </>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-medium mb-3">Amenities</h4>
                  <div className="space-y-2">
                    {['Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Restaurant', 'Parking'].map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={localFilters.amenities.includes(amenity)}
                          onChange={(e) => {
                            const newAmenities = e.target.checked
                              ? [...localFilters.amenities, amenity]
                              : localFilters.amenities.filter(a => a !== amenity);
                            handleFilterChange('amenities', newAmenities);
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading hotels...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600 mb-4">
                  {query 
                    ? `No results found for "${query}". Try adjusting your search or filters.`
                    : 'No hotels match your current filters.'
                  }
                </p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults.map((hotel) => (
                  <div key={hotel.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <div className="h-48 md:h-full relative">
                          <img
                            src={hotel.images[0]}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleFavoriteToggle(hotel.id)}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                              isFavorite(hotel.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-gray-700 hover:bg-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite(hotel.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              <Link 
                                to={`/hotel/${hotel.id}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {hotel.name}
                              </Link>
                            </h3>
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(hotel.rating)}
                                <span className="text-sm text-gray-600 ml-1">
                                  {hotel.rating} ({hotel.reviews} reviews)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-600 mb-3">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{hotel.location}</span>
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600">
                              ${hotel.price}
                            </div>
                            <div className="text-sm text-gray-600">per night</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {hotel.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 4).map((amenity, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {amenity}
                            </span>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{hotel.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Link
                              to={`/hotel/${hotel.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                          <Link
                            to={`/booking/${hotel.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
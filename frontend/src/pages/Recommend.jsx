import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, Star, ArrowLeft, Sparkles, Users, Calendar } from 'lucide-react';

const Recommend = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const recommendations = location.state?.recommendations || [];
  const searchParams = location.state?.searchParams || {};

  // If no recommendations, redirect back
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations Found</h2>
            <p className="text-gray-600 mb-8">Please try searching again with different criteria.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </button>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mr-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
                <p className="text-gray-600">Personalized hotel suggestions for your perfect stay</p>
              </div>
            </div>

            {/* Search Summary */}
            <div className="flex flex-wrap gap-4 text-sm">
              {searchParams.city && (
                <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-blue-700 font-medium">{searchParams.city}</span>
                </div>
              )}
              {searchParams.guests && (
                <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-700 font-medium">{searchParams.guests} Guest{searchParams.guests > 1 ? 's' : ''}</span>
                </div>
              )}
              {searchParams.priceRange && (
                <div className="flex items-center bg-purple-50 px-3 py-2 rounded-lg">
                  <IndianRupee className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="text-purple-700 font-medium">{searchParams.priceRange} Range</span>
                </div>
              )}
              {searchParams.dates?.checkin && searchParams.dates?.checkout && (
                <div className="flex items-center bg-orange-50 px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                  <span className="text-orange-700 font-medium">
                    {new Date(searchParams.dates.checkin).toLocaleDateString()} - {new Date(searchParams.dates.checkout).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Found {recommendations.length} perfect matches for you
          </h2>
        </div>

        {/* Recommendations Grid */}
        <div className="space-y-6">
          {recommendations.map((hotel, index) => (
            <div key={hotel.hotel_id || index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                {/* Hotel Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{hotel.hotel_name}</h3>
                      {index === 0 && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Top Pick
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{hotel.city}</span>
                      {hotel.star_rating > 0 && (
                        <>
                          <div className="mx-3 w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                            <span>{hotel.star_rating} Star</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end mb-1">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {hotel.price_per_night.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm">per night</span>
                  </div>
                </div>

                {/* Match Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Match Score</span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(hotel.combined_score * 100)}% match
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(hotel.combined_score * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Why we recommend this hotel:</h4>
                      <p className="text-gray-700 leading-relaxed">{hotel.llm_explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                {hotel.explanation && (
                  <div className="text-sm text-gray-500 border-t pt-3">
                    <span className="font-medium">Technical Score:</span> {hotel.explanation}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => navigate(`/hotel/${hotel.hotel_id}`)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/booking/${hotel.hotel_id}`)}
                    className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Try Another Search */}
        <div className="text-center mt-12 py-8">
          <p className="text-gray-600 mb-4">Not finding what you're looking for?</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors font-semibold"
          >
            Try Another Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommend;
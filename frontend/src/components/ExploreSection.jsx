import React, { useState } from 'react';
import { MapPin, Calendar, Users, Search, Filter, Sparkles, Loader2, Star, Wifi, Car, Coffee, Dumbbell, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExploreSection = () => {
  const [formData, setFormData] = useState({
    city: '',
    preferred_amenities: [],
    budget_min_inr: 1000,
    budget_max_inr: 10000,
    min_star_rating: 2,
    top_n: 5
  });
  
  const [selectedDates, setSelectedDates] = useState({ checkin: '', checkout: '' });
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const destinations = [
    { name: 'Mumbai', value: 'Mumbai' },
    { name: 'Udaipur', value: 'Udaipur' },
    { name: 'New Delhi', value: 'New Delhi' },
    { name: 'Goa', value: 'Goa' },
    { name: 'Panaji', value: 'Panaji' },
    { name: 'Chennai', value: 'Chennai' },
    { name: 'Bengaluru', value: 'Bengaluru' },
    { name: 'Kolkata', value: 'Kolkata' },
    { name: 'Hyderabad', value: 'Hyderabad' },
    { name: 'Pune', value: 'Pune' }
  ];

  const amenitiesOptions = [
    { name: 'Pool', value: 'pool', icon: Waves },
    { name: 'Gym', value: 'gym', icon: Dumbbell },
    { name: 'WiFi', value: 'wifi', icon: Wifi },
    { name: 'Parking', value: 'parking', icon: Car },
    { name: 'Restaurant', value: 'restaurant', icon: Coffee },
    { name: 'Spa', value: 'spa', icon: Sparkles },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityToggle = (amenityValue) => {
    setFormData(prev => ({
      ...prev,
      preferred_amenities: prev.preferred_amenities.includes(amenityValue)
        ? prev.preferred_amenities.filter(a => a !== amenityValue)
        : [...prev.preferred_amenities, amenityValue]
    }));
  };

  const handleSearch = async () => {
    // Basic validation
    if (!formData.city) {
      setError('Please select a destination');
      return;
    }

    if (formData.budget_min_inr >= formData.budget_max_inr) {
      setError('Minimum budget should be less than maximum budget');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requestBody = {
        user_id: 1,
        user_preferences: {
          city: formData.city,
          preferred_amenities: formData.preferred_amenities,
          budget_min_inr: formData.budget_min_inr,
          budget_max_inr: formData.budget_max_inr,
          min_star_rating: formData.min_star_rating
        },
        top_n: formData.top_n,
        explain: true
      };

      console.log('Sending request:', requestBody);

      const response = await fetch('https://recommendation-model-npn.onrender.com/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.status === 'success' && data.results) {
        // Navigate to recommendations page with data
        navigate('/recommend', { 
          state: { 
            recommendations: data.results,
            searchParams: {
              ...formData,
              guests,
              dates: selectedDates
            }
          } 
        });
      } else {
        throw new Error('No recommendations found');
      }

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* City Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Destination City*
            </label>
            <select 
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white text-gray-900"
              disabled={isLoading}
            >
              <option value="">Select destination city</option>
              {destinations.map((dest, index) => (
                <option key={index} value={dest.value}>{dest.name}</option>
              ))}
            </select>
          </div>

          {/* Preferred Amenities */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
              Preferred Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesOptions.map((amenity) => {
                const IconComponent = amenity.icon;
                const isSelected = formData.preferred_amenities.includes(amenity.value);
                
                return (
                  <button
                    key={amenity.value}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.value)}
                    disabled={isLoading}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <span className="font-medium">{amenity.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-blue-600" />
                Minimum Budget (₹ per night)
              </label>
              <input
                type="number"
                min="500"
                max="50000"
                step="500"
                value={formData.budget_min_inr}
                onChange={(e) => handleInputChange('budget_min_inr', parseInt(e.target.value) || 1000)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-blue-600" />
                Maximum Budget (₹ per night)
              </label>
              <input
                type="number"
                min="1000"
                max="100000"
                step="500"
                value={formData.budget_max_inr}
                onChange={(e) => handleInputChange('budget_max_inr', parseInt(e.target.value) || 10000)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Star Rating and Number of Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Star className="w-4 h-4 mr-2 text-blue-600" />
                Minimum Star Rating
              </label>
              <select 
                value={formData.min_star_rating}
                onChange={(e) => handleInputChange('min_star_rating', parseInt(e.target.value))}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                disabled={isLoading}
              >
                <option value={1}>1 Star & above</option>
                <option value={2}>2 Stars & above</option>
                <option value={3}>3 Stars & above</option>
                <option value={4}>4 Stars & above</option>
                <option value={5}>5 Stars only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Search className="w-4 h-4 mr-2 text-blue-600" />
                Number of Recommendations
              </label>
              <select 
                value={formData.top_n}
                onChange={(e) => handleInputChange('top_n', parseInt(e.target.value))}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                disabled={isLoading}
              >
                <option value={3}>3 Hotels</option>
                <option value={5}>5 Hotels</option>
                <option value={10}>10 Hotels</option>
                <option value={15}>15 Hotels</option>
              </select>
            </div>
          </div>

          {/* Optional: Check-in/Check-out dates and Guests */}
          <div className="bg-blue-50 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Check-in
                </label>
                <input
                  type="date"
                  value={selectedDates.checkin}
                  onChange={(e) => setSelectedDates(prev => ({ ...prev, checkin: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-sm"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Check-out
                </label>
                <input
                  type="date"
                  value={selectedDates.checkout}
                  onChange={(e) => setSelectedDates(prev => ({ ...prev, checkout: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-sm"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  Guests
                </label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-sm"
                  disabled={isLoading}
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSearch}
              disabled={isLoading || !formData.city}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding Hotels...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </button>
          </div>

          {/* Current Selection Preview */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <h4 className="font-semibold text-gray-700 mb-2">Search Summary:</h4>
            <div className="text-gray-600 space-y-1">
              <p><strong>City:</strong> {formData.city || 'Not selected'}</p>
              <p><strong>Amenities:</strong> {formData.preferred_amenities.length > 0 ? formData.preferred_amenities.join(', ') : 'None selected'}</p>
              <p><strong>Budget:</strong> ₹{formData.budget_min_inr.toLocaleString()} - ₹{formData.budget_max_inr.toLocaleString()} per night</p>
              <p><strong>Min Rating:</strong> {formData.min_star_rating} star{formData.min_star_rating > 1 ? 's' : ''} & above</p>
              <p><strong>Results:</strong> Top {formData.top_n} recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
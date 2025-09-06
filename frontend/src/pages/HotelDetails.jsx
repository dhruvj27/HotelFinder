import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  ChevronLeft,
  ChevronRight,
  Check,
  Heart,
  Share2,
  ArrowLeft
} from 'lucide-react';
import hotelsData from '../data/hotels.json';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadHotel = () => {
      setTimeout(() => {
        const foundHotel = hotelsData.find(h => h.id === parseInt(id));
        if (foundHotel) {
          setHotel(foundHotel);
        } else {
          navigate('/404');
        }
        setLoading(false);
      }, 500);
    };

    loadHotel();
  }, [id, navigate]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const nextImage = () => {
    if (hotel) {
      setCurrentImageIndex((prev) => 
        prev === hotel.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hotel) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? hotel.images.length - 1 : prev - 1
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hotel.name,
          text: hotel.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading hotel details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hotel Not Found</h2>
          <p className="text-gray-600 mb-6">The hotel you're looking for doesn't exist.</p>
          <Link
            to="/results"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to="/results" className="hover:text-blue-600">Hotels</Link>
            <span>/</span>
            <span className="text-gray-900">{hotel.name}</span>
          </div>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-200 shadow-lg">
                <img
                  src={hotel.images[currentImageIndex]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Action buttons */}
                <div className="absolute top-6 right-6 flex space-x-3">
                  <button
                    onClick={handleShare}
                    className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                      isFavorite
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                {/* Score Badge */}
                <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  {hotel.score}/10
                </div>
                
                {/* Navigation buttons */}
                {hotel.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {hotel.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Hotel Info */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{hotel.name}</h1>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      {renderStars(hotel.rating)}
                      <span className="text-gray-600 ml-2">
                        {hotel.rating} ({hotel.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{hotel.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    ₹{hotel.roomTypes[selectedRoomType].price.toLocaleString()}
                  </div>
                  <div className="text-gray-600">per night</div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed text-lg">{hotel.description}</p>
              
              {/* Dummy Explanation Text */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Why Choose This Hotel?</h3>
                <p className="text-blue-800 leading-relaxed">
                  This exceptional property stands out for its perfect blend of traditional Indian hospitality and modern luxury amenities. 
                  Located in a prime area, it offers easy access to major attractions while providing a serene retreat from the bustling city life. 
                  The hotel's commitment to service excellence, combined with its rich cultural heritage and world-class facilities, 
                  makes it an ideal choice for both leisure and business travelers seeking an unforgettable experience.
                </p>
              </div>
            </div>

            {/* Room Types */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6">Room Types</h3>
              <div className="space-y-4">
                {hotel.roomTypes.map((room, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      selectedRoomType === index 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedRoomType(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{room.type}</h4>
                        <p className="text-gray-600 mb-3">{room.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {room.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{room.price.toLocaleString()}
                        </div>
                        <div className="text-gray-600">per night</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6">Amenities</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6">Hotel Policies</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Check-in / Check-out</h4>
                  <p className="text-gray-600">Check-in: {hotel.policies.checkIn}</p>
                  <p className="text-gray-600">Check-out: {hotel.policies.checkOut}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Cancellation</h4>
                  <p className="text-gray-600">{hotel.policies.cancellation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pet Policy</h4>
                  <p className="text-gray-600">{hotel.policies.pets}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 sticky top-8">
              <h3 className="text-2xl font-semibold mb-6">Book Your Stay</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} Guest{num !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Summary */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-semibold">{hotel.roomTypes[selectedRoomType].type}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-xl font-bold">
                    <span className="text-gray-900">Price per night:</span>
                    <span className="text-blue-600">₹{hotel.roomTypes[selectedRoomType].price.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  to={`/booking/${hotel.id}`}
                  className="block w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors text-center shadow-lg"
                >
                  Book Now
                </Link>

                <p className="text-sm text-gray-500 text-center">
                  You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
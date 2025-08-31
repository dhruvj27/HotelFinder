// pages/HotelDetails.jsx (Zustand version)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useHotelStore from '../store/hotelStore';
import { 
  Star, 
  MapPin, 
  ChevronLeft,
  ChevronRight,
  Check,
  Heart,
  Share2
} from 'lucide-react';

const HotelDetails = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  
  // Zustand store hooks
  const {
    getHotelById,
    getHotelBySlug,
    fetchHotelById,
    setBookingData,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loading,
    error
  } = useHotelStore();

  // Local state
  const [hotel, setHotel] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const loadHotel = async () => {
      let foundHotel = null;

      // Try to get hotel from store first (no API call)
      if (id) {
        foundHotel = getHotelById(id);
      } else if (slug) {
        foundHotel = getHotelBySlug(slug);
      }

      if (foundHotel) {
        setHotel(foundHotel);
      } else if (id) {
        // If not found in store and we have an ID, try fetching from API
        try {
          foundHotel = await fetchHotelById(id);
          setHotel(foundHotel);
        } catch (err) {
          navigate('/404');
        }
      } else {
        navigate('/404');
      }
    };

    loadHotel();
  }, [id, slug, getHotelById, getHotelBySlug, fetchHotelById, navigate]);

  const handleBooking = () => {
    if (hotel) {
      const bookingData = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomType: hotel.roomTypes[selectedRoomType],
        checkIn,
        checkOut,
        guests,
        totalPrice: calculateTotalPrice()
      };
      
      // Store booking data in Zustand store
      setBookingData(bookingData);
      navigate(`/booking/${hotel.id}`);
    }
  };

  const handleFavoriteToggle = () => {
    if (hotel) {
      if (isFavorite(hotel.id)) {
        removeFromFavorites(hotel.id);
      } else {
        addToFavorites(hotel.id);
      }
    }
  };

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !hotel) return 0;
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    return nights * hotel.roomTypes[selectedRoomType].price;
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Hotel</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const nights = calculateNights();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to="/search" className="hover:text-blue-600">Hotels</Link>
            <span>/</span>
            <span className="text-gray-900">{hotel.name}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={hotel.images[currentImageIndex]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite(hotel.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(hotel.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                {/* Navigation buttons */}
                {hotel.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {hotel.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Hotel Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(hotel.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        {hotel.rating} ({hotel.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ${hotel.roomTypes[selectedRoomType].price}
                  </div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Room Types */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Room Types</h3>
              <div className="space-y-4">
                {hotel.roomTypes.map((room, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRoomType === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRoomType(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{room.type}</h4>
                        <p className="text-gray-600 text-sm mb-2">{room.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {room.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-blue-600">
                          ${room.price}
                        </div>
                        <div className="text-sm text-gray-600">per night</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Hotel Policies</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Check-in / Check-out</h4>
                  <p className="text-gray-600 text-sm">Check-in: {hotel.policies.checkIn}</p>
                  <p className="text-gray-600 text-sm">Check-out: {hotel.policies.checkOut}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cancellation</h4>
                  <p className="text-gray-600 text-sm">{hotel.policies.cancellation}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pet Policy</h4>
                  <p className="text-gray-600 text-sm">{hotel.policies.pets}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} Guest{num !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Summary */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium">{hotel.roomTypes[selectedRoomType].type}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Price per night:</span>
                    <span className="font-medium">${hotel.roomTypes[selectedRoomType].price}</span>
                  </div>
                  {nights > 0 && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-medium">{nights}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4 text-lg font-bold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-blue-600">${totalPrice}</span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>

                <p className="text-xs text-gray-500 text-center">
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
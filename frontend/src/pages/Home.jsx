import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Calendar, Award, Shield, Clock, Sparkles } from 'lucide-react';
import ExploreSection from '../components/ExploreSection';
import FeaturedSection from '../components/FeaturedSection';

const Home = () => {
  const navigate = useNavigate();

  // FIXED: Added proper navigation functionality
  const handleViewHotels = () => {
    navigate('/results');
  };

  const handleHowItWorks = () => {
    console.log('Navigate to how it works page');
    // navigate('/how-it-works'); // Add this route later
  };

  const stats = [
    { icon: <MapPin className="w-8 h-8" />, number: "150+", label: "Destinations" },
    { icon: <Users className="w-8 h-8" />, number: "50K+", label: "Happy Guests" },
    { icon: <Star className="w-8 h-8" />, number: "4.8", label: "Average Rating" },
    { icon: <Calendar className="w-8 h-8" />, number: "24/7", label: "Support" }
  ];

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Recommendations",
      description: "Our advanced AI analyzes your preferences, past bookings, and real-time data to suggest the perfect hotels tailored just for you.",
      color: "blue"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Prime Locations",
      description: "From bustling city centers to serene beachfronts, discover hotels in the most sought-after destinations across India.",
      color: "purple"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Quality",
      description: "Every hotel is carefully vetted and verified to ensure you get the best experience with guaranteed quality and service.",
      color: "green"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Our dedicated support team is available round the clock to ensure your booking experience is smooth and hassle-free.",
      color: "red"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Best Price Guarantee",
      description: "We guarantee the best prices on all our hotels. Found a lower price elsewhere? We'll match it and give you an extra 5% off.",
      color: "yellow"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Personalized Service",
      description: "Experience personalized service with custom recommendations based on your travel history and preferences.",
      color: "indigo"
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600", 
      green: "bg-green-100 text-green-600",
      red: "bg-red-100 text-red-600",
      yellow: "bg-yellow-100 text-yellow-600",
      indigo: "bg-indigo-100 text-indigo-600"
    };
    return colorMap[color] || "bg-blue-100 text-blue-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&h=900&fit=crop"
            alt="Luxury Hotel"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hotel Experience
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover luxury accommodations with our AI-powered recommendation engine. 
              From heritage palaces to modern luxury, we find hotels that match your unique preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={handleViewHotels}
                className="bg-white text-blue-900 px-12 py-5 rounded-full text-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
              >
                Explore Hotels
              </button>
              <button 
                onClick={handleHowItWorks}
                className="border-2 border-white text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-white hover:text-blue-900 transition-all"
              >
                How It Works
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content with increased max-width */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-16 -mt-20 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="flex justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

          
        <ExploreSection />

        {/* Enhanced Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of hotel booking with cutting-edge technology and personalized service
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
                <div className={`w-16 h-16 ${getColorClasses(feature.color)} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ADDED: Dynamic FeaturedSection Component */}
        <FeaturedSection />

        {/* How It Works Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to find your perfect stay</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tell Us Your Preferences</h3>
              <p className="text-gray-600">Share your travel dates, location, budget, and preferences</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Finds Perfect Matches</h3>
              <p className="text-gray-600">Our AI analyzes thousands of options to find your ideal hotels</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book with Confidence</h3>
              <p className="text-gray-600">Choose from personalized recommendations and book instantly</p>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default Home;
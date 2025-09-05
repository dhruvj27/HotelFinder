import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Hotel, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Hotel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 via-purple-800 to-blue-900 bg-clip-text text-transparent mb-6 leading-tight">
            About HotelFinder
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            HotelFinder is a trusted platform connecting travelers with top hotels across the world. 
            We make finding and booking your perfect stay simple, affordable, and enjoyable.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-10 mb-10 hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <div className="space-y-5">
            <p className="text-gray-700 text-lg leading-relaxed">
              At HotelFinder, we believe in effortless hospitality. Our goal is to provide a comprehensive range of hotel options, 
              competitive prices, and hassle-free bookings to make your dream vacation a reality.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Founded in 2020, we've grown to partner with thousands of hotels worldwide, serving millions of satisfied travelers.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Comfort First</h3>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              We prioritize your comfort by curating hotels that meet high standards of quality and service.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Transparency</h3>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Clear pricing, honest reviews, and detailed information to help you make informed decisions.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link 
            to="/contact" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
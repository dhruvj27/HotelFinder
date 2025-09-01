import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Hotel, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About HotelFinder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            HotelFinder is a trusted platform connecting travelers with top hotels across the world. 
            We make finding and booking your perfect stay simple, affordable, and enjoyable.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-4">
            <Globe className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-600 mb-4">
            At HotelFinder, we believe in effortless hospitality. Our goal is to provide a comprehensive range of hotel options, 
            competitive prices, and hassle-free bookings to make your dream vacation a reality.
          </p>
          <p className="text-gray-600">
            Founded in 2020, we've grown to partner with thousands of hotels worldwide, serving millions of satisfied travelers.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Hotel className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Comfort First</h3>
            </div>
            <p className="text-gray-600">
              We prioritize your comfort by curating hotels that meet high standards of quality and service.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Transparency</h3>
            </div>
            <p className="text-gray-600">
              Clear pricing, honest reviews, and detailed information to help you make informed decisions.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link 
            to="/contact" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
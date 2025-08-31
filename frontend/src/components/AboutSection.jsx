import React from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="bg-gray-100 rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-4">
        <Info className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-900">About Us</h2>
      </div>
      <p className="text-gray-600 mb-4">
        Sunrise is a trusted platform connecting travelers with top hotels across the country
      </p>
      <div className="flex justify-center">
        <Link
          to="/about"
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Learn More +
        </Link>
      </div>
    </section>
  );
};

export default AboutSection;
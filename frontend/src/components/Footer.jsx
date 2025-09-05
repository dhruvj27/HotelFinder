import React from 'react';
import hotelFinderLogoWhiteHorizontal from '/hotelFinderLogoWhiteHorizontal.svg';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-8 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <img src={hotelFinderLogoWhiteHorizontal} alt="HotelFinder Logo" className="h-12 w-auto filter drop-shadow-lg" />
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              HotelFinder is a trusted platform connecting travelers with top hotels across the country. 
              Discover excellence in hospitality with our curated selection of premium accommodations.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="#" 
                className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="#" 
                className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="#" 
                className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              >
                <Linkedin className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-white relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Facilities
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Membership
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-white relative">
              Support
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-all duration-300 text-base flex items-center group">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-white relative">
              Contact Info
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="text-gray-300 text-base">
                  <p className="font-medium">Anandapur</p>
                  <p>Kolkata, West Bengal</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <a href="tel:+1234567890" className="text-gray-300 hover:text-white text-base transition-colors font-medium">
                  +91 12345-67890
                </a>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <a href="mailto:info@hotelfinder.in" className="text-gray-300 hover:text-white text-base transition-colors font-medium">
                  info@hotelfinder.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <div className="flex justify-center mt-16">
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 group"
          >
            <ArrowUp className="w-5 h-5 text-white group-hover:animate-bounce" />
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 backdrop-blur-sm bg-black/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-base font-medium">
              © 2025 HotelFinder. All rights reserved.
            </div>
            <div className="flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-white text-base transition-all duration-300 hover:scale-105">
                Privacy
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-base transition-all duration-300 hover:scale-105">
                Terms
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-base transition-all duration-300 hover:scale-105">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
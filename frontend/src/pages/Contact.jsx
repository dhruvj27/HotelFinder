import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

// Note: Since Redux is mentioned, you could integrate form state with Redux, but for simplicity, using local state here.
// If needed, you can connect this component to Redux store for form management.

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically dispatch a Redux action to send the form data
    // For now, just console log
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 via-purple-800 to-blue-900 bg-clip-text text-transparent mb-6 leading-tight">
            Contact Us
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Have questions or need assistance? Our team is here to help. Reach out to us anytime!
          </p>
        </div>

        {/* Contact Info & Form */}
        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {/* Contact Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-10 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Get in Touch</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-4 shadow-md">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 font-medium">support@sunrisehotels.com</p>
              </div>
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mr-4 shadow-md">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 font-medium">+1 (123) 456-7890</p>
              </div>
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-4 shadow-md">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 font-medium">123 Sunrise Ave, Travel City, USA</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-10 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Send a Message</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 bg-white/80 backdrop-blur-sm hover:border-blue-300"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 bg-white/80 backdrop-blur-sm hover:border-blue-300"
                  required
                />
              </div>
              <div className="relative">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  rows="5"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 bg-white/80 backdrop-blur-sm hover:border-blue-300 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-3" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <p className="text-gray-700 text-lg">
            For more information, visit our{' '}
            <Link 
              to="/about" 
              className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-300 hover:scale-105 inline-block"
            >
              About
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
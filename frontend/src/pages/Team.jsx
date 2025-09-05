import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Phone } from 'lucide-react';

// Team members data with Unsplash images
const teamMembers = [
  {
    name: 'John Doe',
    position: 'CEO & Founder',
    bio: 'Passionate about travel and technology, John leads Sunrise with over 15 years in hospitality.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Michael Johnson',
    position: 'Head of Marketing',
    bio: 'Brings creative strategies to connect travelers with dream destinations.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'David Wilson',
    position: 'Lead Developer',
    bio: 'Builds robust features using React and Tailwind for seamless performance.',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Sarah Brown',
    position: 'Customer Support Lead',
    bio: 'Ensures every user query is handled with care and efficiency.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Robert Taylor',
    position: 'Data Analyst',
    bio: 'Analyzes trends to recommend the best hotels and deals.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Lisa Martinez',
    position: 'Content Creator',
    bio: 'Crafts engaging stories about destinations and hotel experiences.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face',
  },
];

const Team = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 via-purple-800 to-blue-900 bg-clip-text text-transparent mb-6 leading-tight">
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Our dedicated team at HotelFinder is passionate about making your travel experiences unforgettable. 
            We combine expertise in technology, hospitality, and customer service to bring you the best hotel recommendations.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-transparent bg-clip-text font-semibold mb-4 rounded-full border border-blue-200">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {member.position}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-white/20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Team</h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Want to join our team? We're always looking for talented individuals who share our passion for travel and technology!
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl"
            >
              <Users className="w-5 h-5 mr-3" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Phone } from 'lucide-react';

// Placeholder team members data
const teamMembers = [
  {
    name: 'John Doe',
    position: 'CEO & Founder',
    bio: 'Passionate about travel and technology, John leads Sunrise with over 15 years in hospitality.',
    image: 'https://via.placeholder.com/300x300?text=John+Doe',
  },
  {
    name: 'Jane Smith',
    position: 'CTO',
    bio: 'Tech wizard ensuring our platform runs smoothly and innovatively.',
    image: 'https://via.placeholder.com/300x300?text=Jane+Smith',
  },
  {
    name: 'Michael Johnson',
    position: 'Head of Marketing',
    bio: 'Brings creative strategies to connect travelers with dream destinations.',
    image: 'https://via.placeholder.com/300x300?text=Michael+Johnson',
  },
  {
    name: 'Emily Davis',
    position: 'Product Manager',
    bio: 'Focuses on user experience to make hotel booking effortless.',
    image: 'https://via.placeholder.com/300x300?text=Emily+Davis',
  },
  {
    name: 'David Wilson',
    position: 'Lead Developer',
    bio: 'Builds robust features using React and Tailwind for seamless performance.',
    image: 'https://via.placeholder.com/300x300?text=David+Wilson',
  },
  {
    name: 'Sarah Brown',
    position: 'Customer Support Lead',
    bio: 'Ensures every user query is handled with care and efficiency.',
    image: 'https://via.placeholder.com/300x300?text=Sarah+Brown',
  },
  {
    name: 'Robert Taylor',
    position: 'Data Analyst',
    bio: 'Analyzes trends to recommend the best hotels and deals.',
    image: 'https://via.placeholder.com/300x300?text=Robert+Taylor',
  },
  {
    name: 'Lisa Martinez',
    position: 'Content Creator',
    bio: 'Crafts engaging stories about destinations and hotel experiences.',
    image: 'https://via.placeholder.com/300x300?text=Lisa+Martinez',
  },
];

const Team = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our dedicated team at HotelFinder is passionate about making your travel experiences unforgettable. 
            We combine expertise in technology, hospitality, and customer service to bring you the best hotel recommendations.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-4">
            Want to join our team? We're always looking for talented individuals!
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Users className="w-5 h-5 mr-2" />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Team;
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const FeaturedSection = () => {
  const hotels = [
    { name: 'Crystal View Hotel', image: 'https://via.placeholder.com/300x200?text=Crystal+View' },
    { name: 'The Grand Terrace', image: 'https://via.placeholder.com/300x200?text=Grand+Terrace' },
    { name: 'Serenity Bay Inn', image: 'https://via.placeholder.com/300x200?text=Serenity+Bay' },
  ];

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-4">
        <Heart className="w-5 h-5 text-purple-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-900">Explore Best Hotel</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {hotels.map((hotel, index) => (
          <div key={index} className="relative">
            <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover rounded-lg" />
            <div className="absolute top-2 right-2 bg-white rounded-full p-1">
              <Heart className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-gray-900 font-medium mt-2">{hotel.name}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <Link to="/search" className="text-blue-600 hover:text-blue-700">
          View all +
        </Link>
      </div>
    </section>
  );
};

export default FeaturedSection;
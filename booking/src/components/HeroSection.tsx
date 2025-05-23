import React, { useState } from 'react';
import { Search, Calendar, Users } from 'lucide-react';
import DatePicker from './DatePicker';

const HeroSection: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(2);

  return (
    <section className="relative h-[700px] md:h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black">
        <img 
          src="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg" 
          alt="Hotel panorama" 
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex flex-col justify-center">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover great vacation spots
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Find and book the perfect hotel for your vacation with the best prices
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Localtion
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="City, location..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Date Picker */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Check-in / Check-out
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                  >
                    <span className="text-gray-500">22/10 - 25/10/2023</span>
                  </button>
                  <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {showDatePicker && (
                  <div className="absolute z-10 mt-1 w-full">
                    <DatePicker onClose={() => setShowDatePicker(false)} />
                  </div>
                )}
              </div>

              {/* Guests */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Number of guests
                </label>
                <div className="relative">
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} guests
                      </option>
                    ))}
                  </select>
                  <Users size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium text-lg">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
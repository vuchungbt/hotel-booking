import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedHotels from '../components/FeaturedHotels';
import PopularDestinations from '../components/PopularDestinations';
import Promotions from '../components/Promotions';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <FeaturedHotels />
      <PopularDestinations />
      <Promotions />
    </div>
  );
};

export default HomePage;
import React from 'react';
import HeroSection from '../components/HeroSection';
import ExploreSection from '../components/ExploreSection';
import AboutSection from '../components/AboutSection';
import FeaturedSection from '../components/FeaturedSection';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <ExploreSection />
      <AboutSection />
      <FeaturedSection />
    </div>
  );
};

export default Home;
import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoryShowcase from '../components/home/CategoryShowcase';
import Newsletter from '../components/home/Newsletter';

const HomePage = () => {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CategoryShowcase />
      <Newsletter />
    </>
  );
};

export default HomePage;

import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks/HowItWorks';
import OurTeam from './components/OurTeam/OurTeam';
import PricingPlans from './components/PricePlans/PricingPlans';
import ParticlesBackground from './components/ParticlesBackground';

function App() {
  return (
    <div className="App">
      <ParticlesBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <HeroSection />
        <HowItWorks />
        <OurTeam />
        <PricingPlans />
      </div>
    </div>
  );
}

export default App;
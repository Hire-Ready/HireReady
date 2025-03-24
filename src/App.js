import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ParticlesBackground from './components/ParticlesBackground';

function App() {
  return (
    <div className="App">
      <ParticlesBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <HeroSection />
      </div>
    </div>
  );
}

export default App;
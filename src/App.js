import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks/HowItWorks';
import OurTeam from './components/OurTeam/OurTeam';
import PricingPlans from './components/PricePlans/PricingPlans';
import ParticlesBackground from './components/ParticlesBackground';
import HRDashboard from './components/HRDashboard/HRDashboard';
import InterviewSetup from './components/InterviewSetup/InterviewSetup';
import InterviewScreen from './components/InterviewScreen/InterviewScreen';
import FeedbackScreen from './components/FeedbackScreen/FeedbackScreen';

function App() {
  const [step, setStep] = useState('landing'); // Tracks current screen: landing, hr, setup, interview, feedback
  const [interviewConfig, setInterviewConfig] = useState({});
  const [responses, setResponses] = useState([]);

  const handleHRStart = (config) => {
    setInterviewConfig(config);
    setStep('interview');
  };

  const handleCandidateStart = (config) => {
    setInterviewConfig(config);
    setStep('interview');
  };

  const handleFinish = (userResponses) => {
    setResponses(userResponses);
    setStep('feedback');
  };

  const handleBackToLanding = () => {
    setStep('landing');
    setInterviewConfig({});
    setResponses([]);
  };

  return (
    <div className="App">
      <ParticlesBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar onHRClick={() => setStep('hr')} onCandidateClick={() => setStep('setup')} />

        {step === 'landing' && (
          <>
            <HeroSection />
            <HowItWorks />
            <OurTeam />
            <PricingPlans />
          </>
        )}

        {step === 'hr' && <HRDashboard onStart={handleHRStart} onBack={handleBackToLanding} />}
        {step === 'setup' && <InterviewSetup onStart={handleCandidateStart} onBack={handleBackToLanding} />}
        {step === 'interview' && <InterviewScreen config={interviewConfig} onFinish={handleFinish} onBack={handleBackToLanding} />}
        {step === 'feedback' && <FeedbackScreen responses={responses} onBack={handleBackToLanding} />}
      </div>
    </div>
  );
}

export default App;
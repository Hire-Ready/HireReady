import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks/HowItWorks';
import OurTeam from './components/OurTeam/OurTeam';
import PricingPlans from './components/PricePlans/PricingPlans';
import LatestArticles from './components/LatestArticles/LatestArticles';
import FAQs from './components/FAQs/FAQs';
import Contact from './components/Contact/Contact';
import End from './components/end/End';
import ParticlesBackground from './components/ParticlesBackground';
import HRDashboard from './components/HRDashboard/HRDashboard';
import InterviewSetup from './components/InterviewSetup/InterviewSetup';
import InterviewScreen from './components/InterviewScreen/InterviewScreen';
import FeedbackScreen from './components/FeedbackScreen/FeedbackScreen';

function App() {

  const [step, setStep] = useState('landing');
  const [interviewConfig, setInterviewConfig] = useState({});
  const [responses, setResponses] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <ParticlesBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar onHRClick={() => setStep('hr')} onCandidateClick={() => setStep('setup')} />

        {step === 'landing' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <HeroSection />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}>
              <HowItWorks />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}>
              <OurTeam />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}>
              <PricingPlans />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}>
              <LatestArticles />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.0 }}>
              <FAQs />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}>
              <Contact />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.4 }}>
              <End />
            </motion.div>
          </>
        )}

        {step === 'hr' && <HRDashboard onStart={handleHRStart} onBack={handleBackToLanding} />}
        {step === 'setup' && <InterviewSetup onStart={handleCandidateStart} onBack={handleBackToLanding} />}
        {step === 'interview' && <InterviewScreen config={interviewConfig} onFinish={handleFinish} onBack={handleBackToLanding} />}
        {step === 'feedback' && <FeedbackScreen responses={responses} onBack={handleBackToLanding} />}

        {showBackToTop && (
          <button className="back-to-top" onClick={scrollToTop} aria-label="Back to Top">
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
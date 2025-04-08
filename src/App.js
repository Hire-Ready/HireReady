import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
  const [interviewConfig, setInterviewConfig] = React.useState({});
  const [responses, setResponses] = React.useState([]);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  const handleHRStart = (config) => {
    setInterviewConfig(config);
    window.history.pushState(null, '', '/interview');
  };

  const handleCandidateStart = (config) => {
    setInterviewConfig(config);
    window.history.pushState(null, '', '/interview');
  };

  const handleFinish = (userResponses) => {
    setResponses(userResponses);
    window.history.pushState(null, '', '/feedback');
  };

  const handleBackToLanding = () => {
    setInterviewConfig({});
    setResponses([]);
    window.history.pushState(null, '', '/');
  };

  React.useEffect(() => {
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
        <Navbar onHRClick={() => window.history.pushState(null, '', '/hr')} 
               onCandidateClick={() => window.history.pushState(null, '', '/setup')} />

        <Routes>
          <Route path="/" element={
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
          } />
          <Route path="/hr" element={<HRDashboard onStart={handleHRStart} onBack={handleBackToLanding} />} />
          <Route path="/setup" element={<InterviewSetup onStart={handleCandidateStart} onBack={handleBackToLanding} />} />
          <Route path="/interview" element={<InterviewScreen config={interviewConfig} onFinish={handleFinish} onBack={handleBackToLanding} />} />
          <Route path="/feedback" element={<FeedbackScreen responses={responses} onBack={handleBackToLanding} />} />
        </Routes>

        {showBackToTop && (
          <button className="back-to-top" onClick={scrollToTop} aria-label="Back to Top">
            {/* Add your back-to-top icon or text here, e.g., <span>↑</span> */}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
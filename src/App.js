import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StartPracticing from './components/Practise/StartPracticing';
import MockInterview from './components/Practise/MockInterview';
import FeedbackScreen from './components/FeedbackScreen';
import InterviewScreen from './components/InterviewScreen/InterviewScreen';
import ParticlesBackground from './components/ParticlesBackground';

function App() {
  const navigate = useNavigate();
  const [interviewConfig, setInterviewConfig] = React.useState({});
  const [responses, setResponses] = React.useState(null); // Used in feedback route
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  const handleCandidateStart = (config) => {
    setInterviewConfig(config);
    navigate('/interview'); // Used to navigate to interview
  };

  const handleFinish = (userResponses) => {
    setResponses(userResponses);
    navigate('/feedback');
  };

  const handleBackToLanding = () => {
    setInterviewConfig({});
    setResponses(null);
    navigate('/');
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="App">
      <ParticlesBackground />
      <div className="app-content">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <motion.section 
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.5 }}
              >
                <HeroSection />
              </motion.section>
            } />
            <Route path="/start-practicing" element={
              <motion.div 
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.5 }}
              >
                <StartPracticing onStart={handleCandidateStart} />
              </motion.div>
            } />
            <Route path="/mock-interview" element={
              <motion.div 
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.5 }}
              >
                <MockInterview />
              </motion.div>
            } />
            <Route path="/interview" element={
              <motion.div 
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.5 }}
              >
                <InterviewScreen config={interviewConfig} onFinish={handleFinish} onBack={handleBackToLanding} />
              </motion.div>
            } />
            <Route path="/feedback" element={
              <motion.div 
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.5 }}
              >
                <FeedbackScreen responses={responses} />
              </motion.div>
            } />
          </Routes>
        </main>
      </div>

      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop} aria-label="Back to Top">
          <span>↑</span>
        </button>
      )}
    </div>
  );
}

export default App;
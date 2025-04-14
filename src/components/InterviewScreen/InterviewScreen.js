import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InterviewScreen.css';
import { useLocation, useParams } from 'react-router-dom';

function InterviewScreen({ onFinish, onBack, config }) {
  const location = useLocation();
  const { candidateId } = useParams();
  
  // Use data from props, location state, or localStorage
  const { resumeData, jobDescription, employeeCount, role, existingQuestions } = 
    config || location.state || JSON.parse(localStorage.getItem('interviewConfig') || '{}');
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);

  useEffect(() => {
    // Save interview config to localStorage as fallback
    if (location.state) {
      localStorage.setItem('interviewConfig', JSON.stringify(location.state));
    } else if (config) {
      localStorage.setItem('interviewConfig', JSON.stringify(config));
    }
    
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      
      // Use default questions in case we don't get data from the backend
      const defaultQuestions = [
        'Tell me about yourself.',
        'Why do you want this job?',
        'What are your strengths?',
        'What are your weaknesses?',
        'Where do you see yourself in 5 years?'
      ];
      
      if (!resumeData && !jobDescription && !role) {
        console.log('Using default questions due to missing data');
        setQuestions(defaultQuestions);
        setLoading(false);
        return;
      }
      
      const payload = {
        resumeData: resumeData || [],
        jobDescription: jobDescription || 'Not provided',
        employeeCount: employeeCount || 'Not provided',
        role: role || 'Not provided',
        existingQuestions: existingQuestions || ['Tell me about yourself.', 'Why do you want this job?'],
        // If candidateId is provided, include it for resume-specific questions
        ...(candidateId && { candidateId: parseInt(candidateId) - 1 }) // Convert to zero-based index
      };
      
      console.log('Sending request to backend for questions', payload);
      
      try {
        const response = await axios.post('http://localhost:3001/questions', payload);
        console.log('Backend response:', response.data);
        
        if (response.data.questions && Array.isArray(response.data.questions) && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
        } else {
          console.log('No valid questions in response, using defaults');
          setQuestions(defaultQuestions);
        }
        
        // Set candidate info if we have resumeData and candidateId
        if (resumeData && candidateId && parseInt(candidateId) <= resumeData.length) {
          setCandidateInfo(resumeData[parseInt(candidateId) - 1]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load interview questions. Using default questions instead.');
        setQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [resumeData, jobDescription, employeeCount, role, existingQuestions, config, location.state, candidateId]);

  const handleNext = () => {
    setUserAnswers([...userAnswers, answer]);
    setAnswer('');
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Add candidate info to responses if available
      const responsesWithContext = {
        answers: [...userAnswers, answer],
        candidateId: candidateId,
        candidateInfo: candidateInfo,
        role: role
      };
      onFinish(responsesWithContext);
    }
  };

  if (loading) return (
    <div className="interview-screen">
      <h2>Preparing Your Interview{candidateId ? ` #${candidateId}` : ''}...</h2>
      <p>Loading questions tailored for this position...</p>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="interview-screen">
      <h2>
        {candidateInfo?.email ? `Interview for ${candidateInfo.email}` : ''}
        {role ? ` - ${role} Position` : ''}
      </h2>
      <h3>Question {currentQuestion + 1} of {questions.length}</h3>
      
      {error && <p className="error-message">{error}</p>}
      
      <p className="question">{questions[currentQuestion]}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={8}
      />
      <div className="button-group">
        <button 
          onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
          className="back-button"
          disabled={currentQuestion === 0}
        >
          Previous Question
        </button>
        <button onClick={handleNext} className="next-button">
          {currentQuestion + 1 === questions.length ? 'Finish Interview' : 'Next Question'}
        </button>
        <button onClick={onBack} className="cancel-button">Cancel Interview</button>
      </div>
      <div className="progress-indicator">
        {questions.map((_, index) => (
          <span 
            key={index} 
            className={`progress-dot ${index === currentQuestion ? 'active' : index < currentQuestion ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default InterviewScreen;
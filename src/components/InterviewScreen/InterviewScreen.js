import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InterviewScreen.css';
import { useLocation } from 'react-router-dom';

function InterviewScreen({ onFinish, onBack }) {
  const location = useLocation();
  const { resumeData, jobDescription, employeeCount, role, existingQuestions } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load interview questions. Using default questions instead.');
        setQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [resumeData, jobDescription, employeeCount, role, existingQuestions]);

  const handleNext = () => {
    setUserAnswers([...userAnswers, answer]);
    setAnswer('');
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onFinish(userAnswers);
    }
  };

  if (loading) return (
    <div className="interview-screen">
      <h2>Preparing Your Interview...</h2>
      <p>Loading questions tailored for this position...</p>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="interview-screen">
      <h2>Question {currentQuestion + 1} of {questions.length}</h2>
      {error && <p className="error-message">{error}</p>}
      <p className="question">{questions[currentQuestion]}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={8}
      />
      <div className="button-group">
        <button onClick={handleNext} className="next-button">
          {currentQuestion + 1 === questions.length ? 'Finish Interview' : 'Next Question'}
        </button>
        <button onClick={onBack} className="back-button">Back to Home</button>
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
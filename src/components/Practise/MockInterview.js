import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../PricePlanscopy/MockInterview.css';

const MockInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { role, company, experience, cvData } = location.state || {};

  useEffect(() => {
    if (role && company && cvData) {
      fetchQuestions();
    } else {
      setError('Missing job details or CV. Please start over.');
    }
  }, [role, company, cvData]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const jd = `${role} at ${company}, ${experience} years of experience`;
      const response = await axios.post('http://localhost:3001/api/generate-questions', {
        jd,
        cvData
      });
      if (!Array.isArray(response.data.questions)) {
        throw new Error('Invalid questions format received from server');
      }
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to generate questions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const submitAnswers = async () => {
    setLoading(true);
    setError(null);
    try {
      const evaluationPromises = Object.entries(answers).map(async ([index, answer]) => {
        const evalResponse = await axios.post('http://localhost:3001/api/evaluate-answer', {
          answer,
          question: questions[index],
          isAudio: false
        });
        return {
          question: questions[index],
          answer: evalResponse.data.text,
          score: evalResponse.data.score,
          confidenceScore: evalResponse.data.confidenceScore,
          feedback: evalResponse.data.feedback || ''
        };
      });

      const results = await Promise.all(evaluationPromises);
      const totalScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
      setResults({ results, totalScore });
      navigate('/feedback', { state: { results, totalScore } });
    } catch (error) {
      console.error('Error submitting answers:', error);
      setError('Failed to submit answers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/start-practicing');
  };

  return (
    <div className="mock-interview-container">
      <h2>Mock Interview</h2>
      <div className="job-details">
        <p><strong>Role:</strong> {role || 'Not specified'}</p>
        <p><strong>Company:</strong> {company || 'Not specified'}</p>
        <p><strong>Experience:</strong> {experience || 'Not specified'} years</p>
        {cvData && (
          <div>
            <p><strong>CV Skills:</strong> {cvData.skills || 'Not specified'}</p>
            <p><strong>CV Experience:</strong> {cvData.experience || 'Not specified'}</p>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : results ? (
        <div className="results-section">
          <h3>Your Results</h3>
          {results.results.map((result, index) => (
            <div key={index} className="result-box">
              <p><strong>Question:</strong> {result.question}</p>
              <p><strong>Your Answer:</strong> {result.answer}</p>
              <p><strong>Score:</strong> {result.score}/10</p>
              <p><strong>Confidence Score:</strong> {result.confidenceScore}/10</p>
              <p><strong>Feedback:</strong> {result.feedback}</p>
            </div>
          ))}
          <p><strong>Total Score:</strong> {results.totalScore.toFixed(2)}/10</p>
          <button onClick={() => navigate('/')} className="back-button">
            Return to Home
          </button>
        </div>
      ) : questions.length > 0 ? (
        <div className="questions-section">
          {questions.map((question, index) => (
            <div key={index} className="question-box">
              <p>{question}</p>
              <textarea
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
          ))}
          <button onClick={submitAnswers} className="start-interview-btn">
            Submit Answers
          </button>
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      ) : (
        <p>No questions available. Please try again.</p>
      )}
    </div>
  );
};

export default MockInterview;
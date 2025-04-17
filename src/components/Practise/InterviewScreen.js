import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/InterviewScreen.css';

const InterviewScreen = ({ config, onFinish, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/generate-questions', {
        jobDescription: `${config.role} at ${config.company}, ${config.experience} years of experience`,
        resumeData: [config.cvData],
      });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers({ ...answers, [currentQuestionIndex]: value });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onFinish(answers);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!questions.length) return <p>No questions available. Please try again.</p>;

  return (
    <div className="interview-screen">
      <h2>Interview Screen</h2>
      <div className="question-box">
        <p>{questions[currentQuestionIndex]}</p>
        <textarea
          value={answers[currentQuestionIndex] || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
        />
      </div>
      <button onClick={nextQuestion} className="next-btn">
        {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
      </button>
      <button onClick={onBack} className="back-btn">Back</button>
    </div>
  );
};

export default InterviewScreen;
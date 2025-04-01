// src/components/InterviewScreen/InterviewScreen.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InterviewScreen.css';

function InterviewScreen({ config, onFinish, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      const payload = {
        type: config.type,
        difficulty: config.difficulty,
        resumeData: config.resumeData || null,
      };
      const response = await axios.post('http://localhost:3000/questions', payload);
      setQuestions(response.data.questions || ['Tell me about yourself.']);
    };
    fetchQuestions();
  }, [config]);

  const handleNext = () => {
    setUserAnswers([...userAnswers, answer]);
    setAnswer('');
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onFinish(userAnswers);
    }
  };

  if (!questions.length) return <p>Loading questions...</p>;

  return (
    <div className="interview-screen">
      <h2>Question {currentQuestion + 1}</h2>
      <p>{questions[currentQuestion]}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
      />
      <div className="button-group">
        <button onClick={handleNext}>
          {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
        </button>
        <button onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );
}

export default InterviewScreen;
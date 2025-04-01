// src/components/FeedbackScreen/FeedbackScreen.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeedbackScreen.css';

function FeedbackScreen({ responses, onBack }) {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const getFeedback = async () => {
      const response = await axios.post('http://localhost:3000/feedback', { responses });
      setFeedback(response.data.feedback || 'Good effort! Work on clarity.');
    };
    getFeedback();
  }, [responses]);

  return (
    <div className="feedback-screen">
      <h2>Your Feedback</h2>
      <p>{feedback || 'Generating feedback...'}</p>
      <button onClick={onBack}>Back to Home</button>
    </div>
  );
}

export default FeedbackScreen;
// src/components/FeedbackScreen/FeedbackScreen.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeedbackScreen.css';

function FeedbackScreen({ responses, onBack }) {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [errorMessage, setErrorMessage] = useState(''); // Added error state

  useEffect(() => {
    const getFeedback = async () => {
      setIsLoading(true); // Set loading to true
      setErrorMessage(''); // Clear previous errors

      try {
        const response = await axios.post('http://localhost:3000/feedback', { responses });
        setFeedback(response.data.feedback || 'Good effort! Work on clarity.');
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setErrorMessage(
          error.response?.data?.details
            ? `Failed to fetch feedback: ${error.response.data.details}`
            : 'Failed to fetch feedback. Ensure the backend server is running on port 3000.'
        );
      } finally {
        setIsLoading(false); // Set loading to false
      }
    };
    getFeedback();
  }, [responses]);

  return (
    <div className="feedback-screen">
      <h2>Your Feedback</h2>
      {isLoading ? (
        <p>Generating feedback...</p>
      ) : errorMessage ? (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      ) : (
        <p>{feedback}</p>
      )}
      <button onClick={onBack}>Back to Home</button>
    </div>
  );
}

export default FeedbackScreen;
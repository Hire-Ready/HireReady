// src/components/InterviewSetup/InterviewSetup.js
import React, { useState } from 'react';
import './InterviewSetup.css';

function InterviewSetup({ onStart, onBack }) {
  const [type, setType] = useState('behavioral');
  const [difficulty, setDifficulty] = useState('medium');

  const handleSubmit = () => {
    onStart({ type, difficulty });
  };

  return (
    <div className="interview-setup">
      <h2>Setup Your Interview</h2>
      <label>
        Interview Type:
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="behavioral">Behavioral</option>
          <option value="technical">Technical HR</option>
        </select>
      </label>
      <label>
        Difficulty:
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <div className="button-group">
        <button onClick={handleSubmit}>Start Interview</button>
        <button onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );
}

export default InterviewSetup;
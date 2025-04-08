import React from 'react';
import './InterviewSetup.css';

function InterviewSetup({ onStart, onBack }) {
  const [type, setType] = React.useState('technical');
  const [difficulty, setDifficulty] = React.useState('medium');

  const handleStart = () => {
    onStart({ type, difficulty });
  };

  return (
    <div className="interview-setup">
      <h2>Interview Setup</h2>
      <label>
        Type:
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="technical">Technical</option>
          <option value="behavioral">Behavioral</option>
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
        <button onClick={handleStart}>Start Interview</button>
        <button onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );
}

export default InterviewSetup;
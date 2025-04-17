import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CVUpload from './CVUpload';
import '../styles/InterviewSetup.css';

const InterviewSetup = ({ onStart, onBack }) => {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [cvData, setCvData] = useState(null);
  const navigate = useNavigate();

  const handleUploadSuccess = (data) => {
    setCvData(data);
  };

  const handleStart = () => {
    if (!role || !company || !cvData) {
      alert('Please fill in all fields and upload a CV.');
      return;
    }
    onStart({ role, company, experience, cvData });
    navigate('/interview');
  };

  return (
    <div className="interview-setup">
      <h2>Interview Setup</h2>
      <div className="form-group">
        <label>Job Role:</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Software Engineer"
        />
      </div>
      <div className="form-group">
        <label>Company:</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., Google"
        />
      </div>
      <div className="form-group">
        <label>Years of Experience:</label>
        <input
          type="number"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="e.g., 3"
        />
      </div>
      <CVUpload onUploadSuccess={handleUploadSuccess} />
      <button onClick={handleStart} className="start-btn">Start Interview</button>
      <button onClick={onBack} className="back-btn">Back</button>
    </div>
  );
};

export default InterviewSetup;
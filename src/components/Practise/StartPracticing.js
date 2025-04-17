import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CVUpload from '../Practise/CVUploads';
import '../PricePlanscopy/StartPracticing.css';

const StartPracticing = () => {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [cvData, setCvData] = useState(null);
  const navigate = useNavigate();

  const handleUploadSuccess = (data) => {
    setCvData(data);
  };

  const handleStartInterview = async () => {
    if (!role || !company || !cvData) {
      alert('Please fill in all fields and upload a CV.');
      return;
    }
    try {
      navigate('/mock-interview', {
        state: { role, company, experience, cvData }
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview.');
    }
  };

  return (
    <div className="start-practicing">
      <h2>Start Practicing Today</h2>
      <p>Upload your CV and enter job details to begin your mock interview.</p>
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
      <button className="practice-button" onClick={handleStartInterview}>
        Start Mock Interview
      </button>
    </div>
  );
};

export default StartPracticing;
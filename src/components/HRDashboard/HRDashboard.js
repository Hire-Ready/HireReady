import React, { useState } from 'react';
import axios from 'axios';
import './HRDashboard.css';

function HRDashboard({ onStart, onBack }) {
  const [resumes, setResumes] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [employeeCount, setEmployeeCount] = useState('1');
  const [role, setRole] = useState(''); // ✅ Added missing role state

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setResumes(files);
    setParsedData([]);
    setIsParsed(false);
    setErrorMessage('');
  };

  const handleParse = async () => {
    if (!resumes.length) return;
    setErrorMessage('');
    setIsLoading(true);
    const formData = new FormData();
    resumes.forEach((resume) => {
      formData.append('resumes', resume);
    });
    try {
      const response = await axios.post('http://localhost:3001/upload-resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setParsedData(response.data.resumeData);
      setIsParsed(true);
    } catch (error) {
      console.error('Error uploading resumes:', error);
      setErrorMessage(
        error.response?.data?.details
          ? `Failed to parse resumes: ${error.response.data.details}`
          : 'Failed to parse resumes. Please ensure the backend server is running on port 3001.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    onStart({ resumeData: parsedData, jobDescription, employeeCount, role });
  };

  const handlePaste = () => {
    navigator.clipboard.readText()
      .then(text => setJobDescription(text))
      .catch(err => {
        console.error('Failed to paste: ', err);
        setErrorMessage('Failed to paste from clipboard');
      });
  };

  const handleEmployeeCountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 1 && !isNaN(value))) {
      setEmployeeCount(value);
    }
  };

  return (
    <div className="hr-dashboard">
      <h2>HR Dashboard</h2>

      <label>
        Job Description:
        <div className="job-description-wrapper">
          <textarea
            className="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter or paste job description here..."
          />
          <button className="paste-button" onClick={handlePaste}>Paste</button>
        </div>
      </label>

      <label>
        Role:
        <div className="role">
          <textarea
            className="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Enter the role.."
          />
        </div>
      </label>

      <label>
        Number of Employees Required:
        <input
          type="number"
          className="employee-count"
          value={employeeCount}
          onChange={handleEmployeeCountChange}
          min="1"
          placeholder="e.g., 5"
        />
      </label>

      <label>
        Upload Resumes:
        <input type="file" multiple accept=".pdf" onChange={handleFileUpload} />
      </label>
      <p>{resumes.length} resume(s) selected</p>

      <div className="button-group">
        <button onClick={handleParse} disabled={!resumes.length || isLoading}>
          {isLoading ? (<><span className="spinner"></span> Parsing...</>) : 'Parse Resumes'}
        </button>
        <button onClick={onBack}>Back to Home</button>
      </div>

      {errorMessage && (
        <div className="error-message">
          <p style={{ color: 'red' }}>{errorMessage}</p>
        </div>
      )}

      {isParsed && (
        <div className="parsed-data">
          <h3>Parsed Resume Data</h3>
          {parsedData.length > 0 ? (
            parsedData.map((data, index) => (
              <div key={index} className="resume-data">
                <h4>Resume {index + 1}</h4>
                <pre>{typeof data === 'object' ? JSON.stringify(data, null, 2) : data}</pre>
              </div>
            ))
          ) : (
            <p>No data parsed.</p>
          )}
          <button onClick={handleProceed}>Proceed to Interview</button>
        </div>
      )}
    </div>
  );
}

export default HRDashboard;
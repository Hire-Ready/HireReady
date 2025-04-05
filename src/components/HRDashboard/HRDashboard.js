import React, { useState } from 'react';
import axios from 'axios';
import './HRDashboard.css';

function HRDashboard({ onBack, onStart }) {
  const [resumes, setResumes] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [employeeCount, setEmployeeCount] = useState('1');

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setResumes(files);
    setParsedData([]);
    setIsParsed(false);
    setErrorMessage('');
  };

  const handleParse = async () => {
    setErrorMessage('');
    setIsLoading(true);
    const formData = new FormData();
    resumes.forEach((resume) => formData.append('resumes', resume));

    try {
      const response = await axios.post('http://localhost:3000/upload-resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setParsedData(response.data.resumeData);
      setIsParsed(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.details
          ? `Failed to parse resumes: ${error.response.data.details}`
          : 'Failed to parse resumes. Ensure the backend server is running on port 3000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    onStart({ resumeData: parsedData, jobDescription, employeeCount });
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

        {isParsed && parsedData.length > 0 && (
          <button onClick={handleProceed}>Proceed</button>
        )}

        <button onClick={onBack}>Back to Home</button>
      </div>

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      {isParsed && (
        <div className="parsed-data">
          <h3>Parsed Resume Data</h3>
          {parsedData.length > 0 ? (
            parsedData.map((data, index) => (
              <div key={index} className="resume-data">
                <h4>Resume {index + 1}</h4>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            ))
          ) : (
            <p>No data parsed.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HRDashboard;

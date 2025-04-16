import React, { useState } from 'react';
import axios from 'axios';
import './StudentDashboard.css';

function StudentDashboard({ onStart, onBack }) {
  const [resumes, setResumes] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      console.error('Error uploading student resumes:', error);
      setErrorMessage(
        error.response?.data?.details
          ? `Failed to parse student resumes: ${error.response.data.details}`
          : 'Failed to parse student resumes. Ensure the backend server is running on port 3000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    onStart({ resumeData: parsedData });
  };

  return (
    <div className="student-dashboard">
      <h2>Student Dashboard</h2>
      <label>
        Upload Student Resumes:
        <input type="file" multiple accept=".pdf" onChange={handleFileUpload} />
      </label>
      <p>{resumes.length} resume(s) selected</p>

      <div className="button-group">
        <button onClick={handleParse} disabled={!resumes.length || isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span> Parsing...
            </>
          ) : (
            'Parse Resumes'
          )}
        </button>
        <button onClick={onBack}>Back to Home</button>
      </div>

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      {isParsed && (
        <div className="student-data">
          <h3>Parsed Student Data</h3>
          {parsedData.length > 0 ? (
            parsedData.map((data, index) => (
              <div key={index} className="student-item">
                <h4>Student Resume {index + 1}</h4>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            ))
          ) : (
            <p>No data parsed.</p>
          )}
          <button onClick={handleProceed} disabled={!parsedData.length}>
            Proceed to Review
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
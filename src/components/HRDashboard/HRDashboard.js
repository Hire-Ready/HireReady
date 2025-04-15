import React, { useState } from 'react';
import axios from 'axios';
import './HRDashboard.css';
import { useNavigate } from 'react-router-dom';

function HRDashboard({ onStart, onBack }) {
  const [resumes, setResumes] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [employeeCount, setEmployeeCount] = useState('1');
  const [role, setRole] = useState('');
  const [existingQuestions, setExistingQuestions] = useState(['Tell me about yourself.', 'Why do you want this job?']);
  const [interviewTime, setInterviewTime] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);
  const navigate = useNavigate();

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
      setParsedData(response.data.resumeData || []);
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

      <label>
        Existing Questions (one per line):
        <textarea
          className="existing-questions"
          value={existingQuestions.join('\n')}
          onChange={handleExistingQuestionsChange}
          placeholder="Enter existing questions here (one per line)..."
        />
      </label>

      {isParsed && (
        <label>
          Interview Date and Time:
          <input
            type="datetime-local"
            value={interviewTime}
            onChange={(e) => setInterviewTime(e.target.value)}
            className="interview-time"
          />
        </label>
      )}

      <div className="button-group">
        <button onClick={handleParse} disabled={!resumes.length || isLoading}>
          {isLoading ? (<><span className="spinner"></span> Parsing...</>) : 'Parse Resumes'}
        </button>
        <button onClick={onBack}>Back to Home</button>
        <button onClick={goToInterviewScreen} disabled={!isParsed || !jobDescription || !role}>
          Interview Screen
        </button>
        <button onClick={onBack}>Back to Home</button> {/* Back Button */}
      </div>

      {errorMessage && (
        <div className="error-message">
          <p style={{ color: 'red' }}>{errorMessage}</p>
        </div>
      )}

      {emailStatus && (
        <div className={`email-status ${emailStatus.success ? 'success' : 'error'}`}>
          <h4>{emailStatus.success ? 'Email Sent Successfully' : 'Email Sending Failed'}</h4>
          <p>{emailStatus.message}</p>
          {emailStatus.details && (
            <div className="email-details">
              {emailStatus.details.map((result, idx) => (
                <p key={idx}>
                  {result.success 
                    ? `✓ Email sent to ${result.email}`
                    : `✗ Failed: ${result.error}`
                  }
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {isParsed && (
        <div className="parsed-data">
          <h3>Parsed Resume Data</h3>
          {parsedData.length > 0 ? (
            parsedData.map((data, index) => (
              <div key={index} className="resume-data">
                <h4>Resume {index + 1} {data.email ? `(${data.email})` : ''}</h4>
                <pre>{typeof data === 'object' ? JSON.stringify(data, null, 2) : data}</pre>
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
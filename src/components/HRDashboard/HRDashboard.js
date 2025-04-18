import React, { useState } from 'react';
import axios from 'axios';
import './HRDashboard.css';
import { useNavigate } from 'react-router-dom';

function ProgressTracker({ steps, currentStep }) {
  return (
    <div className="progress-tracker">
      <div className="progress-cards">
        {steps.map((step, index) => (
          <div key={index} className={`progress-card ${index === currentStep ? 'current' : ''}`}>
            <div className="step-circle">
              {index + 1}
            </div>
            <div className="step-label">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HRDashboard({ onBack }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form states
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [employeeCount, setEmployeeCount] = useState('1');
  const [role, setRole] = useState('');
  const [existingQuestions, setExistingQuestions] = useState(['Tell me about yourself.', 'Why do you want this job?']);
  const [interviewTime, setInterviewTime] = useState('');
  
  // Process states
  const [parsedData, setParsedData] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Define all steps (removed "Parse Resumes")
  const steps = [
    {
      title: "Upload Resumes",
      isCompleted: () => resumes.length > 0 && isParsed,
      component: (
        <div className="step-content">
          <h3>Upload Resumes</h3>
          <div className="upload-box">
            <label className="file-upload-label">
              <span className="upload-icon">📁</span>
              <span>Upload Candidate Resumes</span>
              <input type="file" multiple accept=".pdf" onChange={handleFileUpload} className="file-input" />
            </label>
            <p>{resumes.length} resume(s) selected{isParsed ? ' (Parsed)' : ''}</p>
            {errorMessage && <div className="error-message"><p>{errorMessage}</p></div>}
          </div>
        </div>
      )
    },
    {
      title: "Enter Job Details",
      isCompleted: () => jobDescription.trim() !== '' && role.trim() !== '',
      component: (
        <div className="step-content">
          <h3>Enter Job Details</h3>
          <div className="job-details">
            <label>
              Role Title:
              <input
                type="text"
                className="role-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Frontend Developer"
              />
            </label>

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
              Number of Positions:
              <input
                type="number"
                className="employee-count"
                value={employeeCount}
                onChange={handleEmployeeCountChange}
                min="1"
                placeholder="e.g., 5"
              />
            </label>
          </div>
        </div>
      )
    },
    {
      title: "Schedule Interview",
      isCompleted: () => interviewTime !== '',
      component: (
        <div className="step-content">
          <h3>Schedule Interview</h3>
          <p>Set the date and time for the AI mock interviews.</p>
          <label>
            Interview Date and Time:
            <input
              type="datetime-local"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              className="interview-time"
            />
          </label>
        </div>
      )
    },
    {
      title: "Send Invites",
      isCompleted: () => emailStatus !== null && emailStatus.success,
      component: (
        <div className="step-content">
          <h3>Send Interview Invites</h3>
          <p>Send automated email invitations to all candidates for their AI mock interviews.</p>
          <button 
            onClick={sendInterviewInvites} 
            disabled={isLoading}
            className="primary-button action-button send-invites-button"
          >
            {isLoading ? (<><span className="spinner"></span> Sending...</>) : 'Send Interview Invites'}
          </button>
          
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
        </div>
      )
    },
    {
      title: "View Results",
      isCompleted: () => true,
      component: (
        <div className="step-content">
          <h3>Interview Setup Complete</h3>
          <p>All candidates have been invited to their AI mock interviews.</p>
          <div className="parsed-data">
            <h4>Candidate Summary</h4>
            <div className="resume-grid">
              {parsedData.length > 0 ? (
                parsedData.map((data, index) => (
                  <div key={index} className="resume-card">
                    <h4>Candidate {index + 1}</h4>
                    <p>Email: {data.email || 'N/A'}</p>
                    <p>Name: {data.name || 'N/A'}</p>
                    <details>
                      <summary>View Details</summary>
                      <pre>{typeof data === 'object' ? JSON.stringify(data, null, 2) : data}</pre>
                    </details>
                  </div>
                ))
              ) : (
                <p>No data parsed.</p>
              )}
            </div>
            <button 
              onClick={goToInterviewScreen} 
              className="primary-button action-button"
            >
              Preview AI Interview
            </button>
          </div>
        </div>
      )
    }
  ];

  function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setResumes(files);
    setIsLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    files.forEach((resume) => {
      formData.append('resumes', resume);
    });

    axios.post('http://localhost:3001/upload-resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(response => {
      setParsedData(response.data.resumeData || []);
      setIsParsed(true);
    })
    .catch(error => {
      console.error('Error uploading resumes:', error);
      setErrorMessage(
        error.response?.data?.details
          ? `Failed to parse resumes: ${error.response.data.details}`
          : 'Failed to parse resumes. Please ensure the backend server is running on port 3001.'
      );
      setIsParsed(false);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }

  function handleParse() {
    // This function is no longer needed as parsing is handled in handleFileUpload
  }

  function handlePaste() {
    navigator.clipboard.readText()
      .then(text => {
        setJobDescription(text);
      })
      .catch(err => {
        console.error('Failed to paste: ', err);
        setErrorMessage('Failed to paste from clipboard');
      });
  }

  function handleEmployeeCountChange(e) {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 1 && !isNaN(value))) {
      setEmployeeCount(value);
    }
  }

  function sendInterviewInvites() {
    if (!isParsed || !interviewTime || !role) {
      setErrorMessage('Please parse resumes, enter interview time, and role before sending invites.');
      return;
    }

    setIsLoading(true);
    
    axios.post('http://localhost:3001/send-interview-invites', {
      candidates: parsedData,
      interviewTime,
      role
    })
    .then(response => {
      setEmailStatus({
        success: true,
        message: `Successfully sent interview invitations to ${response.data.results.filter(r => r.success).length} candidates.`,
        details: response.data.results
      });
    })
    .catch(error => {
      console.error('Error sending interview invites:', error);
      setEmailStatus({
        success: false,
        message: 'Failed to send interview invitations. Please try again.',
        error: error.response?.data?.error || error.message
      });
    })
    .finally(() => {
      setIsLoading(false);
    });
  }

  function goToInterviewScreen() {
    if (isParsed && jobDescription && role) {
      navigate('/interview', { 
        state: { 
          resumeData: parsedData, 
          jobDescription, 
          employeeCount, 
          role,
          existingQuestions
        } 
      });
    } else {
      setErrorMessage('Please parse resumes, enter job description, and role before proceeding.');
    }
  }

  function goToNextStep() {
    const currentStepObj = steps[currentStep];
    if (currentStepObj.isCompleted()) {
      setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
    } else {
      setErrorMessage(`Please complete the "${currentStepObj.title}" step before proceeding.`);
    }
  }

  function goToPreviousStep() {
    setCurrentStep(Math.max(currentStep - 1, 0));
    setErrorMessage('');
  }

  return (
    <div className="hr-dashboard">
      <a href="#" onClick={onBack} className="back-link">← Back to Job Posting</a>
      <h2>AI Mock Interview Setup</h2>
      
      <ProgressTracker steps={steps} currentStep={currentStep} />
      
      <div className="step-container">
        {steps[currentStep].component}
        
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
        
        <div className="navigation-buttons">
          {currentStep > 0 && (
            <button onClick={goToPreviousStep} className="secondary-button">
              Back
            </button>
          )}
          
          {currentStep === 0 && (
            <button onClick={onBack} className="secondary-button">
              Back to Home
            </button>
          )}
          
          {currentStep < steps.length - 1 && (
            <button 
              onClick={goToNextStep} 
              className="primary-button"
              disabled={!steps[currentStep].isCompleted()}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;
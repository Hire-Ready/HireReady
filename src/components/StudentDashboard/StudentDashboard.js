import React, { useState } from 'react';
import './StudentDashboard.css';

const StudentDashboard = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError('');
  };

  const handleParseResume = async () => {
    if (!file) {
      setError('Please upload a resume file first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Simulate API call to parse resume (replace with actual backend endpoint)
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve({ data: { text: 'Parsed resume content for testing' } }), 2000)
      );
      setParsedData(response.data.text);
    } catch (err) {
      setError('Failed to parse resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (parsedData && jobDescription.trim() && role.trim()) {
      // Simulate proceeding to review with job description, role, and resume data
      console.log({ parsedData, jobDescription, role });
      // Add navigation or further logic (e.g., to mock interview based on your AI project)
    } else {
      setError('Please fill in the job description, role, and parse the resume.');
    }
  };

  return (
    <div className="student-dashboard">
      <button className="back-button" onClick={onBack}>Back to Home</button>
      <h2>Student Dashboard</h2>
      <div className="dashboard-content">
        <div className="input-section">
          <h3>Prepare for Your Interview</h3>
          <p>Upload your resume and specify your target job to get tailored feedback.</p>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          <button onClick={handleParseResume} disabled={loading}>
            {loading ? 'Parsing...' : 'Parse Resume'}
          </button>
          <textarea
            placeholder="Enter Job Description (e.g., responsibilities, skills required)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Role (e.g., Software Engineer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          {parsedData && (
            <div className="parsed-data">
              <h3>Parsed Resume Data</h3>
              <p>{parsedData}</p>
            </div>
          )}
          <div className="button-group">
            <button onClick={handleProceed} disabled={!parsedData || !jobDescription.trim() || !role.trim()}>
              Proceed to Review
            </button>
            <button className="back-button" onClick={onBack}>Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
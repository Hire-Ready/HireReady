import React, { useState } from 'react';
import axios from 'axios';
import './InterviewSetup.css';

const InterviewSETUP = () => {
  const [resumeData, setResumeData] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [errorMessage, setErrorMessage] = useState(''); // Added error state

  const handleResumeUpload = async (event) => {
    const files = event.target.files;
    const formData = new FormData();
    for (let file of files) {
      formData.append('resumes', file);
    }

    try {
      const response = await axios.post('http://localhost:3000/upload-resumes', formData);
      setResumeData(response.data.resumeData);
      setErrorMessage(''); // Clear error on successful upload
    } catch (error) {
      console.error('Error uploading resumes:', error);
      setErrorMessage(
        error.response?.data?.details
          ? `Failed to upload resumes: ${error.response.data.details}`
          : 'Failed to upload resumes. Ensure the backend server is running on port 3000.'
      );
    }
  };

  const handleGenerateQuestions = async () => {
    if (!resumeData.length || !jobDescription) {
      setErrorMessage('Please upload resumes and provide a job description.');
      return;
    }

    setIsLoading(true); // Set loading to true
    setErrorMessage(''); // Clear previous errors

    try {
      const response = await axios.post('http://localhost:3000/questions', {
        type: 'behavioral',
        difficulty: 'medium',
        resumeData,
        jobDescription,
      });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      setErrorMessage(
        error.response?.data?.details
          ? `Failed to generate questions: ${error.response.data.details}`
          : 'Failed to generate questions. Check your inputs or backend server.'
      );
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div className="interview-setup">
      <h1>Interview Setup</h1>
      <label>
        Upload Resumes:
        <input type="file" multiple onChange={handleResumeUpload} />
      </label>
      <label>
        Enter Job Description:
        <textarea
          placeholder="Enter Job Description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </label>
      <div className="button-group">
        <button onClick={handleGenerateQuestions} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      {questions.length > 0 && (
        <div>
          {questions.map((question, index) => (
            <p key={index}>{question}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewSETUP;
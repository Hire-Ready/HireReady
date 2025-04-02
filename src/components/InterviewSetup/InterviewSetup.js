import React, { useState } from 'react';
import axios from 'axios';
import './InterviewSetup.css';

const InterviewSETUP = () => {
  const [resumeData, setResumeData] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);

  const handleResumeUpload = async (event) => {
    const files = event.target.files;
    const formData = new FormData();
    for (let file of files) {
      formData.append('resumes', file);
    }

    const response = await axios.post('http://localhost:3000/upload-resumes', formData);
    setResumeData(response.data.resumeData);
  };

  const handleGenerateQuestions = async () => {
    const response = await axios.post('http://localhost:3000/questions', {
      type: 'behavioral',
      difficulty: 'medium',
      resumeData,
      jobDescription,
    });
    setQuestions(response.data.questions);
  };

  return (
    <div className="interview-setup">
      <h1>Interview Setup</h1>
      <input type="file" multiple onChange={handleResumeUpload} />
      <textarea
        placeholder="Enter Job Description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <button onClick={handleGenerateQuestions}>Generate Questions</button>
      <div>
        {questions.map((question, index) => (
          <p key={index}>{question}</p>
        ))}
      </div>
    </div>
  );
};

export default InterviewSETUP;
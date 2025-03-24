import React, { useState } from 'react';
import axios from 'axios';
import '.Resume/ResumeUploader.css';

function ResumeUploader() {
  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 


  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  
  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one resume.');
      return;
    }

    setIsLoading(true); 
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('resumes', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/parse-resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setParsedData(response.data);
    } catch (error) {
      console.error('Error uploading resumes:', error);
      alert('An error occurred while parsing resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resume-uploader">
      <h2>Upload Resumes for Parsing</h2>
      <div className="upload-section">
        <input
          type="file"
          multiple
          accept=".pdf,.txt"
          onChange={handleFileChange}
          className="file-input"
        />
        <button onClick={handleUpload} className="upload-button" disabled={isLoading}>
          {isLoading ? 'Parsing...' : 'Parse Resumes'}
        </button>
      </div>

      {}
      {parsedData.length > 0 && (
        <div className="parsed-data">
          <h3>Parsed Resume Data</h3>
          {parsedData.map((resume, index) => (
            <div key={index} className="resume-card">
              <h4>{resume.filename}</h4>
              <p>
                <strong>Skills:</strong> {resume.skills.join(', ')}
              </p>
              <p>
                <strong>Experience:</strong> {resume.experience || 'Not specified'}
              </p>
              <p>
                <strong>Education:</strong> {resume.education || 'Not specified'}
              </p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeUploader;
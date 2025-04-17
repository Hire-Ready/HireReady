import React, { useState } from 'react';
import axios from 'axios';
import "../PricePlanscopy/CVUpload.css";

const CVUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resumes', file); // Matches backend expectation

    try {
      const response = await axios.post('http://localhost:3001/api/upload-resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadSuccess(response.data.resumeData[0]); // Single CV case
    } catch (err) {
      setError('Failed to upload CV: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="cv-upload">
      <h3>Upload Your CV (PDF)</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {error && <p className="error-message">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload CV'}
      </button>
    </div>
  );
};

export default CVUpload;
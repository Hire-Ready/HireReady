require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { generateQuestions } = require('./ai/ollamaClient'); // Import the AI client
const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
}));

// Check if email credentials exist
const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Configure email handling - either real or mock
let sendEmail;

if (hasEmailCredentials) {
  console.log('Email credentials found. Using real email sending.');
  // Real email sending using nodemailer
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  // Function to send real emails
  sendEmail = async (mailOptions) => {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };
} else {
  console.log('⚠️ NO EMAIL CREDENTIALS FOUND! Email sending will be simulated.');
  
  // Mock email sending function that just logs
  sendEmail = async (mailOptions) => {
    console.log('');
    console.log('📧 MOCK EMAIL SENDING (credentials not configured)');
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    console.log('📧 Content would be sent if credentials were configured.');
    console.log('');
    
    // Simulate a delay to mimic real email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a success response
    return { 
      success: true, 
      messageId: 'mock-email-' + Date.now(),
      simulated: true
    };
  };
}

// Extract email from resume text using regex
function extractEmailFromResume(resumeText) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = resumeText.match(emailRegex);
  return matches ? matches[0] : null;
}

app.post('/upload-resumes', upload.array('resumes'), async (req, res) => {
  try {
    const resumeData = await Promise.all(
      req.files.map(async (file) => {
        const fileBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(fileBuffer);
        let extractedText = pdfData.text;
        if (!extractedText || extractedText.trim().length < 50) {
          const ocrResult = await Tesseract.recognize(file.path, 'eng');
          extractedText = ocrResult.data.text;
        }
        
        // Extract email from the resume
        const email = extractEmailFromResume(extractedText);
        
        fs.unlinkSync(file.path);
        return {
          text: extractedText,
          email: email
        };
      })
    );
    res.json({ resumeData });
  } catch (error) {
    console.error('Error processing resumes:', error);
    res.status(500).json({ error: 'Failed to process resumes' });
  }
});

app.post('/send-interview-invites', async (req, res) => {
  const { candidates, interviewTime, role } = req.body;
  
  try {
    console.log(`Processing interview invites for ${candidates.length} candidates`);
    
    const results = await Promise.all(candidates.map(async (candidate, index) => {
      if (!candidate.email) {
        console.log(`No email found for candidate ${index + 1}`);
        return { 
          success: false,
          error: `No email found for candidate ${index + 1}` 
        };
      }
      
      // Generate unique interview link with candidate ID
      const interviewLink = `http://localhost:3000/interview/${index + 1}`;
      
      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER || 'chinmay7016@gmail.com',
        to: candidate.email,
        subject: `Interview Invitation for ${role} Position`,
        html: `
          <h2>Interview Invitation</h2>
          <p>Dear Candidate,</p>
          <p>We are pleased to invite you for an interview for the <strong>${role}</strong> position.</p>
          <p>Please join the interview using the following link:</p>
          <p><a href="${interviewLink}">${interviewLink}</a></p>
          <p>Interview Date and Time: ${interviewTime}</p>
          <p>We look forward to speaking with you!</p>
          <p>Best regards,<br>HR Team</p>
        `
      };
      
      try {
        console.log(`Sending invite to ${candidate.email}`);
        // Use our sendEmail function (either real or mock)
        const info = await sendEmail(mailOptions);
        return { 
          success: true, 
          email: candidate.email,
          messageId: info.messageId,
          simulated: !hasEmailCredentials
        };
      } catch (emailError) {
        console.error(`Error sending email to ${candidate.email}:`, emailError);
        return {
          success: false,
          email: candidate.email,
          error: emailError.message
        };
      }
    }));
    
    console.log(`Processed ${results.length} invites. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);
    
    res.json({ results });
  } catch (error) {
    console.error('Error sending interview invites:', error);
    res.status(500).json({ error: 'Failed to send interview invitations' });
  }
});

app.post('/questions', async (req, res) => {
  console.log('Received request for questions');
  const { resumeData, jobDescription, employeeCount, role, existingQuestions, candidateId } = req.body;
  const safeResumeData = Array.isArray(resumeData) ? resumeData : [];
  const safeExistingQuestions = Array.isArray(existingQuestions) ? existingQuestions : [];
  
  try {
    console.log('Generating questions with parameters:', {
      jobDescription: jobDescription?.substring(0, 50) + '...' || 'Not provided',
      employeeCount: employeeCount || 'Not provided',
      role: role || 'Not provided',
      resumeDataCount: safeResumeData.length,
      existingQuestionsCount: safeExistingQuestions.length,
      candidateId: candidateId !== undefined ? candidateId : 'Not provided'
    });

    // If candidateId is provided, use the specific resume for that candidate
    const targetResume = candidateId !== undefined && candidateId < safeResumeData.length 
      ? [safeResumeData[candidateId]]
      : safeResumeData;
    
    const questions = await generateQuestions({
      jobDescription: jobDescription || 'Not provided',
      employeeCount: employeeCount || 'Not provided',
      role: role || 'Not provided',
      resumeData: targetResume,
      existingQuestions: safeExistingQuestions,
    });
    
    console.log('Questions generated successfully:', questions);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions with Ollama:', error);
    res.status(500).json({
      error: 'Failed to generate questions',
      questions: ['Tell me about yourself.', 'Why do you want this job?', 'What are your strengths?', 'What are your weaknesses?', 'Where do you see yourself in 5 years?']
    });
  }
});

app.post('/feedback', (req, res) => {
  const { responses, candidateId, candidateInfo } = req.body;
  
  // You can customize the feedback based on candidate info if available
  const feedback = candidateInfo 
    ? `Thank you for your interview for the position. We'll review your responses and get back to you at ${candidateInfo.email}.`
    : 'Thank you for completing the interview. We will review your responses and contact you shortly.';
  
  res.json({ feedback });
});

// Simple test endpoint to check connectivity with Ollama
app.get('/test-ollama', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    res.json({ status: 'success', models: response.data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}. Access at http://localhost:${PORT}`));
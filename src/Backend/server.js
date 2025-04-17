require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer'); // Import multer
const nodemailer = require('nodemailer'); // Importing nodemailer
const pdfParse = require('pdf-parse'); // Importing pdf-parse
const fs = require('fs'); // Importing fs
const uploadRoutes = require('./routes/uploadRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const questionRoutes = require('./routes/questionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const questionsCache = new Map();
const expectedAnswersCache = new Map();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  }
});
const upload = multer({ storage }); 

app.use('/api', uploadRoutes);
app.use('/api', interviewRoutes);
app.use('/api', questionRoutes);
app.use('/api', feedbackRoutes);

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

let sendEmail;

if (hasEmailCredentials) {
  console.log('Email credentials found. Using real email sending.');
  
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
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
  
  sendEmail = async (mailOptions) => {
    console.log('');
    console.log('📧 MOCK EMAIL SENDING (credentials not configured)');
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    console.log('📧 Content would be sent if credentials were configured.');
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
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



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}. Access at http://localhost:${PORT}`));


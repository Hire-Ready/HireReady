const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Create uploads directory if it doesn’t exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Match React frontend port

// Endpoint to handle resume uploads
app.post('/upload-resumes', upload.array('resumes'), async (req, res) => {
  try {
    const resumeData = await Promise.all(
      req.files.map(async (file) => {
        const fileBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(fileBuffer);
        let extractedText = pdfData.text;

        // If extraction is poor, use Tesseract OCR
        if (!extractedText || extractedText.trim().length < 50) {
          const ocrResult = await Tesseract.recognize(file.path, 'eng', {
            logger: (m) => console.log(m),
          });
          extractedText = ocrResult.data.text;
        }

        // Clean up uploaded file
        fs.unlinkSync(file.path);
        return extractedText;
      })
    );
    res.json({ resumeData });
  } catch (error) {
    console.error('Error processing resumes:', error);
    res.status(500).json({ error: 'Failed to process resumes' });
  }
});

// Endpoint to generate questions
app.post('/questions', (req, res) => {
  const { type, difficulty, resumeData } = req.body;
  const questions = resumeData
    ? resumeData.map((resume) => `Tell me about your experience mentioned in your resume: ${resume.slice(0, 100)}...`)
    : ['Tell me about yourself.', 'Why do you want this job?'];
  res.json({ questions });
});

// Endpoint to generate feedback
app.post('/feedback', (req, res) => {
  const { responses } = req.body;
  const feedback = responses.length > 0 ? 'Your answers were detailed, but try to be more concise.' : 'Please provide more detailed answers.';
  res.json({ feedback });
});

app.listen(5000, () => console.log('Server running on port 5000'));
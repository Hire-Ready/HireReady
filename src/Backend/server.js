require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const cors = require('cors');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// Enable CORS for frontend (React on port 3000)
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

// Endpoint to handle resume uploads
app.post('/upload-resumes', upload.array('resumes'), async (req, res) => {
  try {
    const resumeData = await Promise.all(
      req.files.map(async (file) => {
        const fileBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(fileBuffer);
        let extractedText = pdfData.text;

        // Fallback to Tesseract if text extraction is poor
        if (!extractedText || extractedText.trim().length < 50) {
          const ocrResult = await Tesseract.recognize(file.path, 'eng');
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

// Endpoint to generate interview questions
app.post('/questions', (req, res) => {
  const { resumeData } = req.body;
  const questions = resumeData
    ? resumeData.map(
        (resume) =>
          `Tell me about your experience mentioned in your resume: ${resume.slice(0, 100)}...`
      )
    : ['Tell me about yourself.', 'Why do you want this job?'];

  res.json({ questions });
});

// Endpoint to generate feedback
app.post('/feedback', (req, res) => {
  const { responses } = req.body;
  const feedback =
    responses.length > 0
      ? 'Your answers were detailed, but try to be more concise.'
      : 'Please provide more detailed answers.';
  res.json({ feedback });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

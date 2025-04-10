// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const cors = require('cors');
const { generateQuestions } = require('./ai/ollamaClient'); // Import the AI client
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

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

app.post('/questions', async (req, res) => {
  console.log('Received request for questions');
  const { resumeData, jobDescription, employeeCount, role, existingQuestions } = req.body;

  const safeResumeData = Array.isArray(resumeData) ? resumeData : [];
  const safeExistingQuestions = Array.isArray(existingQuestions) ? existingQuestions : [];

  try {
    console.log('Generating questions with parameters:', {
      jobDescription: jobDescription?.substring(0, 50) + '...' || 'Not provided',
      employeeCount: employeeCount || 'Not provided',
      role: role || 'Not provided',
      resumeDataCount: safeResumeData.length,
      existingQuestionsCount: safeExistingQuestions.length,
    });

    const questions = await generateQuestions({
      jobDescription: jobDescription || 'Not provided',
      employeeCount: employeeCount || 'Not provided',
      role: role || 'Not provided',
      resumeData: safeResumeData,
      existingQuestions: safeExistingQuestions,
    });

    console.log('Questions generated successfully:', questions);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions with Ollama:', error);
    res.status(500).json({
      error: 'Failed to generate questions',
      questions: [
        'Can you describe your experience with Android development?',
        'How do you approach debugging an Android app?',
        'What Android SDK tools have you used in your projects?',
        'Tell me about a challenging Android project you worked on.',
        'Why are you interested in this Android development role?',
      ],
    });
  }
});

app.post('/feedback', (req, res) => {
  const { responses } = req.body;
  const feedback =
    responses.length > 0
      ? 'Your answers were detailed, but try to be more concise.'
      : 'Please provide more detailed answers.';
  res.json({ feedback });
});

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
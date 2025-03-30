const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const { PythonShell } = require('python-shell');
const axios = require('axios');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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

        // Call Python script to parse the extracted text
        const options = {
          mode: 'text',
          pythonOptions: ['-u'],
          scriptPath: './',  // Adjust if script is in a different directory
          args: [extractedText]
        };

        const { stdout } = await PythonShell.run('HRDashboardAlgo.py', options);
        return JSON.parse(stdout);  // Parsed data from Python
      })
    );
    res.json({ resumeData });
  } catch (error) {
    console.error('Error processing resumes:', error);
    res.status(500).json({ error: 'Failed to process resumes', details: error.message });
  }
});

// Keep /questions and /feedback endpoints as they are (with minor tweaks)
app.post('/questions', async (req, res) => {
  const { resumeData, jobDescription } = req.body;

  if (!resumeData || !jobDescription) {
    return res.status(400).json({ error: 'Resume data and job description are required' });
  }

  try {
    const questions = await Promise.all(
      resumeData.map(async (resume) => {
        const hasJavaExperience = JSON.stringify(resume).toLowerCase().includes('java');
        const prompt = `Given this resume: "${JSON.stringify(resume).slice(0, 500)}..." and this job description: "${jobDescription.slice(0, 500)}...", generate a personalized interview question. If the candidate has Java experience, ask about their Java projects. If not, ask how they would approach learning Java for the role.`;

        // Replace with your actual model API endpoint (e.g., Hugging Face, OpenAI)
        const modelResponse = await axios.post('https://your-model-api-endpoint', {
          prompt,
          max_length: 100,
        });

        return modelResponse.data.generated_text || 'Tell me about your experience.';
      })
    );
    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

app.post('/feedback', (req, res) => {
  const { responses } = req.body;
  const feedback = responses.length > 0 ? 'Your answers were detailed, but try to be more concise.' : 'Please provide more detailed answers.';
  res.json({ feedback });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
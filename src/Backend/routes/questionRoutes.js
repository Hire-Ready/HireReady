const express = require('express');
const { generateQuestions, processConversation } = require('../ai/ollamaClient');

const router = express.Router();

router.post('/questions', async (req, res) => {
  console.log('Received request for questions');
  const { resumeData, jobDescription, employeeCount, role, existingQuestions } = req.body;

  const safeResumeData = Array.isArray(resumeData) ? resumeData : [];
  const safeExistingQuestions = Array.isArray(existingQuestions) ? existingQuestions : [];

  const cacheKey = JSON.stringify({
    role: role || 'Not provided',
    jobDescription: jobDescription || 'Not provided',
    resumeSummary: safeResumeData.map(r => r.text || '').join(' ')
  });

  try {
    if (questionsCache.has(cacheKey)) {
      console.log('Returning cached questions');
      return res.json({ questions: questionsCache.get(cacheKey) });
    }

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

    questionsCache.set(cacheKey, questions);

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

module.exports = router;
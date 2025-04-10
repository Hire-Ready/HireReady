// ai/ollamaClient.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const promptConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../promptConfig.json'), 'utf8'));

const generateQuestions = async ({ jobDescription, employeeCount, role, resumeData, existingQuestions }) => {
  const refinedPrompt = {
    model: 'deepseek-r1:1.5b', // Adjust if using a different model
    messages: [
      {
        role: 'system',
        content: `${promptConfig.systemPrompt}\n\nDo not include any explanations, reasoning, or narrative. Output exactly 5 interview questions, one per line, with no additional text. Each question must start with a question word (e.g., 'What,' 'How,' 'Can') and be specific to the ${role} role based on the job description and resume data.`,
      },
      {
        role: 'user',
        content: `Job Description: ${jobDescription.substring(0, 500)}...\nRole: ${role}\nResume Data: ${resumeData.join('\n').substring(0, 1000) || 'Not provided'}\nExisting Questions: ${existingQuestions.join('\n') || 'Not provided'}`,
      },
    ],
    stream: false,
  };

  try {
    console.log('Sending request to Ollama API...');
    const response = await axios.post('http://localhost:11434/api/chat', refinedPrompt, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Ollama API response received:', JSON.stringify(response.data).substring(0, 500) + '...');

    const responseText = response.data.message?.content || response.data.response;
    if (!responseText) {
      console.error('No response text found in Ollama response');
      return defaultQuestions(role);
    }

    // Process and validate the response
    const questionStarters = ['what', 'how', 'can', 'describe', 'tell', 'why', 'when'];
    const roleKeywords = role.toLowerCase().split(' ').concat(['android', 'development', 'app', 'mobile', 'sdk']); // Adjust keywords based on role

    const newQuestions = responseText
      .split('\n')
      .map(q => q.trim())
      .filter(q => {
        return (
          q &&
          q.endsWith('?') &&
          questionStarters.some(starter => q.toLowerCase().startsWith(starter)) &&
          roleKeywords.some(keyword => q.toLowerCase().includes(keyword))
        );
      })
      .slice(0, 5);

    console.log('Generated questions:', newQuestions);

    // Ensure exactly 5 questions
    if (newQuestions.length < 5) {
      const fallback = defaultQuestions(role).slice(0, 5 - newQuestions.length);
      newQuestions.push(...fallback);
    }

    return newQuestions;
  } catch (error) {
    console.error('Ollama API error:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received from Ollama API');
    }
    return defaultQuestions(role);
  }
};

// Default questions tailored to the role
const defaultQuestions = (role) => {
  if (role.toLowerCase().includes('android')) {
    return [
      'Can you describe your experience with Android development?',
      'How do you approach debugging an Android app?',
      'What Android SDK tools have you used in your projects?',
      'Tell me about a challenging Android project you worked on.',
      'Why are you interested in this Android development role?',
    ];
  }
  return [
    'Tell me about your experience relevant to this role.',
    'How do you handle challenges in your work?',
    'What tools or technologies have you used in past projects?',
    'Can you describe a project you’re proud of?',
    'Why do you want to work in this position?',
  ];
};

module.exports = { generateQuestions };
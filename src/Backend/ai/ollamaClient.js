const axios = require('axios');
const fs = require('fs');
const path = require('path');

const promptConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'promptConfig.json'), 'utf8'));

const generateQuestions = async ({ jobDescription, employeeCount, role, resumeData, existingQuestions }) => {
  const prompt = {
    model: 'deepseek-r1:1.5b',
    messages: [
      {
        role: 'system',
        content: promptConfig.systemPrompt,
      },
      {
        role: 'user',
        content: `Job Description: ${jobDescription}\nRequired Employees: ${employeeCount}\nRole: ${role}\nResume Data: ${resumeData.join('\n') || 'Not provided'}\nExisting Questions: ${existingQuestions.join('\n') || 'Not provided'}`,
      },
    ],
    stream: false
  };

  try {
    console.log('Sending request to Ollama API...');
    const response = await axios.post('http://localhost:11434/api/chat', prompt, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('Ollama API response received:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    // Ollama response format is different than OpenAI
    // It returns { message: { content: "..." } } or { response: "..." }
    const responseText = response.data.message?.content || response.data.response;
    
    if (!responseText) {
      console.error('No response text found in Ollama response');
      return ['Tell me about yourself.', 'Why do you want this job?'];
    }
    
    // Process the response to extract questions
    const newQuestions = responseText
      .split('\n')
      .filter(q => q.trim() && !q.trim().startsWith('#') && q.trim().length > 10)
      .slice(0, 5);
    
    console.log('Generated questions:', newQuestions);
    
    return newQuestions.length > 0 
      ? newQuestions 
      : ['Tell me about yourself.', 'Why do you want this job?'];
  } catch (error) {
    console.error('Ollama API error:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received from Ollama API');
    }
    return ['Tell me about yourself.', 'Why do you want this job?'];
  }
};

module.exports = { generateQuestions };
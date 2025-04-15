// src/backend/ai/ollamaClient.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const promptConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'promptConfig.json'), 'utf8'));

// Main function to generate questions
const generateQuestions = async ({ jobDescription, employeeCount, role, resumeData, existingQuestions }) => {
  // Create a better prompt that emphasizes generating actual interview questions
  const prompt = {
    model: 'deepseek-r1:1.5b',
    messages: [
      {
        role: 'system',
        content: promptConfig.systemPrompt,
      },
      {
        role: 'user',
        content: `Generate 5 unique interview questions for a ${role} position. These should be questions an interviewer would ask a candidate.

Job Description: ${jobDescription}
Required Employees: ${employeeCount}
Role: ${role}

Examples of good interview questions:
1. What experience do you have with developing Android applications?
2. How do you approach debugging a complex issue in your code?
3. Tell me about a project where you had to work with a team to solve a problem.
4. What libraries or frameworks are you most familiar with in your field?
5. How do you stay updated with the latest technologies in your domain?

IMPORTANT: Only give me 5 interview questions. No explanations, no thinking, just the 5 questions.`,
      },
    ],
    stream: false
  };

  try {
    console.log('Sending request to Ollama API...');
    const response = await axios.post('http://localhost:11434/api/chat', prompt, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('Ollama API response received');
    
    // Extract response text from Ollama's response format
    let responseText = response.data.message?.content || response.data.response;
    
    if (!responseText) {
      console.error('No response text found in Ollama response');
      return generateDynamicQuestions(role, jobDescription);
    }
    
    // Clean up the response to extract actual questions
    const cleanedLines = cleanResponseText(responseText);
    
    // If we couldn't extract enough good questions, generate dynamic ones
    if (cleanedLines.length < 5) {
      return generateDynamicQuestions(role, jobDescription);
    }
    
    // Return only the first 5 questions
    return cleanedLines.slice(0, 5);
    
  } catch (error) {
    console.error('Ollama API error:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received from Ollama API');
    }
    return generateDynamicQuestions(role, jobDescription);
  }
};

// Clean response text to extract actual questions
const cleanResponseText = (text) => {
  // Remove thinking tags and their content
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  // Split by lines
  const lines = text.split('\n');
  
  // Filter for lines that look like questions
  const possibleQuestions = lines
    .map(line => line.trim())
    .filter(line => {
      // Keep lines that are reasonably long and don't start with certain patterns
      return line && 
             line.length > 10 && 
             !line.startsWith('#') && 
             !line.startsWith('<') &&
             !line.startsWith('Okay,') &&
             !line.startsWith('First,') &&
             !line.startsWith('Looking at') &&
             !line.startsWith('Now,') &&
             !line.startsWith('Wait,') &&
             !line.startsWith('I should') &&
             !line.startsWith('Let') &&
             !line.startsWith('Here');
    })
    .map(line => {
      // Clean up the question format
      return line
        .replace(/^\d+\.\s*/, '')  // Remove numbering
        .replace(/^["']|["']$/g, ''); // Remove quotes
    });
  
  // Further filter for lines that are likely questions
  // Either they contain a question mark or start with common question words
  const likelyQuestions = possibleQuestions.filter(line => {
    const lowerLine = line.toLowerCase();
    return line.includes('?') || 
           lowerLine.startsWith('tell me') ||
           lowerLine.startsWith('describe') ||
           lowerLine.startsWith('explain') ||
           lowerLine.startsWith('how') ||
           lowerLine.startsWith('what') ||
           lowerLine.startsWith('why') ||
           lowerLine.startsWith('when') ||
           lowerLine.startsWith('where') ||
           lowerLine.startsWith('which') ||
           lowerLine.startsWith('who') ||
           lowerLine.startsWith('can you');
  });
  
  return likelyQuestions;
};

// Generate dynamic questions based on role and job description
const generateDynamicQuestions = (role, jobDescription) => {
  const roleLower = (role || '').toLowerCase();
  let questions = [];
  
  // Large pool of generic questions
  const genericQuestions = [
    "Tell me about your professional background and experience.",
    "What motivated you to apply for this position?",
    "Describe a challenging project you've worked on and how you handled it.",
    "How do you prioritize tasks when working on multiple projects?",
    "What are your greatest professional strengths?",
    "What do you consider your biggest professional achievement?",
    "How do you handle stressful situations or tight deadlines?",
    "Describe your ideal work environment.",
    "Where do you see yourself professionally in five years?",
    "How would your previous colleagues describe your work style?",
    "What are you looking for in your next role?",
    "How do you stay updated with industry trends and continue learning?",
    "Tell me about a time when you had to learn a new skill quickly.",
    "How do you approach working with team members who have different working styles?",
    "What aspects of your work are you most passionate about?",
    "Describe a situation where you had to make a difficult decision.",
    "How do you handle receiving constructive criticism?",
    "What do you think makes you stand out from other candidates?",
    "How do you approach problem-solving in your daily work?",
    "What questions do you have about our company or the role?"
  ];
  
  // Role-specific question pools
  const androidQuestions = [
    "What experience do you have with Android development?",
    "Tell me about a challenging Android app you've worked on.",
    "How do you approach debugging issues in Android applications?",
    "What's your experience with Kotlin versus Java for Android development?",
    "How do you handle device fragmentation in your Android apps?",
    "What Android architecture patterns have you used in your projects?",
    "Describe your experience with Android's Jetpack libraries.",
    "How do you optimize performance in Android applications?",
    "What challenges have you faced with Android UI development?",
    "How do you stay current with Android platform updates and new features?",
    "Describe your experience with background processing in Android.",
    "What's your approach to testing Android applications?",
    "How would you implement secure data storage in an Android app?",
    "What experience do you have with publishing apps to the Google Play Store?",
    "How do you handle API integration in your Android projects?"
  ];
  
  const softwareDevQuestions = [
    "What programming languages are you most comfortable with?",
    "Tell me about your experience with version control systems.",
    "How do you approach testing and quality assurance?",
    "Describe your experience with agile development methodologies.",
    "What's your approach to code reviews?",
    "How do you handle technical debt in your projects?",
    "Describe your experience with cloud services.",
    "How do you approach learning new technologies or frameworks?",
    "Tell me about a time when you improved code performance significantly.",
    "What's your experience with CI/CD pipelines?",
    "How do you ensure your code is secure?",
    "Describe a situation where you had to refactor a significant amount of code.",
    "What development tools do you use daily?",
    "How do you document your code and projects?",
    "Tell me about a complex bug you resolved and how you approached it."
  ];
  
  const dataQuestions = [
    "What experience do you have with data analysis and visualization tools?",
    "Describe a data project you've worked on from start to finish.",
    "How do you approach cleaning and preprocessing messy datasets?",
    "What statistical methods are you most familiar with?",
    "Tell me about your experience with SQL and database querying.",
    "How do you validate the results of your data analysis?",
    "What's your experience with big data technologies?",
    "How do you communicate technical findings to non-technical stakeholders?",
    "Describe a time when your data analysis led to a significant business decision.",
    "What programming languages do you use for data analysis?",
    "How do you approach feature selection in machine learning projects?",
    "Tell me about a challenging data visualization you created.",
    "How do you handle missing or inconsistent data?",
    "What's your experience with A/B testing?",
    "How do you stay current with the latest data science methodologies?"
  ];
  
  // Select appropriate question pool based on role
  let primaryPool = genericQuestions;
  let secondaryPool = [];
  
  if (roleLower.includes('android') || (roleLower.includes('mobile') && roleLower.includes('develop'))) {
    primaryPool = androidQuestions;
    secondaryPool = softwareDevQuestions;
  } else if (roleLower.includes('software') || roleLower.includes('developer') || roleLower.includes('engineer')) {
    primaryPool = softwareDevQuestions;
    secondaryPool = genericQuestions;
  } else if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('science')) {
    primaryPool = dataQuestions;
    secondaryPool = genericQuestions;
  }
  
  // Select 3 questions from primary pool
  const selectedPrimary = selectRandomQuestions(primaryPool, 3);
  questions = questions.concat(selectedPrimary);
  
  // Remove selected questions from secondary pool to avoid duplicates
  const filteredSecondary = secondaryPool.filter(q => !selectedPrimary.includes(q));
  
  // Select 2 questions from secondary pool
  questions = questions.concat(selectRandomQuestions(filteredSecondary, 2));
  
  // Shuffle the questions for variety
  return shuffleArray(questions);
};

// Helper function to select random questions from a pool
const selectRandomQuestions = (pool, count) => {
  const shuffled = [...pool];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

module.exports = { generateQuestions };
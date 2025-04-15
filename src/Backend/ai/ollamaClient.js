// src/backend/ai/ollamaClient.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const promptConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'promptConfig.json'), 'utf8'));

// Generate the next interview question based on conversation history
const generateNextQuestion = async ({ conversationHistory, role, jobDescription, isFirstQuestion = false }) => {
  try {
    console.log('Generating next interview question');
    
    let systemPrompt = `You are an AI interviewer conducting a live video job interview for a ${role || 'professional'} position. 
    Your task is to ask the next interview question based on the conversation so far.
    
    If this is the first question, ask a general opening question like "Tell me about yourself" or something relevant to the role.
    
    If this is a follow-up, review the candidate's previous answers and ask a logical next question that:
    1. Digs deeper into their experience relevant to the ${role} position
    2. Explores their skills and qualifications
    3. Assesses their fit for the role
    
    Keep your questions concise, professional, and focused on evaluating the candidate.
    ONLY RESPOND WITH THE NEXT QUESTION. Do not include any explanations, introductions, or commentary.`;
    
    // Create messages array for the prompt
    let messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
    
    // If we have conversation history, include it
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      // Add conversation history as context
      messages.push({
        role: 'user',
        content: `Here is the conversation so far:
        
        ${conversationHistory.map((entry, index) => 
          `${index % 2 === 0 ? 'Interviewer' : 'Candidate'}: ${entry}`
        ).join('\n\n')}
        
        Based on this conversation, what should be the next interview question?`
      });
    } else if (isFirstQuestion) {
      // If it's the first question and we have job details
      messages.push({
        role: 'user',
        content: `This is the start of an interview for a ${role || 'professional'} position.
        ${jobDescription ? `The job description is: ${jobDescription}` : ''}
        
        What should be the first interview question?`
      });
    } else {
      // Fallback if no context is available
      messages.push({
        role: 'user',
        content: `Ask a general interview question for a ${role || 'professional'} position.`
      });
    }
    
    const prompt = {
      model: 'deepseek-r1:1.5b',
      messages: messages,
      stream: false
    };
    
    console.log('Sending request to Ollama for next question');
    const response = await axios.post('http://localhost:11434/api/chat', prompt, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('Ollama API response received for next question');
    
    // Extract response text
    let questionText = response.data.message?.content || response.data.response;
    
    if (!questionText) {
      console.error('No question text found in Ollama response');
      return isFirstQuestion 
        ? "Tell me about yourself and your experience relevant to this position."
        : "What skills do you think are most important for this role?";
    }
    
    // Clean up the question text
    questionText = questionText
      .trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^(Interviewer|Question|Next question|Q):?\s*/i, ''); // Remove prefixes
    
    return questionText;
    
  } catch (error) {
    console.error('Error generating next question:', error.message);
    return "Could you tell me more about your experience with this type of work?";
  }
};

// Process real-time conversation with Ollama
const processConversation = async ({ text, context, role, jobDescription }) => {
  try {
    console.log('Processing conversation input:', text);
    
    // Create a more detailed system prompt with job context and industry-standard evaluation parameters
    const systemPrompt = `You are an AI interviewer conducting a job interview for a ${role || 'professional'} position. 
    ${jobDescription ? `The job description is: ${jobDescription}` : ''}
    
    You are currently evaluating the candidate's response to the question: "${context?.currentQuestion || 'the current interview question'}"
    
    Evaluate the candidate's response based on the following industry-standard parameters:
    
    1. RELEVANCE (0-20 points): How directly does the answer address the question asked? Does it demonstrate understanding of the question?
    
    2. TECHNICAL ACCURACY (0-20 points): Is the information provided factually correct? Does it demonstrate proper understanding of technical concepts relevant to the ${role} role?
    
    3. DEPTH OF KNOWLEDGE (0-20 points): Does the answer demonstrate deep understanding rather than surface-level knowledge? Does it include specific examples, details, or insights?
    
    4. COMMUNICATION CLARITY (0-20 points): Is the answer well-structured, concise, and easy to understand? Does it effectively convey complex ideas?
    
    5. PROBLEM-SOLVING APPROACH (0-20 points): Does the answer demonstrate analytical thinking, creativity, and effective problem-solving methodologies?
    
    For each parameter, provide a specific score and brief justification. Then provide an overall assessment that highlights strengths and areas for improvement.
    
    Format your evaluation as follows:
    
    PARAMETER SCORES:
    - Relevance: [SCORE]/20 - [Brief justification]
    - Technical Accuracy: [SCORE]/20 - [Brief justification]
    - Depth of Knowledge: [SCORE]/20 - [Brief justification]
    - Communication Clarity: [SCORE]/20 - [Brief justification]
    - Problem-Solving Approach: [SCORE]/20 - [Brief justification]
    
    OVERALL ASSESSMENT:
    [2-3 sentences highlighting strengths and areas for improvement]
    
    TOTAL SCORE: [SUM OF ALL SCORES]/100
    
    DO NOT ask new questions - the interview follows a structured format where questions are pre-determined.
    Your role is to evaluate the candidate's response to the current question only.`;
    
    // Create a prompt for conversational interaction with structured evaluation
    const prompt = {
      model: 'deepseek-r1:1.5b',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `The candidate's response to the question "${context?.currentQuestion || 'the current question'}" is: "${text}"
          
          Please evaluate this response using the industry-standard parameters specified in your instructions. Provide specific scores for each parameter and an overall assessment.`
        },
      ],
      stream: false
    };
    
    // Add conversation history if available
    if (context && context.history && Array.isArray(context.history)) {
      // Format the conversation history as a string for context
      const historyText = context.history
        .map((msg, i) => `${i % 2 === 0 ? 'Interviewer' : 'Candidate'}: ${msg}`)
        .join('\n\n');
      
      // Add the history as context before the current message
      prompt.messages.splice(1, 0, {
        role: 'user',
        content: `Here is the conversation history so far:\n\n${historyText}\n\nPlease evaluate the candidate's latest response.`
      });
    }
    
    console.log('Sending conversation request to Ollama API...');
    const response = await axios.post('http://localhost:11434/api/chat', prompt, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('Ollama API conversation response received');
    
    // Extract response text from Ollama's response format
    let responseText = response.data.message?.content || response.data.response;
    
    if (!responseText) {
      console.error('No response text found in Ollama conversation response');
      return "I'm sorry, I couldn't process your response. Could you please elaborate or rephrase?";
    }
    
    return responseText;
    
  } catch (error) {
    console.error('Ollama API conversation error:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received from Ollama API');
    }
    return "I apologize, but I'm having trouble processing your response right now. Let's continue with the next question.";
  }
};

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

module.exports = { generateQuestions, processConversation, generateNextQuestion };
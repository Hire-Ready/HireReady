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
    
    let messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
    
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      messages.push({
        role: 'user',
        content: `Here is the conversation so far:
        
        ${conversationHistory.map((entry, index) => 
          `${index % 2 === 0 ? 'Interviewer' : 'Candidate'}: ${entry}`
        ).join('\n\n')}
        
        Based on this conversation, what should be the next interview question?`
      });
    } else if (isFirstQuestion) {
      messages.push({
        role: 'user',
        content: `This is the start of an interview for a ${role || 'professional'} position.
        ${jobDescription ? `The job description is: ${jobDescription}` : ''}
        
        What should be the first interview question?`
      });
    } else {
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
    
    let questionText = response.data.message?.content || response.data.response;
    
    if (!questionText) {
      console.error('No question text found in Ollama response');
      return isFirstQuestion 
        ? "Tell me about yourself and your experience relevant to this position."
        : "What skills do you think are most important for this role?";
    }
    
    questionText = questionText
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/^(Interviewer|Question|Next question|Q):?\s*/i, '');
    
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
    
    if (context && context.history && Array.isArray(context.history)) {
      const historyText = context.history
        .map((msg, i) => `${i % 2 === 0 ? 'Interviewer' : 'Candidate'}: ${msg}`)
        .join('\n\n');
      
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

// Generate questions based only on parsed resume and job description
const generateQuestions = async ({ jobDescription, resumeData }) => {
  // Validate inputs
  if (!jobDescription || !resumeData || !Array.isArray(resumeData) || resumeData.length === 0) {
    console.error('Missing jobDescription or valid resumeData');
    return generateDynamicQuestions(jobDescription);
  }

  // Combine resume data into a single context string
  const resumeContext = resumeData
    .map((resume, index) => `Candidate ${index + 1} Resume:\n${resume.text}`)
    .join('\n\n');

  // Create a prompt that emphasizes resume and job description
  const prompt = {
    model: 'deepseek-r1:1.5b',
    messages: [
      {
        role: 'system',
        content: `You are an AI interviewer tasked with generating interview questions for a candidate based ONLY on their parsed resume data and the provided job description. 

        Instructions:
        - Generate 5 unique, concise interview questions.
        - Questions must be directly relevant to the skills, experiences, or qualifications mentioned in the resume and the requirements in the job description.
        - Do NOT use generic questions unless they tie directly to the resume or job description.
        - Avoid referencing external data like company names or roles not mentioned in the inputs.
        - Format the output as a list of questions only, without explanations or narrative text.

        Example Questions (based on a sample resume and job description):
        1. Can you describe your experience developing Android apps using Kotlin, as mentioned in your resume?
        2. The job requires expertise in RESTful APIs. How have you integrated APIs in your past projects?
        3. Your resume mentions a project with Jetpack Compose. Can you walk us through your approach to building that UI?
        4. The role involves debugging complex issues. Can you share an example of a challenging bug you resolved?
        5. The job description emphasizes teamwork. Can you discuss a time you collaborated on a project listed in your resume?`
      },
      {
        role: 'user',
        content: `Job Description: ${jobDescription}

Parsed Resume Data:
${resumeContext}

Generate 5 unique interview questions based ONLY on the job description and resume data above.`
      }
    ],
    stream: false
  };

  try {
    console.log('Sending request to Ollama API for questions');
    const response = await axios.post('http://localhost:11434/api/chat', prompt, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Ollama API response received');
    let responseText = response.data.message?.content || response.data.response;

    if (!responseText) {
      console.error('No response text found in Ollama response');
      return generateDynamicQuestions(jobDescription);
    }

    // Clean up the response to extract questions
    const cleanedQuestions = cleanResponseText(responseText);

    // Ensure we have 5 questions, falling back to dynamic questions if needed
    if (cleanedQuestions.length < 5) {
      console.warn('Insufficient questions from Ollama, generating fallback questions');
      return generateDynamicQuestions(jobDescription);
    }

    return cleanedQuestions.slice(0, 5);

  } catch (error) {
    console.error('Ollama API error:', error.message);
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    return generateDynamicQuestions(jobDescription);
  }
};

// Clean response text to extract actual questions
const cleanResponseText = (text) => {
  const lines = text.split('\n');
  const possibleQuestions = lines
    .map(line => line.trim())
    .filter(line => {
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
      return line
        .replace(/^\d+\.\s*/, '')
        .replace(/^["']|["']$/g, '');
    });
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

// Generate dynamic questions based on job description
const generateDynamicQuestions = (jobDescription) => {
  const fallbackQuestions = [
    `Can you describe your experience relevant to the responsibilities outlined in the job description?`,
    `How have you applied skills mentioned in the job description in your past work?`,
    `What challenges have you faced in projects similar to those described in the job description?`,
    `Can you provide an example of how you’ve met a requirement listed in the job description?`,
    `How do you stay updated on technologies or skills relevant to this job description?`
  ];
  return shuffleArray(fallbackQuestions).slice(0, 5);
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
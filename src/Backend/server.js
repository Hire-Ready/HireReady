// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const { generateQuestions, processConversation } = require('./ai/ollamaClient'); // Import the AI client
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

// Check if email credentials exist
const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Configure email handling - either real or mock
let sendEmail;

if (hasEmailCredentials) {
  console.log('Email credentials found. Using real email sending.');
  // Real email sending using nodemailer
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  // Function to send real emails
  sendEmail = async (mailOptions) => {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };
} else {
  console.log('⚠️ NO EMAIL CREDENTIALS FOUND! Email sending will be simulated.');
  
  // Mock email sending function that just logs
  sendEmail = async (mailOptions) => {
    console.log('');
    console.log('📧 MOCK EMAIL SENDING (credentials not configured)');
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    console.log('📧 Content would be sent if credentials were configured.');
    console.log('');
    
    // Simulate a delay to mimic real email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a success response
    return { 
      success: true, 
      messageId: 'mock-email-' + Date.now(),
      simulated: true
    };
  };
}

// Extract email from resume text using regex
function extractEmailFromResume(resumeText) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = resumeText.match(emailRegex);
  return matches ? matches[0] : null;
}

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
        
        // Extract email from the resume
        const email = extractEmailFromResume(extractedText);
        
        fs.unlinkSync(file.path);
        return {
          text: extractedText,
          email: email
        };
      })
    );
    res.json({ resumeData });
  } catch (error) {
    console.error('Error processing resumes:', error);
    res.status(500).json({ error: 'Failed to process resumes' });
  }
});

app.post('/send-interview-invites', async (req, res) => {
  const { candidates, interviewTime, role } = req.body;
  
  try {
    console.log(`Processing interview invites for ${candidates.length} candidates`);
    
    const results = await Promise.all(candidates.map(async (candidate, index) => {
      if (!candidate.email) {
        console.log(`No email found for candidate ${index + 1}`);
        return { 
          success: false,
          error: `No email found for candidate ${index + 1}` 
        };
      }
      
      // Generate unique interview link with candidate ID
      const interviewLink = `http://localhost:3000/interview/${index + 1}`;
      
      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER || 'chinmay7016@gmail.com',
        to: candidate.email,
        subject: `Interview Invitation for ${role} Position`,
        html: `
          <h2>Interview Invitation</h2>
          <p>Dear Candidate,</p>
          <p>We are pleased to invite you for an interview for the <strong>${role}</strong> position.</p>
          <p>Please join the interview using the following link:</p>
          <p><a href="${interviewLink}">${interviewLink}</a></p>
          <p>Interview Date and Time: ${interviewTime}</p>
          <p>We look forward to speaking with you!</p>
          <p>Best regards,<br>HR Team</p>
        `
      };
      
      try {
        console.log(`Sending invite to ${candidate.email}`);
        // Use our sendEmail function (either real or mock)
        const info = await sendEmail(mailOptions);
        return { 
          success: true, 
          email: candidate.email,
          messageId: info.messageId,
          simulated: !hasEmailCredentials
        };
      } catch (emailError) {
        console.error(`Error sending email to ${candidate.email}:`, emailError);
        return {
          success: false,
          email: candidate.email,
          error: emailError.message
        };
      }
    }));
    
    console.log(`Processed ${results.length} invites. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);
    
    res.json({ results });
  } catch (error) {
    console.error('Error sending interview invites:', error);
    res.status(500).json({ error: 'Failed to send interview invitations' });
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

app.post('/feedback', async (req, res) => {
  const { responses, candidateId, candidateInfo, role } = req.body;
  
  try {
    // Generate a score based on the responses
    let overallScore = 0;
    let detailedFeedback = '';
    let parameterScores = {};
    let expectedAnswers = [];
    
    if (responses && responses.answers && responses.answers.length > 0) {
      // Process each answer to get structured feedback and scores
      const answerEvaluations = await Promise.all(responses.answers.map(async (answer, index) => {
        try {
          // Use Ollama to evaluate the answer if it's substantial
          if (answer && answer.length > 10) {
            const evaluation = await processConversation({
              text: answer,
              context: {
                currentQuestion: responses.questions[index] || `Question ${index + 1}`,
                history: []
              },
              role: role || 'candidate',
              jobDescription: 'Evaluating interview response'
            });
            
            // Parse the structured evaluation response
            const parsedEvaluation = parseStructuredEvaluation(evaluation);
            
            return {
              ...parsedEvaluation,
              rawFeedback: evaluation,
              questionIndex: index
            };
          }
          return { 
            score: 0, 
            feedback: 'No substantial answer provided.',
            parameters: {
              relevance: { score: 0, justification: 'No substantial answer provided.' },
              technicalAccuracy: { score: 0, justification: 'No substantial answer provided.' },
              depthOfKnowledge: { score: 0, justification: 'No substantial answer provided.' },
              communicationClarity: { score: 0, justification: 'No substantial answer provided.' },
              problemSolvingApproach: { score: 0, justification: 'No substantial answer provided.' }
            },
            questionIndex: index
          };
        } catch (error) {
          console.error(`Error evaluating answer ${index + 1}:`, error);
          return { 
            score: 0, 
            feedback: 'Could not evaluate this answer.',
            parameters: {},
            questionIndex: index
          };
        }
      }));
      
      // Generate expected answers for each question
      expectedAnswers = await Promise.all(responses.questions.map(async (question, index) => {
        try {
          const expectedAnswer = await processConversation({
            text: `Provide a model answer or ideal response for the interview question: "${question}"`,
            context: {
              history: []
            },
            role: 'interviewer',
            jobDescription: 'Generating expected answer for interview question'
          });
          return expectedAnswer;
        } catch (error) {
          console.error(`Error generating expected answer for question ${index + 1}:`, error);
          return 'No expected answer available.';
        }
      }));
      
      // Calculate average scores for each parameter across all answers
      const parameterTotals = {
        relevance: 0,
        technicalAccuracy: 0,
        depthOfKnowledge: 0,
        communicationClarity: 0,
        problemSolvingApproach: 0
      };
      
      let validEvaluationCount = 0;
      
      // Sum up parameter scores from all evaluations
      answerEvaluations.forEach(eval => {
        if (eval.parameters && Object.keys(eval.parameters).length > 0) {
          validEvaluationCount++;
          
          Object.entries(eval.parameters).forEach(([param, data]) => {
            if (parameterTotals.hasOwnProperty(param)) {
              parameterTotals[param] += data.score || 0;
            }
          });
        }
      });
      
      // Calculate average for each parameter if we have valid evaluations
      if (validEvaluationCount > 0) {
        Object.keys(parameterTotals).forEach(param => {
          parameterScores[param] = {
            score: Math.round(parameterTotals[param] / validEvaluationCount),
            maxScore: 20
          };
        });
        
        // Calculate overall score as sum of parameter averages
        overallScore = Object.values(parameterScores).reduce((sum, param) => sum + param.score, 0);
      } else {
        // Fallback if no valid evaluations
        overallScore = 65; // Default score
      }
      
      // Compile detailed feedback with structured format
      detailedFeedback = answerEvaluations.map((eval, index) => {
        const question = responses.questions[index] || `Question ${index + 1}`;
        const answer = responses.answers[index] || 'No answer provided';
        const expectedAnswer = expectedAnswers[index] || 'No expected answer available.';
        
        // If we have structured parameters, format them nicely
        if (eval.parameters && Object.keys(eval.parameters).length > 0) {
          const parameterFeedback = Object.entries(eval.parameters)
            .map(([param, data]) => {
              // Convert camelCase to Title Case with spaces
              const formattedParam = param
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              
              return `- ${formattedParam}: ${data.score}/20 - ${data.justification}`;
            })
            .join('\n');
          
          return `Question ${index + 1}: ${question}\n\nYour Answer: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}\n\nExpected Answer:\n${expectedAnswer}\n\nEvaluation:\n${parameterFeedback}\n\nOverall: ${eval.feedback}`;
        }
        
        // Fallback for unstructured feedback
        return `Question ${index + 1}: ${question}\n\nYour Answer: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}\n\nExpected Answer:\n${expectedAnswer}\n\nFeedback: ${eval.feedback}`;
      }).join('\n\n');
    }
    
    // Generate overall feedback message based on the calculated score
    let feedbackMessage = '';
    
    if (overallScore >= 90) {
      feedbackMessage = 'Excellent interview! You demonstrated strong qualifications for this position. Your responses showed exceptional technical knowledge, clear communication, and strong problem-solving abilities.';
    } else if (overallScore >= 75) {
      feedbackMessage = 'Very good interview. You showed good potential for this role. Your responses demonstrated solid technical understanding and good communication skills, with some areas that could be further developed.';
    } else if (overallScore >= 60) {
      feedbackMessage = 'Good interview. There are some areas where you could improve. Your responses showed adequate knowledge, but could benefit from more depth, clearer explanations, or more specific examples.';
    } else {
      feedbackMessage = 'Thank you for your interview. We recommend further preparation for future opportunities. Consider developing more detailed responses with specific examples and strengthening your technical knowledge in key areas.';
    }
    
    // Add personalized closing if email is available
    if (candidateInfo && candidateInfo.email) {
      feedbackMessage += ` We'll review your responses and get back to you at ${candidateInfo.email}.`;
    } else {
      feedbackMessage += ' We will review your responses and contact you shortly.';
    }
    
    res.json({ 
      feedback: feedbackMessage,
      score: overallScore,
      detailedFeedback: detailedFeedback,
      parameterScores: parameterScores
    });
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ 
      feedback: 'Thank you for completing the interview. We will review your responses and contact you shortly.',
      score: 65, // Default score
      error: 'Error generating detailed feedback'
    });
  }
});

// Helper function to parse structured evaluation from AI response
const parseStructuredEvaluation = (evaluationText) => {
  try {
    // Initialize result object
    const result = {
      score: 0,
      feedback: '',
      parameters: {}
    };
    
    // Extract parameter scores section
    const parameterScoresMatch = evaluationText.match(/PARAMETER SCORES:([\s\S]*?)(?=OVERALL ASSESSMENT:|$)/i);
    
    if (parameterScoresMatch && parameterScoresMatch[1]) {
      const parameterScoresText = parameterScoresMatch[1].trim();
      
      // Extract individual parameter scores
      const relevanceMatch = parameterScoresText.match(/Relevance:\s*(\d+)\/20\s*-\s*([^\n]+)/i);
      const technicalMatch = parameterScoresText.match(/Technical Accuracy:\s*(\d+)\/20\s*-\s*([^\n]+)/i);
      const depthMatch = parameterScoresText.match(/Depth of Knowledge:\s*(\d+)\/20\s*-\s*([^\n]+)/i);
      const clarityMatch = parameterScoresText.match(/Communication Clarity:\s*(\d+)\/20\s*-\s*([^\n]+)/i);
      const problemSolvingMatch = parameterScoresText.match(/Problem-Solving Approach:\s*(\d+)\/20\s*-\s*([^\n]+)/i);
      
      // Add each parameter to the result if found
      if (relevanceMatch) {
        result.parameters.relevance = {
          score: parseInt(relevanceMatch[1], 10) || 0,
          justification: relevanceMatch[2].trim()
        };
      }
      
      if (technicalMatch) {
        result.parameters.technicalAccuracy = {
          score: parseInt(technicalMatch[1], 10) || 0,
          justification: technicalMatch[2].trim()
        };
      }
      
      if (depthMatch) {
        result.parameters.depthOfKnowledge = {
          score: parseInt(depthMatch[1], 10) || 0,
          justification: depthMatch[2].trim()
        };
      }
      
      if (clarityMatch) {
        result.parameters.communicationClarity = {
          score: parseInt(clarityMatch[1], 10) || 0,
          justification: clarityMatch[2].trim()
        };
      }
      
      if (problemSolvingMatch) {
        result.parameters.problemSolvingApproach = {
          score: parseInt(problemSolvingMatch[1], 10) || 0,
          justification: problemSolvingMatch[2].trim()
        };
      }
    }
    
    // Extract overall assessment
    const overallMatch = evaluationText.match(/OVERALL ASSESSMENT:([\s\S]*?)(?=TOTAL SCORE:|$)/i);
    if (overallMatch && overallMatch[1]) {
      result.feedback = overallMatch[1].trim();
    }
    
    // Extract total score
    const totalScoreMatch = evaluationText.match(/TOTAL SCORE:\s*(\d+)\/100/i);
    if (totalScoreMatch && totalScoreMatch[1]) {
      result.score = parseInt(totalScoreMatch[1], 10) || 0;
    } else {
      // If no total score found, calculate from parameters
      result.score = Object.values(result.parameters).reduce((sum, param) => sum + (param.score || 0), 0);
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing structured evaluation:', error);
    return {
      score: 0,
      feedback: 'Error parsing evaluation',
      parameters: {}
    };
  }
};
app.get('/test-ollama', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    res.json({ status: 'success', models: response.data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Socket.io session management
const interviewSessions = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Initialize session data
  interviewSessions.set(socket.id, {
    conversationHistory: [],
    currentQuestion: null,
    role: null,
    jobDescription: null
  });
  
  // Handle speech-to-text data
  socket.on('speech-to-text', async (data) => {
    console.log('Received speech-to-text data:', data.text);
    
    const sessionData = interviewSessions.get(socket.id) || {
      conversationHistory: [],
      currentQuestion: null
    };
    
    // Update session data
    sessionData.currentQuestion = data.question;
    sessionData.role = data.role || sessionData.role;
    sessionData.jobDescription = data.jobDescription || sessionData.jobDescription;
    
    // Add to conversation history if not already there
    const questionExists = sessionData.conversationHistory.some(
      item => item.role === 'interviewer' && item.content === data.question
    );
    
    if (!questionExists) {
      sessionData.conversationHistory.push({
        role: 'interviewer',
        content: data.question,
        questionIndex: data.questionIndex
      });
    }
    
    // Add candidate's response
    sessionData.conversationHistory.push({
      role: 'candidate',
      content: data.text,
      questionIndex: data.questionIndex
    });
    
    interviewSessions.set(socket.id, sessionData);
    
    try {
      // Process the response with Ollama
      const feedback = await processConversation({
        text: data.text,
        context: {
          currentQuestion: data.question,
          history: sessionData.conversationHistory
        },
        role: data.role,
        jobDescription: data.jobDescription
      });
      
      console.log('AI feedback:', feedback);
      
      // Send the feedback to the client
      socket.emit('ai-response', {
        feedback,
        questionIndex: data.questionIndex
      });
      
    } catch (error) {
      console.error('Error processing conversation:', error);
      socket.emit('ai-response', {
        feedback: 'I apologize, but I encountered an error processing your response. Please continue with the interview.',
        questionIndex: data.questionIndex,
        error: true
      });
    }
  });
  
  // Handle interview start
  socket.on('start-interview', (data) => {
    console.log('Starting interview for client:', socket.id);
    interviewSessions.set(socket.id, {
      conversationHistory: [],
      currentQuestion: null,
      role: data.role,
      jobDescription: data.jobDescription
    });
  });
  
  // Handle interview end
  socket.on('end-interview', () => {
    console.log('Ending interview for client:', socket.id);
    // Could store results or perform analytics here
    interviewSessions.delete(socket.id);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    interviewSessions.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}. Access at http://localhost:${PORT}`));
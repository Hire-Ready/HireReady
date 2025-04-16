const express = require('express');
const feedbackAnalyzer = require('../feedback'); // Updated import path

const router = express.Router();

router.post('/feedback', async (req, res) => {
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
      
      // Generate expected answers for each question with caching
      expectedAnswers = await Promise.all(responses.questions.map(async (question, index) => {
        try {
          if (expectedAnswersCache.has(question)) {
            return expectedAnswersCache.get(question);
          }
          const expectedAnswer = await processConversation({
            text: `Provide a model answer or ideal response for the interview question: "${question}"`,
            context: {
              history: []
            },
            role: 'interviewer',
            jobDescription: 'Generating expected answer for interview question'
          });
          expectedAnswersCache.set(question, expectedAnswer);
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

module.exports = router;

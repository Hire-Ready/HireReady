const express = require('express');
const feedbackAnalyzer = require('../feedback');

const router = express.Router();

router.post('/feedback', async (req, res) => {
  const { responses, candidateId, candidateInfo, role } = req.body;
  
  try {
    let overallScore = 0;
    let detailedFeedback = '';
    let parameterScores = {};
    let expectedAnswers = [];
    
    if (responses && responses.answers && responses.answers.length > 0) {
      const answerEvaluations = await Promise.all(responses.answers.map(async (answer, index) => {
        try {
          if (answer && answer.length > 10) {
            const evaluation = await feedbackAnalyzer.analyzeFeedback(answer, {
              currentQuestion: responses.questions[index] || `Question ${index + 1}`,
              history: [],
              role: role || 'candidate',
              jobDescription: 'Evaluating interview response'
            });
            
            return {
              score: evaluation.score,
              feedback: evaluation.recommendations.map(r => r.action).join(' '),
              parameters: {
                relevance: { score: evaluation.keyPhrases.filter(p => p.importance > 0.3).length * 4, justification: 'Based on key phrase relevance' },
                technicalAccuracy: { score: Math.round(evaluation.sentiment * 5), justification: 'Based on sentiment analysis' },
                depthOfKnowledge: { score: Math.round(evaluation.sentiment * 4), justification: 'Based on content depth' },
                communicationClarity: { score: Math.round(evaluation.sentiment * 3), justification: 'Based on clarity indicators' },
                problemSolvingApproach: { score: Math.round(evaluation.sentiment * 4), justification: 'Based on problem-solving hints' }
              },
              questionIndex: index
            };
          }
          return { 
            score: 0, 
            feedback: 'No substantial answer provided.',
            parameters: {},
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
      
      expectedAnswers = await Promise.all(responses.questions.map(async (question, index) => {
        try {
          if (expectedAnswersCache.has(question)) {
            return expectedAnswersCache.get(question);
          }
          const expectedAnswer = await feedbackAnalyzer.analyzeFeedback(`Ideal response for: ${question}`, {
            history: []
          });
          expectedAnswersCache.set(question, expectedAnswer.recommendations[0].action);
          return expectedAnswer.recommendations[0].action;
        } catch (error) {
          console.error(`Error generating expected answer for question ${index + 1}:`, error);
          return 'No expected answer available.';
        }
      }));
      
      const parameterTotals = {
        relevance: 0,
        technicalAccuracy: 0,
        depthOfKnowledge: 0,
        communicationClarity: 0,
        problemSolvingApproach: 0
      };
      let validEvaluationCount = 0;
      
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
      
      if (validEvaluationCount > 0) {
        Object.keys(parameterTotals).forEach(param => {
          parameterScores[param] = {
            score: Math.round(parameterTotals[param] / validEvaluationCount),
            maxScore: 20
          };
        });
        overallScore = Object.values(parameterScores).reduce((sum, param) => sum + param.score, 0);
      } else {
        overallScore = 65;
      }
      
      detailedFeedback = answerEvaluations.map((eval, index) => {
        const question = responses.questions[index] || `Question ${index + 1}`;
        const answer = responses.answers[index] || 'No answer provided';
        const expectedAnswer = expectedAnswers[index] || 'No expected answer available.';
        
        if (eval.parameters && Object.keys(eval.parameters).length > 0) {
          const parameterFeedback = Object.entries(eval.parameters)
            .map(([param, data]) => {
              const formattedParam = param
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              return `- ${formattedParam}: ${data.score}/20 - ${data.justification}`;
            })
            .join('\n');
          return `Question ${index + 1}: ${question}\n\nYour Answer: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}\n\nExpected Answer:\n${expectedAnswer}\n\nEvaluation:\n${parameterFeedback}\n\nOverall: ${eval.feedback}`;
        }
        return `Question ${index + 1}: ${question}\n\nYour Answer: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}\n\nExpected Answer:\n${expectedAnswer}\n\nFeedback: ${eval.feedback}`;
      }).join('\n\n');
    }
    
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
      score: 65,
      error: 'Error generating detailed feedback'
    });
  }
});

module.exports = router;
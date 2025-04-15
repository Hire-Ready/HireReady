// src/components/FeedbackScreen/FeedbackScreen.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeedbackScreen.css';

function FeedbackScreen({ responses, onBack }) {
  const [overallFeedback, setOverallFeedback] = useState('');
  const [score, setScore] = useState(null);
  const [questionFeedback, setQuestionFeedback] = useState([]);
  const [parameterScores, setParameterScores] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const getFeedback = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        // Check if we have both questions and answers
        if (!responses || !responses.answers || !responses.questions) {
          throw new Error('Missing interview data');
        }

        // Send to backend for processing
        const response = await axios.post('http://localhost:3001/feedback', { 
          responses,
          role: responses.role || 'candidate'
        });
        
        // Set the overall feedback and score
        setOverallFeedback(response.data.feedback || 'Thank you for completing the interview.');
        setScore(response.data.score || 0);
        
        // Set parameter scores if available
        if (response.data.parameterScores) {
          setParameterScores(response.data.parameterScores);
        }
        
        // Process question-specific feedback
        if (response.data.detailedFeedback) {
          // Parse the detailed feedback
          const feedbackItems = response.data.detailedFeedback.split('\n\n');
          
          // Match feedback to questions
          const questionSpecificFeedback = responses.questions.map((question, index) => {
            // Find the corresponding feedback for this question
            const feedbackItem = feedbackItems.find(item => 
              item.includes(`Question ${index + 1}:`) || 
              item.toLowerCase().includes(question.toLowerCase().substring(0, 20))
            );
            
            // Parse the structured feedback
            let feedbackText = 'No specific feedback available for this question.';
            let parameterBreakdown = null;
            
            if (feedbackItem) {
              // Check if this is structured feedback with parameter breakdown
              if (feedbackItem.includes('Evaluation:')) {
                const parts = feedbackItem.split('Evaluation:');
                if (parts.length > 1) {
                  const evaluationParts = parts[1].split('Overall:');
                  
                  // Extract parameter breakdown
                  parameterBreakdown = evaluationParts[0].trim().split('\n').filter(line => line.trim().length > 0);
                  
                  // Extract overall feedback
                  feedbackText = evaluationParts.length > 1 ? evaluationParts[1].trim() : 'No overall feedback available.';
                }
              } else {
                // Handle legacy format
                const parts = feedbackItem.split(': ');
                if (parts.length > 1) {
                  feedbackText = parts.slice(1).join(': ');
                }
              }
            }
            
            return {
              question,
              answer: responses.answers[index] || 'No answer provided',
              feedback: feedbackText,
              parameterBreakdown
            };
          });
          
          setQuestionFeedback(questionSpecificFeedback);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setErrorMessage(
          error.response?.data?.details
            ? `Failed to fetch feedback: ${error.response.data.details}`
            : error.message || 'Failed to fetch feedback. Ensure the backend server is running.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    if (responses && responses.answers && responses.answers.length > 0) {
      getFeedback();
    } else {
      setIsLoading(false);
      setErrorMessage('No interview responses found. Please complete an interview first.');
    }
  }, [responses]);

  // Modified to include expectedAnswer in question feedback
  useEffect(() => {
    if (questionFeedback.length > 0) {
      const updatedFeedback = questionFeedback.map((item) => {
        // Extract expected answer from detailedFeedback string if present
        // The backend now includes expectedAnswer in the detailedFeedback string per question
        // But since we parse detailedFeedback as a string, we need to extract expectedAnswer here
        // For simplicity, we assume expectedAnswer is included in the feedback string between "Expected Answer:" and "Evaluation:" or "Feedback:"
        const expectedAnswerMatch = item.feedback.match(/Expected Answer:\n([\s\S]*?)(Evaluation:|Feedback:|$)/);
        const expectedAnswer = expectedAnswerMatch ? expectedAnswerMatch[1].trim() : null;
        return { ...item, expectedAnswer };
      });
      setQuestionFeedback(updatedFeedback);
    }
  }, [questionFeedback]);

  // Function to get score color based on value
  const getScoreColor = (score) => {
    if (score >= 90) return '#28a745'; // Green for excellent
    if (score >= 75) return '#17a2b8'; // Blue for very good
    if (score >= 60) return '#ffc107'; // Yellow for good
    return '#dc3545'; // Red for needs improvement
  };

  // Function to get score label
  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  // Function to render parameter score bars
  const renderParameterScores = () => {
    if (!parameterScores || Object.keys(parameterScores).length === 0) {
      return null;
    }

    // Define parameter display names and descriptions
    const parameterInfo = {
      relevance: {
        name: 'Relevance',
        description: 'How directly the answers address the questions'
      },
      technicalAccuracy: {
        name: 'Technical Accuracy',
        description: 'Factual correctness and technical understanding'
      },
      depthOfKnowledge: {
        name: 'Depth of Knowledge',
        description: 'Level of detail and specific examples provided'
      },
      communicationClarity: {
        name: 'Communication Clarity',
        description: 'Structure, conciseness, and clarity of expression'
      },
      problemSolvingApproach: {
        name: 'Problem-Solving',
        description: 'Analytical thinking and effective methodologies'
      }
    };

    return (
      <div className="parameter-scores-container">
        <h3>Evaluation Parameters</h3>
        <div className="parameter-scores">
          {Object.entries(parameterScores).map(([param, data]) => {
            const info = parameterInfo[param] || { name: param, description: '' };
            const percentage = (data.score / data.maxScore) * 100;
            
            return (
              <div key={param} className="parameter-score-item">
                <div className="parameter-info">
                  <span className="parameter-name">{info.name}</span>
                  <span className="parameter-value">{data.score}/{data.maxScore}</span>
                </div>
                <div className="parameter-bar-container">
                  <div 
                    className="parameter-bar" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getScoreColor(percentage)
                    }}
                  ></div>
                </div>
                <div className="parameter-description">{info.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="feedback-screen">
      <h2>Your Interview Results</h2>
      
      {isLoading ? (
        <div className="loading-container">
          <p>Analyzing your interview responses...</p>
          <div className="loading-spinner"></div>
        </div>
      ) : errorMessage ? (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      ) : (
        <React.Fragment>
          <div className="feedback-header">
            {score !== null && (
              <div className="score-container">
                <div 
                  className="score-circle" 
                  style={{ 
                    backgroundColor: getScoreColor(score),
                    boxShadow: `0 0 15px ${getScoreColor(score)}`
                  }}
                >
                  <span className="score-value">{score}</span>
                  <span className="score-max">/100</span>
                </div>
                <div className="score-label" style={{ color: getScoreColor(score) }}>
                  {getScoreLabel(score)}
                </div>
              </div>
            )}
            
            <div className="overall-feedback">
              <h3>Interview Summary</h3>
              <p>{overallFeedback}</p>
            </div>
          </div>
          
          {/* Display parameter scores if available */}
          {renderParameterScores()}
          
          {questionFeedback.length > 0 && (
            <div className="question-feedback-container">
              <h3>Question-by-Question Feedback</h3>
              
          {questionFeedback.map((item, index) => (
            <div key={index} className="question-feedback-card">
              <div className="question-number">Question {index + 1}</div>
              <div className="question-text">{item.question}</div>
              <div className="answer-summary">
                <h4>Your Answer:</h4>
                <p className="answer-text">{item.answer.substring(0, 100)}{item.answer.length > 100 ? '...' : ''}</p>
              </div>

              <div className="expected-answer-summary">
                <h4>Expected Answer:</h4>
                <pre className="expected-answer-text">{item.expectedAnswer || 'No expected answer available.'}</pre>
              </div>
              
              {/* Display parameter breakdown if available */}
              {item.parameterBreakdown && (
                <div className="parameter-breakdown">
                  <h4>Parameter Scores:</h4>
                  <ul className="parameter-list">
                    {item.parameterBreakdown.map((param, pIndex) => (
                      <li key={pIndex} className="parameter-item">{param}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="feedback-summary">
                <h4>Feedback:</h4>
                <p>{item.feedback}</p>
              </div>
            </div>
          ))}
            </div>
          )}
          

          <button onClick={onBack} className="back-button">Back to Home</button>
        </React.Fragment>
      )}
    </div>
  );
}

export default FeedbackScreen;

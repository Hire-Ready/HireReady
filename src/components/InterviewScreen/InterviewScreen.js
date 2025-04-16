import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './InterviewScreen.css';
import { useLocation, useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import io from 'socket.io-client';

function InterviewScreen({ onFinish, onBack }) {
  const location = useLocation();
  const { candidateId } = useParams(); // Extract candidateId from URL params
  const { resumeData, jobDescription, employeeCount, role, existingQuestions } = location.state || {};
  const [candidateInfo, setCandidateInfo] = useState(null);
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [showTextInput, setShowTextInput] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Update answer when transcript changes
  useEffect(() => {
    if (transcript && isListening) {
      setAnswer(transcript);
    }
  }, [transcript, isListening]);

  // Socket.io setup
  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });
    
    socketRef.current.on('ai-response', (response) => {
      console.log('Received AI response:', response);
      setFeedback(response.feedback || '');
      setAiSpeaking(false);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Store answer without processing with Ollama during interview
  const storeAnswer = () => {
    if (!answer.trim()) return;
    
    // Just simulate AI speaking the next question
    setAiSpeaking(true);
    setTimeout(() => setAiSpeaking(false), 1000);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      
      // Use default questions in case we don't get data from the backend
      const defaultQuestions = [
        'Tell me about yourself.',
        'Why do you want this job?',
        'What are your strengths?',
        'What are your weaknesses?',
        'Where do you see yourself in 5 years?'
      ];
      
      if (!resumeData && !jobDescription && !role) {
        console.log('Using default questions due to missing data');
        setQuestions(defaultQuestions);
        setLoading(false);
        return;
      }
      
      const payload = {
        resumeData: resumeData || [],
        jobDescription: jobDescription || 'Not provided',
        employeeCount: employeeCount || 'Not provided',
        role: role || 'Not provided',
        existingQuestions: existingQuestions || ['Tell me about yourself.', 'Why do you want this job?'],
        // If candidateId is provided, include it for resume-specific questions
        ...(candidateId && { candidateId: parseInt(candidateId) })
      };
      
      console.log('Sending request to backend for questions', payload);
      
      try {
        const response = await axios.post('http://localhost:3001/questions', payload);
        console.log('Backend response:', response.data);
        
        if (response.data.questions && Array.isArray(response.data.questions) && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
        } else {
          console.log('No valid questions in response, using defaults');
          setQuestions(defaultQuestions);
        }
        
        // Set candidate info if we have resumeData and candidateId
        if (resumeData && candidateId && parseInt(candidateId) <= resumeData.length) {
          setCandidateInfo(resumeData[parseInt(candidateId) - 1]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load interview questions. Using default questions instead.');
        setQuestions(defaultQuestions);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [resumeData, jobDescription, employeeCount, role, existingQuestions]);

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Your browser doesn't support speech recognition. Please use a modern browser or type your answers.");
      return;
    }
    
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    }
  };

  const toggleInputMode = () => {
    setShowTextInput(!showTextInput);
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
  };

  const handleNext = () => {
    // Stop listening if active
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
    
    // Store the current answer
    const updatedAnswers = [...userAnswers, answer];
    
    // Clear the current answer and reset transcript
    setAnswer('');
    resetTranscript();
    
    if (currentQuestion + 1 < questions.length) {
      // Move to the next question
      setCurrentQuestion(currentQuestion + 1);
      // Simulate AI speaking the next question
      setAiSpeaking(true);
      setTimeout(() => setAiSpeaking(false), 1000);
      // Update the answers array
      setUserAnswers(updatedAnswers);
    } else {
      // Add candidate info to responses if available
      const responsesWithContext = {
        answers: updatedAnswers,
        questions: questions,
        candidateId: candidateId,
        candidateInfo: candidateInfo,
        role: role
      };
      // Finish the interview and redirect to feedback
      onFinish(responsesWithContext);
    }
  };

  if (loading) return (
    <div className="interview-screen">
      <h2>Preparing Your Interview...</h2>
      <p>Loading questions tailored for this position...</p>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="interview-screen">
      <h2>
        {candidateInfo?.email ? `Interview for ${candidateInfo.email}` : ''}
        {role ? ` - ${role} Position` : ''}
      </h2>
      
      <div className="interview-container">
        <div className="video-container">
          <div className={`ai-video ${aiSpeaking ? 'speaking' : ''}`}>
            <div className="ai-avatar">
              <img src="/images/ai-interviewer.png" alt="AI Interviewer" onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=AI+Interviewer";
              }} />
            </div>
            <div className="ai-status">
              {aiSpeaking ? 'Speaking...' : 'Listening...'}
            </div>
          </div>
          
          <div className="user-video">
            <Webcam
              audio={true}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 320,
                height: 240,
                facingMode: "user"
              }}
            />
            <div className={`listening-indicator ${isListening ? 'active' : ''}`}>
              {isListening ? 'Recording...' : 'Click mic to speak'}
            </div>
          </div>
        </div>
        
        <div className="question-container">
          <h3>Question {currentQuestion + 1} of {questions.length}</h3>
          {error && <p className="error-message">{error}</p>}
          <p className="question">{questions[currentQuestion]}</p>
          
          <div className="input-toggle">
            <button onClick={toggleInputMode} className="toggle-button">
              {showTextInput ? 'Switch to Voice' : 'Switch to Text'}
            </button>
          </div>
          
          {showTextInput ? (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
            />
          ) : (
            <div className="speech-answer">
              <div className="transcript-container">
                {transcript || "Your spoken answer will appear here..."}
              </div>
              <button 
                onClick={toggleListening} 
                className={`mic-button ${isListening ? 'recording' : ''}`}
              >
                {isListening ? 'Stop' : 'Start'} Recording
              </button>
            </div>
          )}
          
          
          <div className="button-group">
            <button onClick={handleNext} className="next-button">
              {currentQuestion + 1 === questions.length ? 'Finish Interview' : 'Next Question'}
            </button>
            <button onClick={onBack} className="back-button">Back to Home</button>
          </div>
          
          <div className="progress-indicator">
            {questions.map((_, index) => (
              <span 
                key={index} 
                className={`progress-dot ${index === currentQuestion ? 'active' : index < currentQuestion ? 'completed' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewScreen;
const nodemailer = require('nodemailer');

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

module.exports = { sendEmail };

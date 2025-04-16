const express = require('express');
const { sendEmail } = require('../utils/emailUtils');

const router = express.Router();

router.post('/send-interview-invites', async (req, res) => {
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
      const interviewLink = `http://localhost:3000/interview`;
      
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
          simulated: !process.env.EMAIL_USER
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

module.exports = router;

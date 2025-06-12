const express = require('express');
const dotenv = require('dotenv');
const sendgridMail = require('@sendgrid/mail');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Configure SendGrid API key
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

// Health check (optional)
app.get('/', (req, res) => {
  res.send('✅ Ultravox email tool server is running.');
});

// Tool endpoint for Ultravox agent
app.post('/tools/email', async (req, res) => {
  const { email } = req.body;

  // Validate input
  if (!email || !email.includes('@')) {
    return res.status(400).json({ status: 'error', message: 'Invalid email provided.' });
  }

 const msg = {
  to: email,
  from: process.env.FROM_EMAIL, // ✅ must be a simple string
  subject: 'Verify your email for FedEx Job Screening',
  html: `
    <p>Hello,</p>
    <p>This is RecruitAI from FedEx. Please reply to this email to verify your address and continue the job screening process.</p>
    <p>Thank you!</p>
  `,
};



  try {
    await sendgridMail.send(msg);
    console.log(`✅ Verification email sent to: ${email}`);
    res.status(200).json({ status: 'sent', email });
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    res.status(500).json({ status: 'failed', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Tool server is running on http://localhost:${PORT}`);
});

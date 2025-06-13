const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON request bodies
app.use(express.json());

// ✅ Email format validator
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('✅ SMTP tool server is running.');
});

// Create SMTP transporter with Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // e.g. smtp.gmail.com
  port: Number(process.env.SMTP_PORT),  // e.g. 465
  secure: process.env.SMTP_SECURE === 'true', // true for SSL (465), false for TLS (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Endpoint to send email
app.post('/tools/email', async (req, res) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ status: 'error', message: 'Invalid email format.' });
  }

  // Early response to Ultravox
  res.status(200).json({ status: 'queued', email });

  const mailOptions = {
    from: `"RecruitAI - FedEx" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email for FedEx Job Screening',
    html: `
      <p>Hello,</p>
      <p>This is RecruitAI from FedEx. Please reply to this email to verify your address and continue the job screening process.</p>
      <p>Thank you!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📤 Verification email sent to: ${email}`);
  } catch (error) {
    console.error('❌ SMTP error:', error.message || error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Tool server is running at http://localhost:${PORT}`);
});

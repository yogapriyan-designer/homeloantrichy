const express = require('express');
const transporter = require('./mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  try {
    await transporter.sendMail({
      from: `"Home Loan Trichy Website" <${process.env.EMAIL_USER}>`,
      to: 'ganesh812sri@gmail.com',
      replyTo: email || undefined,
      subject: `New Enquiry from ${name}`,
      text: `
New enquiry received from the website:

Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Message: ${message || 'Not provided'}
      `.trim()
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err);
    res.status(500).json({ error: 'Failed to send enquiry. Please try again.' });
  }
});

module.exports = router;
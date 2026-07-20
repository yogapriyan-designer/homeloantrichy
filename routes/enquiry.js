const express = require('express');
const transporter = require('./mailer');

const router = express.Router();

router.post('/', (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  // Respond to the user right away — don't make them wait on email delivery
  res.json({ success: true });

  // Send the notification email in the background
  transporter.sendMail({
    from: `"Home Loan Trichy Website" <${process.env.EMAIL_USER}>`,
  to: 'rajibalayoga@gmail.com',
    replyTo: email || undefined,
    subject: `New Enquiry from ${name}`,
    text: `
New enquiry received from the website:

Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Message: ${message || 'Not provided'}
    `.trim()
  }).catch(err => console.error('Enquiry email failed:', err));
});

module.exports = router;
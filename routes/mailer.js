const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,  // 10s to connect
  greetingTimeout: 10000,
  socketTimeout: 10000
});

module.exports = transporter;
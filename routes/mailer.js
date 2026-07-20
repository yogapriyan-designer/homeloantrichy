const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = {
  sendMail: async ({ from, to, subject, text, replyTo }) => {
    return resend.emails.send({
      from: 'Home Loan Trichy <onboarding@resend.dev>',
      to,
      subject,
      text,
      reply_to: replyTo
    });
  }
};
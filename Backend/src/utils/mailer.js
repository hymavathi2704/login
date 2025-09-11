const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send verification email
const sendVerificationEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject: 'Verify Your Email',
    html: `<p>Hello,</p>
           <p>Please verify your email by clicking <a href="${url}">here</a>.</p>
           <p>Link expires in 24 hours.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Verification email sent to', to);
  } catch (error) {
    console.error('Error sending verification email:', error.response ? error.response.body : error);
  }
};

// Send reset password email
const sendResetPasswordEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject: 'Reset Your Password',
    html: `<p>Hello,</p>
           <p>Reset your password by clicking <a href="${url}">here</a>.</p>
           <p>Link expires in 1 hour.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Reset password email sent to', to);
  } catch (error) {
    console.error('Error sending reset password email:', error.response ? error.response.body : error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};

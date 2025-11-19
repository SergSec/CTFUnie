const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL || (user || 'no-reply@afyl.legal');

let transporter = null;
if (host && port && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
} else {
  // Try create a default transport (will likely fail in production)
  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
}

async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    console.warn('No email transporter configured');
    return;
  }

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // If using jsonTransport, info.message will contain the JSON
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendEmail };

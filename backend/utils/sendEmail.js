const nodemailer = require("nodemailer");

let transporter = null;

// Build the transporter only the first time an email is actually sent,
// not at module-load time — this avoids reading env vars before
// dotenv.config() has run, regardless of require order elsewhere.
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
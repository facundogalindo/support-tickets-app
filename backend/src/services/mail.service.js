require("dotenv").config();
const nodemailer = require("nodemailer");

const isProduction = process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  if (isProduction) {
    console.log(
      `[MAIL DESACTIVADO EN PRODUCCION] To: ${to} | Subject: ${subject}`
    );
    return;
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });

  console.log("Mail enviado:", info.messageId);
};

module.exports = {
  sendMail,
};
const nodemailer = require("nodemailer");

const mailSender = (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = transporter.sendMail({
      from: "StudyNotion || CodeHelp - by Atul Singh",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log(info);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = mailSender;

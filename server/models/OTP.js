const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

async function sendVerficationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Varification Email from StudyNotion",
      emailTemplate(otp)
    );
  } catch (error) {
    console.log("error occured while sending mailes:", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerficationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);

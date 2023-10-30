const Razorpay = require("razorpay");
require("dotenv").config();

exports.instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
  // key_id: "rzp_test_Qq1R28RDozLWGC",
  // key_secret: "97Dbt9GGaIAtnN2CvWDi2Q3s",
});

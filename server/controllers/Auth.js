const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

//! Send OTP For Email Verification
// HW -> email valdation karo email sahi hai ya nhi

exports.sendotp = async (req, res) => {
  try {
    // fetch email from req body
    const { email } = req.body;

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email });

    // to be used in case of signup
    // If user found with provided email
    // check if user already exist
    if (checkUserPresent) {
      return res.status(401).json({
        // Return 401 Unauthorized status code with error message
        success: false,
        message: "User already registered",
      });
    }

    // if user not exist then generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // check unique OTP or not
    let uniqueOtpResult = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", uniqueOtpResult);
    // if get otp same then do generate otp continue till when not get unique otp
    while (uniqueOtpResult) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      uniqueOtpResult = await OTP.findOne({ otp: otp });
    }

    const otpPayload = {
      email,
      otp,
    };

    // create an entry for otp in database
    const otpBody = await OTP.create(otpPayload);
    console.log("otpBody ->>", otpBody);

    // return response successfull
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "not sent otp something is error",
      error: error.message,
    });
  }
};

//! Signup Controller for Registering USers

exports.signup = async (req, res) => {
  try {
    // data fetch from req ki body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: " All field are required",
      });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          " Password and ConfirmPassword value does not match, please try again",
      });
    }

    // check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Find the most recent OTP for the email
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("recentOtp-->>", recentOtp);

    // validate OTP
    if (recentOtp.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      // invalid otp
      return res.status(400).json({
        success: false,
        message: "invalid otp",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log("Auth 153 failed");
    // Create the user
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    // console.log("Auth 158 failed");
    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: " ",
      dob: " ",
      about: " ",
      contactNumber: " ",
    });
    // console.log("Auth 166 failed");

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    // console.log("Auth 178 failed");
    // return res
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again",
      error: error.message,
    });
  }
};

//! Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // validate data- Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }
    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails");

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first",
      });
    }
    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      // Save token to user document in database
      user.token = token;
      user.password = undefined;

      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again",
    });
  }
};

//! Controller for Changing Password
//TODO -- done by me
exports.changePassword = async (req, res) => {
  try {
    // get user data from req body
    const userDetails = await User.findById(req.user.id);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    console.log("old password from controller --->", oldPassword);
    console.log("new password from controller --->", newPassword);
    console.log("confirmNewPassword from controller --->", confirmNewPassword);

    console.log("isPasswordMatch--->", oldPassword);
    console.log("isPasswordMatch--->", userDetails?.password);
    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails?.password
    );

    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Match new password and confirm new password
    if (newPassword !== confirmNewPassword) {
      // If new password and confirm new password do not match, return a 400 (Bad Request) error
      return res.status(400).json({
        success: false,
        message: "The password and confirm password does not match",
      });
    }

    // Update Password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse?.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }
    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};

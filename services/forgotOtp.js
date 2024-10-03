const nodemailer = require("nodemailer");
let otp;

async function forgotOtp(email, otp) {
    console.log("ye aya email or otp:",email,otp)
    const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 587,
    auth: {
      user: "parasnegi4143@gmail.com",
      pass: "fkcm dulq ccwu ggxs",
    },
  });

  const mailOptions = {
    from: "parasnegi4143@gmail.com",
    to: email,
    subject: "Forgot Password",
    text: `Use this OTP for Changing Password!Your OTP is: ${otp}.`,
  };

  console.log("email",email);
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email send to ${email}`);
  } catch (error) {
    console.error(`Error sending email : ${error}`);
    throw new Error("Failed to send email");
  }
}

module.exports = { forgotOtp };
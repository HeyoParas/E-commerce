const nodemailer = require("nodemailer");
let otp;

async function sendOtp(email, otp) {
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
    subject: "Verify your Email",
    text: `Thank you for signing up!Your OTP is: ${otp}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email send to ${email}`);
  } catch (error) {
    console.error(`Error sending email : ${error}`);
    throw new Error("Failed to send email");
  }
}

module.exports = { sendOtp };

const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_ID,
    to,
    subject: "Your One-Time Password (OTP) for Verification",
    html: `
  <div style="font-family: Arial, sans-serif; color:#333; padding:20px;">
    <h2 style="color:#0A66C2;">Verification Request</h2>

    <p>Hello,</p>
    
    <p>We received a request to verify your email address.  
    Please use the OTP below to proceed:</p>

    <div style="
      margin: 20px 0;
      padding: 15px 20px;
      background: #f1f5f9;
      border-left: 4px solid #0A66C2;
      display: inline-block;
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 3px;">
        ${otp}
    </div>

    <p>This OTP is valid for <strong>5 minutes</strong>.</p>

    <p>If you did <strong>not</strong> request a verification,  
    please ignore this email. Your account is safe.</p>

    <br/>

    <p>Regards,<br/>
    <strong>Support Team</strong></p>

    <hr style="margin-top:30px; border:none; border-top:1px solid #ddd;"/> 
    <p style="font-size:12px; color:#888;">
    This is an automated message, please do not reply.
    </p>
  </div>
`
  });
};


module.exports = sendOTPMail;
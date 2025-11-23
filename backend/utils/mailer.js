const nodemailer = require('nodemailer');

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }
  return transporter;
}

function otpEmailTemplate({
  title = 'Verify your WasteZero account',
  otp,
  intro,
  footerNote,
  variant = 'default'
}) {
  // Shared brand pieces
  const brandHeader = `
    <div style="text-align:center;margin-bottom:22px;">
      <div style="width:62px;height:62px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:#e6f9ef;">
        <span style="font-size:34px;line-height:1;">♻️</span>
      </div>
      <div style="font-size:26px;font-weight:600;color:#136f46;letter-spacing:.5px;font-family:Arial,Helvetica,sans-serif;">WasteZero</div>
    </div>`;

  let heading = title;
  let paragraph = intro || 'Use the one-time code below. It is valid for the next <b>5 minutes</b>.';
  if (variant === 'email-change') {
    heading = title || 'Confirm Your New Email';
    paragraph = intro || 'We received a request to change the email on your WasteZero account. Use the OTP below to confirm. It is valid for the next <b>5 minutes</b>.';
  } else if (variant === 'password-reset') {
    heading = title || 'Password Reset Request';
    paragraph = intro || 'We received a request to reset your WasteZero account password. Please use the OTP below to continue. It is valid for the next <b>5 minutes</b>.';
  }

  const footer = footerNote || 'Thank you for being part of the <span style="font-weight:600;">WasteZero</span> movement. Together, we\'re making cities greener and cleaner.';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f7f9;padding:34px 20px;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;padding:42px 50px 48px;border:1px solid #e5e7eb;box-shadow:0 4px 18px rgba(0,0,0,.04);">
      ${brandHeader}
      <h1 style="font-size:22px;margin:0 0 14px;color:#0f4730;font-weight:600;letter-spacing:.3px;text-align:center;">${heading}</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 26px;color:#374151;text-align:center;">${paragraph}</p>
      <div style="background:#ecfdf5;border:1px solid #b6efd7;color:#064e3b;font-size:32px;font-weight:600;letter-spacing:12px;padding:20px 10px;border-radius:12px;text-align:center;margin:0 0 28px;">${otp.split('').join(' ')}</div>
      <p style="color:#6b7280;font-size:12px;line-height:1.5;margin:0 0 8px;text-align:center;">If you didn\'t request this, you can safely ignore this email. Your account remains secure.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:34px 0 22px" />
      <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0;text-align:center;">${footer}</p>
    </div>
    <p style="color:#9ca3af;font-size:11px;margin:16px 0 0;text-align:center;">© ${new Date().getFullYear()} WasteZero • Do not reply</p>
  </div>`;
}

async function sendOtpEmail(to, otp, options = {}) {
  const transport = getTransporter();
  const html = otpEmailTemplate({ otp, variant: options.variant, ...options });
  return transport.sendMail({
    from: `"WasteZero Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: options.subject || 'Your WasteZero Verification Code',
    html
  });
}

module.exports = { sendOtpEmail };

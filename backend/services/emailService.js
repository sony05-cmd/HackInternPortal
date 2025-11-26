// Email notification service using nodemailer
const nodemailer = require('nodemailer');

// Create transporter - configure with your email service
// For development, you can use Ethereal (fake SMTP service)
// For production, use Gmail, SendGrid, or other email service

let transporter;

// Initialize email transporter
const initializeEmail = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production: Use environment variables
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Email service configured from environment');
  } else {
    // Development: Use Ethereal (test email service)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Email service using Ethereal (test mode)');
      console.log('   Preview emails at: https://ethereal.email');
    } catch (error) {
      console.warn('⚠️  Email service not configured. Email notifications disabled.');
      console.warn('   To enable, set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
      transporter = null;
    }
  }
};

// Send application status update email
const sendApplicationStatusEmail = async (applicantEmail, applicantName, opportunityTitle, status) => {
  if (!transporter) {
    console.warn('Email not sent: transporter not configured');
    return false;
  }

  try {
    const statusMessages = {
      accepted: {
        subject: `🎉 Your application has been accepted!`,
        text: `Congratulations ${applicantName}!\n\nYour application for "${opportunityTitle}" has been accepted.\n\nThe recruiter will contact you soon with next steps.\n\nBest regards,\nHackathon & Internship Portal Team`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #28a745;">🎉 Congratulations!</h2>
            <p>Dear ${applicantName},</p>
            <p>We're excited to inform you that your application for <strong>"${opportunityTitle}"</strong> has been <strong style="color: #28a745;">accepted</strong>!</p>
            <p>The recruiter will contact you soon with the next steps.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">Best regards,<br>Hackathon & Internship Portal Team</p>
          </div>
        `
      },
      rejected: {
        subject: `Update on your application`,
        text: `Dear ${applicantName},\n\nThank you for your interest in "${opportunityTitle}".\n\nAfter careful consideration, we have decided to move forward with other candidates at this time.\n\nWe encourage you to apply for other opportunities on our portal.\n\nBest regards,\nHackathon & Internship Portal Team`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2>Application Update</h2>
            <p>Dear ${applicantName},</p>
            <p>Thank you for your interest in <strong>"${opportunityTitle}"</strong>.</p>
            <p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
            <p>We encourage you to explore other exciting opportunities on our platform!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">Best regards,<br>Hackathon & Internship Portal Team</p>
          </div>
        `
      }
    };

    const emailContent = statusMessages[status];
    if (!emailContent) {
      console.warn(`No email template for status: ${status}`);
      return false;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Hackathon Portal" <noreply@hackathonportal.com>',
      to: applicantEmail,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    console.log('✅ Email sent:', info.messageId);
    
    // Preview URL for Ethereal
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

// Send new application notification to recruiter
const sendNewApplicationEmail = async (recruiterEmail, recruiterName, applicantName, opportunityTitle) => {
  if (!transporter) {
    console.warn('Email not sent: transporter not configured');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Hackathon Portal" <noreply@hackathonportal.com>',
      to: recruiterEmail,
      subject: `New Application: ${opportunityTitle}`,
      text: `Dear ${recruiterName},\n\nYou have a new application for "${opportunityTitle}" from ${applicantName}.\n\nLog in to your dashboard to review the application.\n\nBest regards,\nHackathon & Internship Portal Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #007bff;">New Application Received</h2>
          <p>Dear ${recruiterName},</p>
          <p>You have a new application for <strong>"${opportunityTitle}"</strong></p>
          <p><strong>Applicant:</strong> ${applicantName}</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/recruiter_dashboard.html" 
               style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              Review Application
            </a>
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">Best regards,<br>Hackathon & Internship Portal Team</p>
        </div>
      `
    });

    console.log('✅ Recruiter notification sent:', info.messageId);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  if (!transporter) {
    console.warn('Email not sent: transporter not configured');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Hackathon Portal" <noreply@hackathonportal.com>',
      to: userEmail,
      subject: 'Password Reset Request',
      text: `Dear ${userName},\n\nYou requested to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nHackathon & Internship Portal Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Dear ${userName},</p>
          <p>You requested to reset your password for your Hackathon & Internship Portal account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #2563eb; word-break: break-all;">${resetUrl}</p>
          <p style="color: #dc3545; margin-top: 20px;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
          <p style="color: #666;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">Best regards,<br>Hackathon & Internship Portal Team</p>
        </div>
      `
    });

    console.log('✅ Password reset email sent:', info.messageId);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

module.exports = {
  initializeEmail,
  sendApplicationStatusEmail,
  sendNewApplicationEmail,
  sendPasswordResetEmail
};

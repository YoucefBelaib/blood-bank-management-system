import nodemailer from "nodemailer";
import { logger } from "../logger/logger";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
  sendPasswordResetEmail(
    email: string,
    hospitalName: string,
    resetToken: string
  ): Promise<boolean>;
  sendUserPasswordResetEmail(
    username: string,
    resetToken: string
  ): Promise<boolean>;
}

/**
 * Email service for sending transactional emails.
 *
 * For production, configure SMTP settings via environment variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_USER: SMTP authentication username
 * - SMTP_PASS: SMTP authentication password
 * - SMTP_FROM: Default "from" email address
 * - APP_URL: Base URL of the application for links
 */
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private appUrl: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM || "noreply@vitablood.com";
    this.appUrl = process.env.APP_URL || "http://localhost:5000";
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Only create transporter if SMTP is configured
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      logger.log("Email service initialized with SMTP configuration");
    } else {
      logger.log(
        "Email service running in development mode - emails will be logged but not sent"
      );
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;

    // In development mode, log the email instead of sending
    if (!this.transporter) {
      logger.log("=== Development Email (not sent) ===");
      logger.log(`To: ${to}`);
      logger.log(`Subject: ${subject}`);
      logger.log(`Body: ${text || html}`);
      logger.log("=== End Email ===");
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      });
      logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.log(`Failed to send email to ${to}: ${error}`);
      return false;
    }
  }

  /**
   * Sends a password reset email to the hospital.
   * The reset link expires in 30 minutes.
   */
  async sendPasswordResetEmail(
    email: string,
    hospitalName: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${this.appUrl}/hospital/reset-password?token=${resetToken}`;
    const expirationMinutes = 30;

    const subject = "VitaBlood - Password Reset Request";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">VitaBlood</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Hospital Portal</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
    
    <p>Hello${hospitalName ? `, <strong>${hospitalName}</strong>` : ""},</p>
    
    <p>We received a request to reset the password for your VitaBlood Hospital Portal account.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
    </p>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="color: #991b1b; margin: 0; font-size: 14px;">
        <strong>⏰ This link expires in ${expirationMinutes} minutes.</strong>
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      If you didn't request this password reset, you can safely ignore this email. 
      Your password will remain unchanged.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-bottom: 0;">
      This is an automated message from VitaBlood. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
`;

    const text = `
VitaBlood - Password Reset Request

Hello${hospitalName ? ` ${hospitalName}` : ""},

We received a request to reset the password for your VitaBlood Hospital Portal account.

Click the link below to reset your password:
${resetUrl}

This link expires in ${expirationMinutes} minutes.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

---
This is an automated message from VitaBlood. Please do not reply to this email.
`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  /**
   * Sends a password reset email/notification for admin users.
   * Since users don't have email addresses, this logs the reset link in dev mode.
   * In production, you would need to add email to users table.
   */
  async sendUserPasswordResetEmail(
    username: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;
    const expirationMinutes = 30;

    const subject = "VitaBlood - Admin Password Reset Request";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">VitaBlood</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Admin Portal</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
    
    <p>Hello <strong>${username}</strong>,</p>
    
    <p>We received a request to reset the password for your VitaBlood Admin account.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
    </p>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="color: #991b1b; margin: 0; font-size: 14px;">
        <strong>⏰ This link expires in ${expirationMinutes} minutes.</strong>
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      If you didn't request this password reset, you can safely ignore this email. 
      Your password will remain unchanged.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-bottom: 0;">
      This is an automated message from VitaBlood. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
`;

    const text = `
VitaBlood - Admin Password Reset Request

Hello ${username},

We received a request to reset the password for your VitaBlood Admin account.

Click the link below to reset your password:
${resetUrl}

This link expires in ${expirationMinutes} minutes.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

---
This is an automated message from VitaBlood. Please do not reply to this email.
`;

    // In development mode, log the reset link prominently
    logger.log("=== Admin Password Reset Link ===");
    logger.log(`Username: ${username}`);
    logger.log(`Reset URL: ${resetUrl}`);
    logger.log(`Expires in: ${expirationMinutes} minutes`);
    logger.log("=================================");

    // Note: Since users don't have emails, we just log in dev mode
    // In production, you would need to add email field to users
    return true;
  }
}

import nodemailer from 'nodemailer';

// Configure standard SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderStatusEmail = async (order: any) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials not configured. Skipping order status email.");
    return;
  }

  if (!order.customerEmail) {
    console.warn(`No customer email found for order ${order.id}. Skipping email.`);
    return;
  }

  const subject = `Update on your YSG Machinery Order #${order.id.slice(-6).toUpperCase()}`;
  
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    completed: '#10b981',
    cancelled: '#ef4444',
    failed: '#ef4444',
  };
  
  const color = statusColors[order.status?.toLowerCase()] || '#475569';
  const statusLabel = order.status?.toUpperCase() || 'UPDATED';

  const html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; text-transform: uppercase;">YSG Machinery</h2>
      <p style="color: #475569; font-size: 16px;">Hello <strong>${order.customerName}</strong>,</p>
      <p style="color: #475569; font-size: 16px;">The status of your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has been updated.</p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-left: 4px solid ${color};">
        <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">Current Status</p>
        <p style="margin: 5px 0 0; font-size: 24px; color: ${color}; font-weight: bold;">${statusLabel}</p>
      </div>

      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        If you have any questions or need further assistance, please reply to this email or contact our support team.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        YSG Machinery &copy; ${new Date().getFullYear()} All Rights Reserved.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"YSG Machinery" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject,
      html,
    });
    console.log(`✉️ Order status email sent to ${order.customerEmail} for order ${order.id}`);
  } catch (error) {
    console.error("Failed to send order status email:", error);
  }
};

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const sendInquiryReplyEmail = async (
  inquiry: any,
  replyMessage: string
): Promise<{ sent: boolean; reason?: string }> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials not configured. Skipping inquiry reply email.");
    return { sent: false, reason: "smtp_not_configured" };
  }

  if (!inquiry?.email) {
    return { sent: false, reason: "missing_customer_email" };
  }

  const customerName = escapeHtml(String(inquiry.customerName || inquiry.name || "Customer"));
  const safeOriginal = escapeHtml(String(inquiry.message || "")).replace(/\n/g, "<br/>");
  const safeReply = escapeHtml(replyMessage).replace(/\n/g, "<br/>");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; text-transform: uppercase;">YSG Machinery</h2>
      <p style="color: #475569; font-size: 15px;">Hello <strong>${customerName}</strong>,</p>
      <p style="color: #475569; font-size: 14px;">Thank you for contacting YSG Machinery. Here is our response to your inquiry:</p>
      <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #1d4ed8; color: #0f172a; font-size: 14px; line-height: 1.6;">
        ${safeReply}
      </div>
      ${safeOriginal ? `
        <p style="color: #64748b; font-size: 12px; margin-bottom: 6px;">Your original message:</p>
        <blockquote style="margin: 0; padding: 12px; background-color: #f1f5f9; border-radius: 6px; color: #475569; font-size: 13px;">
          ${safeOriginal}
        </blockquote>
      ` : ""}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        YSG Machinery &copy; ${new Date().getFullYear()} All Rights Reserved.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"YSG Machinery" <${process.env.SMTP_USER}>`,
      to: inquiry.email,
      subject: `Re: Your Inquiry at YSG Machinery`,
      html,
    });
    console.log(`✉️ Inquiry reply email sent to ${inquiry.email} for inquiry ${inquiry.id}`);
    return { sent: true };
  } catch (error: any) {
    console.error("Failed to send inquiry reply email:", error);
    return { sent: false, reason: error?.message || "smtp_send_failed" };
  }
};

export const sendAdminPasswordResetEmail = async (
  user: { name?: string; email: string },
  resetUrl: string
): Promise<{ sent: boolean; reason?: string }> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials not configured. Skipping admin reset email.");
    return { sent: false, reason: "smtp_not_configured" };
  }

  const displayName = escapeHtml(String(user.name || "Administrator"));
  const safeUrl = escapeHtml(resetUrl);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #004691; margin-bottom: 12px;">YSG Management System</h2>
      <p style="color: #334155; font-size: 15px;">Hello <strong>${displayName}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        A password reset was requested for your admin account. Click the button below to set a new password.
        This link expires in <strong>15 minutes</strong> and can only be used once.
      </p>
      <div style="margin: 24px 0; text-align: center;">
        <a href="${safeUrl}" style="display: inline-block; background-color: #004691; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 14px;">
          Reset Admin Password
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; word-break: break-all;">
        Or copy this link: ${safeUrl}
      </p>
      <p style="color: #64748b; font-size: 12px; margin-top: 18px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"YSG Machinery Admin" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "YSG Admin Password Reset Request",
      html,
    });
    console.log(`✉️ Admin password reset email sent to ${user.email}`);
    return { sent: true };
  } catch (error: any) {
    console.error("Failed to send admin password reset email:", error);
    return { sent: false, reason: error?.message || "smtp_send_failed" };
  }
};

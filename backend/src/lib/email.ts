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

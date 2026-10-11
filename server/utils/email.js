const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendPurchaseConfirmation = async (userEmail, userName, order, downloadLinks) => {
  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('placeholder') || process.env.SMTP_PASS === 'testpass') {
      console.log(`[Dev Email Simulation] Confirmation sent to ${userEmail} for Order ${order.razorpayOrderId}`);
      return true;
    }

    const transporter = createTransporter();

    const itemsList = order.items
      .map(
        (item, i) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.title}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              <a href="${downloadLinks[i]}" style="color: #6366f1; text-decoration: none;">Download</a>
            </td>
          </tr>`
      )
      .join('');

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📚 BrainByte Books</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0;">Purchase Confirmation</p>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0;">
          <p>Hi ${userName},</p>
          <p>Thank you for your purchase! Here are your order details:</p>
          <p><strong>Order ID:</strong> ${order.razorpayOrderId}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left;">Book</th>
                <th style="padding: 12px; text-align: left;">Price</th>
                <th style="padding: 12px; text-align: left;">Download</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          <p style="font-size: 18px; font-weight: 600;">Total: ₹${order.totalAmount.toFixed(2)}</p>
          <p style="color: #64748b; font-size: 14px;">Download links expire in ${process.env.DOWNLOAD_TOKEN_EXPIRY_HOURS || 24} hours. You can generate new links from your purchase history.</p>
        </div>
        <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; background: #f8fafc; border-radius: 0 0 12px 12px;">
          <p>© ${new Date().getFullYear()} BrainByte Books. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: userEmail,
      subject: `Purchase Confirmation - BrainByte Books`,
      html,
    });

    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
};

module.exports = { sendPurchaseConfirmation };

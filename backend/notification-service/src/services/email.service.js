import nodemailer from 'nodemailer';

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export const emailService = {
  async send(to, subject, text) {
    if (!to) {
      return { status: 'not_requested' };
    }

    if (!isSmtpConfigured()) {
      return { status: 'skipped', reason: 'smtp_not_configured' };
    }

    try {
      const info = await createTransporter().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text
      });

      return { status: 'sent', messageId: info.messageId };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }
};


import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInquiryNotification({
  userName,
  subject,
  message,
}: {
  userName: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.SMTP_USER) {
    console.warn("メール設定が不完全です（ADMIN_EMAIL, SMTP_USER, SMTP_PASS）");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: `[問い合わせ] ${subject}`,
    text: [
      `新しい問い合わせが届きました。`,
      ``,
      `ユーザー: ${userName}`,
      `件名: ${subject}`,
      ``,
      `内容:`,
      message,
      ``,
      `管理画面から確認・回答してください。`,
    ].join("\n"),
  });
}

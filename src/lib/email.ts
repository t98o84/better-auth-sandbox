import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mailpit",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
});

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const info = await transporter.sendMail({
    from: '"Better Auth Sandbox" <noreply@example.com>',
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });

  console.log("Email sent:", info.messageId);
  return info;
}

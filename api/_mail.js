// 메일 발송 — 환경변수로 방식 선택
//   SMTP (예: Gmail 앱 비밀번호): SMTP_USER, SMTP_PASS  (선택: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, MAIL_FROM)
//   Resend REST API:              RESEND_API_KEY, MAIL_FROM (예: "DG ASSISTANT <noreply@your-domain.com>")
// SMTP 설정이 있으면 SMTP를 우선 사용합니다. 둘 다 없으면 mailConfigured()가 false → 비밀번호 찾기 API가 503을 반환합니다.

function smtpConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function resendConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

function mailConfigured() {
  return smtpConfigured() || resendConfigured();
}

let smtpTransport = null;
async function sendViaSmtp({ to, subject, text, html }) {
  if (!smtpTransport) {
    const nodemailer = require('nodemailer');
    const port = Number(process.env.SMTP_PORT || 465);
    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: String(process.env.SMTP_PASS).replace(/\s+/g, '') }   // 앱 비밀번호의 공백 제거
    });
  }
  await smtpTransport.sendMail({
    from: process.env.MAIL_FROM || 'DG ASSISTANT <' + process.env.SMTP_USER + '>',
    to, subject, text, html
  });
}

async function sendViaResend({ to, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text, html })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error('mail send failed: HTTP ' + res.status + ' ' + detail.slice(0, 200));
  }
}

async function sendMail(msg) {
  if (smtpConfigured()) return sendViaSmtp(msg);
  return sendViaResend(msg);
}

module.exports = { mailConfigured, sendMail };

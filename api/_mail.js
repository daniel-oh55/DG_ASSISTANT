// 메일 발송 (Resend REST API) — 환경변수: RESEND_API_KEY, MAIL_FROM (예: "DG ASSISTANT <noreply@your-domain.com>")
// 설정이 없으면 mailConfigured()가 false → 비밀번호 찾기 API가 503을 반환합니다.

function mailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

async function sendMail({ to, subject, text, html }) {
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

module.exports = { mailConfigured, sendMail };

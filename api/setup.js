// api/setup.js
// Visit this URL ONCE after deploying to register your webhook with Telegram:
// https://YOUR-VERCEL-DOMAIN.vercel.app/api/setup
//
// It tells Telegram "send updates to /api/webhook on this domain".
// Safe to visit again any time you redeploy to a new domain.

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

module.exports = async (req, res) => {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const webhookUrl = `${proto}://${host}/api/webhook`;

  const body = { url: webhookUrl };
  if (WEBHOOK_SECRET) body.secret_token = WEBHOOK_SECRET;

  const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const result = await response.json();
  return res.status(200).json({ webhookUrl, telegramResponse: result });
};

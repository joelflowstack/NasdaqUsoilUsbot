// api/webhook.js
// Telegram webhook handler — Vercel serverless function.
// Handles /start, sends a welcome message with an inline "Join Channel" button,
// and logs each click for basic tracking (visible in Vercel's function logs).

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_LINK = process.env.CHANNEL_LINK || 'https://t.me/NasdaqUsoilUs100GoldUs500Us30FX';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const WELCOME_TEXT =
  `📈 *NASDAQ | GOLD | FOREX Signals*\n\n` +
  `Live setups on:\n` +
  `NASDAQ, US30, US100, US500, BTCUSD, GOLD, USOIL\n` +
  `USDJPY, GBPUSD, EURUSD, GBPJPY, NZDUSD, EURAUD, EURNZD, GBPNZD, EURCAD, AUDCAD\n\n` +
  `Tap below to join the channel 👇`;

async function sendMessage(chatId) {
  const body = {
    chat_id: chatId,
    text: WELCOME_TEXT,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📊 Join Channel', url: CHANNEL_LINK }]
      ]
    }
  };

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  return res.json();
}

async function answerCallbackQuery(callbackQueryId) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot webhook is live.');
  }

  // Optional shared-secret check (set WEBHOOK_SECRET in Vercel + Telegram setWebhook)
  if (WEBHOOK_SECRET) {
    const headerSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (headerSecret !== WEBHOOK_SECRET) {
      return res.status(401).send('Unauthorized');
    }
  }

  try {
    const update = req.body;

    if (update.message) {
      const chatId = update.message.chat.id;
      const username = update.message.from?.username || update.message.from?.id;

      // Log every /start (and any message) as a click/lead for tracking
      console.log(`[LEAD] user=${username} chatId=${chatId} at=${new Date().toISOString()}`);

      await sendMessage(chatId);
    }

    if (update.callback_query) {
      await answerCallbackQuery(update.callback_query.id);
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).send('ok'); // Always 200 so Telegram doesn't retry-storm
  }
};

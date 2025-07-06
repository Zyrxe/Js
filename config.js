require('dotenv').config();

module.exports = {
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'YOUR_RANDOM_VERIFY_TOKEN_IF_NOT_SET_IN_ENV'
};

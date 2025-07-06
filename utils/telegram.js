const axios = require('axios');
const config = require('../config');

const TELEGRAM_API = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(text) {
    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: config.TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'HTML' // Bisa disesuaikan jika ingin format lain
        });
        console.log('Pesan Telegram berhasil dikirim.');
    } catch (error) {
        console.error('Gagal mengirim pesan Telegram:', error.response ? error.response.data : error.message);
    }
}

module.exports = {
    sendTelegramMessage
};

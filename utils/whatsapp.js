const axios = require('axios');
const config = require('../config');

const WHATSAPP_API = `https://graph.facebook.com/v19.0/${config.WHATSAPP_PHONE_ID}/messages`;

async function sendWhatsAppMessage(to, messageBody) {
    try {
        await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: {
                body: messageBody
            }
        }, {
            headers: {
                'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Pesan WhatsApp berhasil dibalas ke ${to}: ${messageBody}`);
    } catch (error) {
        console.error('Gagal membalas pesan WhatsApp:', error.response ? error.response.data : error.message);
    }
}

module.exports = {
    sendWhatsAppMessage
};

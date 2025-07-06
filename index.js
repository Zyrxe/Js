const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const { sendTelegramMessage } = require('./utils/telegram');
const { sendWhatsAppMessage } = require('./utils/whatsapp');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Penyimpanan sederhana dalam memori untuk status pengguna
// Contoh: { "senderId": { step: 1, country: "", purpose: "" } }
const userSessions = {};

// Endpoint untuk verifikasi webhook dari Meta
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return res.status(200).send(challenge);
        } else {
            console.warn('Verifikasi webhook gagal: Token tidak cocok atau mode salah.');
            return res.sendStatus(403);
        }
    }
    console.warn('Permintaan verifikasi webhook tidak valid.');
    res.sendStatus(400);
});

// Endpoint untuk menerima dan memproses pesan dari WhatsApp
app.post('/webhook', async (req, res) => {
    const body = req.body;

    // Periksa apakah ini event WhatsApp Cloud API
    if (body.object === 'whatsapp_business_account') {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
            const message = body.entry[0].changes[0].value.messages[0];
            const senderId = message.from; // Nomor telepon pengirim
            const messageText = message.text ? message.text.body : '';

            console.log(`Pesan masuk dari ${senderId}: ${messageText}`);

            // Kirim pesan ke Telegram
            await sendTelegramMessage(`*Pesan WhatsApp Baru*\nDari: ${senderId}\nPesan: ${messageText}`);

            // Inisialisasi atau ambil sesi pengguna
            if (!userSessions[senderId]) {
                userSessions[senderId] = { step: 0 }; // Step 0: Belum ada interaksi
            }

            const currentUserSession = userSessions[senderId];

            let replyMessage = '';

            switch (currentUserSession.step) {
                case 0:
                    // Balasan pertama: minta negara
                    let language = 'en';
                    if (messageText.toLowerCase().includes('halo')) {
                        language = 'id';
                    } else if (messageText.toLowerCase().includes('hello')) {
                        language = 'en';
                    }

                    if (language === 'id') {
                        replyMessage = 'Terima kasih telah menghubungi kami. Silakan ketik nama negara Anda.';
                    } else {
                        replyMessage = 'Thank you for contacting us. Please type your country name.';
                    }
                    currentUserSession.step = 1;
                    break;

                case 1:
                    // Pengguna membalas dengan negara
                    currentUserSession.country = messageText;
                    replyMessage = `Negara ${messageText} telah diterima. Kami akan menghubungi bagian negara tersebut. Mohon tunggu.\n\nApa tujuan Anda menghubungi kami?\n1. Membeli Cloud\n2. Membeli Data\n3. Lainnya`;
                    currentUserSession.step = 2;
                    break;

                case 2:
                    // Pengguna memilih tujuan
                    currentUserSession.purpose = messageText;
                    replyMessage = 'Terima kasih. Kami akan segera memproses permintaan Anda.';

                    // Kirim ringkasan ke Telegram
                    await sendTelegramMessage(
                        `*Ringkasan Interaksi WhatsApp:*\n` +
                        `Nomor: ${senderId}\n` +
                        `Negara: ${currentUserSession.country}\n` +
                        `Tujuan: ${currentUserSession.purpose}`
                    );

                    // Reset sesi setelah selesai
                    delete userSessions[senderId];
                    break;

                default:
                    replyMessage = 'Mohon maaf, saya tidak memahami pesan Anda. Silakan mulai kembali atau ketik "Halo" / "Hello".';
                    // Reset sesi jika ada yang tidak terduga
                    delete userSessions[senderId];
                    break;
            }

            if (replyMessage) {
                await sendWhatsAppMessage(senderId, replyMessage);
            }
        }
    }

    res.sendStatus(200); // Selalu kirim 200 OK ke WhatsApp Cloud API
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

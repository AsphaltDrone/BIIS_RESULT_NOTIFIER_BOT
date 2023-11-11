const axios = require('axios').default;
const { xml2json } = require('xml-js');
const { parse } = require('node-html-parser');
const TelegramBot = require('node-telegram-bot-api');
const { jsrsaenc } = require('./helper.js');
require('dotenv').config();
const myID = process.env.myID;
const myPass = process.env.myPass;
const token = process.env.TG_Token;

var tg_res_msg = 'empty';

async function loadKey(username, pass) {
    try {
        tg_res_msg = 'empty';
        const { data, headers } = await axios.get('https://biis.buet.ac.bd/BIIS_WEB/keyGeneration.do');
        const res = JSON.parse(xml2json(data, { compact: true, spaces: 2 }));
        const key = res['xml']['key']['_text'];
        const modulus = res['xml']['modulus']['_text'];
        const keylen = res['xml']['keylen']['_text'];
        const cookie = headers['set-cookie'][0].split(';')[0];
        pass = jsrsaenc(key, modulus, keylen, pass);

        await loginAction(username, pass, cookie);

    } catch (error) {
        console.error(error);
    }
}

async function loginAction(username, pass, cookie) {
    try {
        const { data } = await axios.post('https://biis.buet.ac.bd/BIIS_WEB/CheckValidity.do',
            {
                userName: username,
                passWord: pass
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'cookie': cookie
                }
            });

        let isGoodLogin = JSON.stringify(data).includes('Logout');

        if (isGoodLogin) {
            await getTaheraCGPA(cookie);
        }
        else {
            console.log("Bad Login")
        }

    } catch (error) {
        console.error(error);
    }
}

async function getTaheraCGPA(cookie) {
    try {
        const { data } = await axios.get('https://biis.buet.ac.bd/BIIS_WEB/scStep2.do?scid=69',
            {
                headers: {
                    'cookie': cookie
                }
            });

        const root = parse(data);
        const cgpa = root.querySelectorAll('th')[49].textContent;

        tg_res_msg = `Your Tahera CGPA is :${cgpa}`;

    } catch (error) {
        console.error(error);
    }
}

const bot = new TelegramBot(token, { polling: true });

// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const messageText = msg.text;

//     if (messageText === '/start') {
//         bot.sendMessage(chatId, 'Welcome to the bot!');
//     }
//     else if (messageText === '/result') {        
//         await loadKey(myID, myPass);        
//         bot.sendMessage(chatId, tg_res_msg);        
//     }
// });

setInterval(async () => {
    await loadKey(myID, myPass);
    bot.sendMessage(process.env.ChatID, tg_res_msg);
}, (1 * 60 * 1000));
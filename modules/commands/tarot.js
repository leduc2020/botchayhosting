const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const stream = require("stream");
const { Buffer } = require('buffer');

dotenv.config({ override: true });

const API_KEY = "AIzaSyDm2hVLDnqwOYuzDxiy4oXT_ZCmPbxJYH8";
const model = "gemini-2.0-flash";
const GENAI_DISCOVERY_URL = `https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta&key=${API_KEY}`;

const TAROT_MAJOR = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant",
    "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice", "The Hanged Man",
    "Death", "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

const TAROT_TOPICS = [
    "C�ng vi?c", "T�nh duy�n", "T�i ch�nh", "S?c kh?e", "Gia d�nh", "Ph�t tri?n b?n th�n", "H?c t?p", "M?i quan h? x� h?i"
];

const TAROT_COLORS = [
    { name: "�?", hex: "#e53935" },
    { name: "Xanh duong", hex: "#1e88e5" },
    { name: "V�ng", hex: "#fbc02d" },
    { name: "T�m", hex: "#8e24aa" },
    { name: "Xanh l�", hex: "#43a047" },
    { name: "Cam", hex: "#fb8c00" },
    { name: "H?ng", hex: "#ec407a" },
    { name: "Xanh ng?c", hex: "#00bcd4" },
    { name: "N�u", hex: "#8d6e63" },
    { name: "�en", hex: "#212121" },
    { name: "Tr?ng", hex: "#fafafa" },
    { name: "X�m", hex: "#757575" },
    { name: "Xanh bi?n", hex: "#1976d2" },
    { name: "V�ng chanh", hex: "#cddc39" },
    { name: "Xanh r�u", hex: "#558b2f" }
];

function drawTarotCard(cardName, colorHex, userInfo, topics) {
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 400, 600);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 380, 580);

    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(cardName, 200, 80);

    ctx.font = "18px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(`H? t�n: ${userInfo.name}`, 30, 140);
    ctx.fillText(`Ng�y sinh: ${userInfo.birth}`, 30, 170);
    ctx.fillText(`Ch? d?: ${topics.map(i => TAROT_TOPICS[i]).join(", ")}`, 30, 200);

    ctx.beginPath();
    ctx.arc(200, 350, 80, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff2";
    ctx.fill();

    ctx.font = "italic 20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Tarot Reading", 200, 570);

    const filePath = path.join(__dirname, "cache", `tarot_${Date.now()}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer());
    return filePath;
}

async function getGeminiTarot(uid, prompt, fileUrls) {
    const genaiService = await google.discoverAPI({ url: GENAI_DISCOVERY_URL });
    const auth = new google.auth.GoogleAuth().fromAPIKey(API_KEY);

    const fileDataParts = [];
    if (fileUrls && fileUrls.length > 0) {
        for (const fileUrl of fileUrls) {
            const imageBase64 = fs.readFileSync(fileUrl).toString("base64");
            const bufferStream = new stream.PassThrough();
            bufferStream.end(Buffer.from(imageBase64, "base64"));
            const media = {
                mimeType: "image/png",
                body: bufferStream,
            };
            const body = { file: { displayName: "Tarot Card" } };
            const createFileResponse = await genaiService.media.upload({
                media,
                auth,
                requestBody: body,
            });
            const file = createFileResponse.data.file;
            fileDataParts.push({ file_uri: file.uri, mime_type: file.mimeType });
        }
    }

    const contents = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }, ...fileDataParts.map(data => ({ file_data: data }))],
            },
        ],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generation_config: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            topP: 0.8,
        },
    };

    const generateContentResponse = await genaiService.models.generateContent({
        model: `models/${model}`,
        requestBody: contents,
        auth: auth,
    });

    return generateContentResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

module.exports = {
    config: {
        name: "tarot",
        version: "1.0.0",
        hasPermssion: 0,
        credits: "Dungkon",
        description: "Xem tarot b?ng AI (kh�ng d�ng, d�ng AI d? ch?n l� v� gi?i nghia l� b�i d�)",
        commandCategory: "box",
        usages: "tarot",
        cooldowns: 5,
    },

    run: async ({ api, event }) => {
        api.sendMessage(
            "?? Tarot AI(ch? c� m?c d�ch vui)\nVui l�ng reply tin nh?n n�y v?i:\n1. H? v� t�n c?a b?n",
            event.threadID,
            (err, info) => {
                global.client.handleReply.push({
                    name: "tarot",
                    step: 1,
                    messageID: info.messageID,
                    author: event.senderID,
                    userInfo: {}
                });
            },
            event.messageID
        );
    },

    handleReply: async ({ api, event, handleReply }) => {
        if (event.senderID !== handleReply.author) return;
        const { step, userInfo } = handleReply;

        if (step === 1) {
            userInfo.name = event.body.trim();
            return api.sendMessage(
                "2. Ng�y th�ng nam sinh c?a b?n (dd/mm/yyyy)",
                event.threadID,
                (err, info) => {
                    global.client.handleReply.push({
                        name: "tarot",
                        step: 2,
                        messageID: info.messageID,
                        author: event.senderID,
                        userInfo
                    });
                },
                event.messageID
            );
        }

        if (step === 2) {
            userInfo.birth = event.body.trim();
            let msg = "3. Ch?n m�u b?n th�ch (reply s?):\n";
            TAROT_COLORS.forEach((c, i) => {
                msg += `${i + 1}. ${c.name}\n`;
            });
            return api.sendMessage(
                msg,
                event.threadID,
                (err, info) => {
                    global.client.handleReply.push({
                        name: "tarot",
                        step: 3,
                        messageID: info.messageID,
                        author: event.senderID,
                        userInfo
                    });
                },
                event.messageID
            );
        }

        if (step === 3) {
            const colorIdx = parseInt(event.body.trim()) - 1;
            if (isNaN(colorIdx) || colorIdx < 0 || colorIdx >= TAROT_COLORS.length) {
                return api.sendMessage("Vui l�ng ch?n s? h?p l?!", event.threadID, event.messageID);
            }
            userInfo.color = TAROT_COLORS[colorIdx];
            let msg = "4. B?n mu?n xem v? linh v?c n�o? (reply s?, c� th? nhi?u s? c�ch nhau b?i d?u ph?y)\n";
            TAROT_TOPICS.forEach((t, i) => {
                msg += `${i + 1}. ${t}\n`;
            });
            msg += "\nV� d?: 1,2 d? xem C�ng vi?c v� T�nh duy�n";
            return api.sendMessage(
                msg,
                event.threadID,
                (err, info) => {
                    global.client.handleReply.push({
                        name: "tarot",
                        step: 4,
                        messageID: info.messageID,
                        author: event.senderID,
                        userInfo
                    });
                },
                event.messageID
            );
        }

        if (step === 4) {
            let topicIdxs = event.body.trim().split(",").map(s => parseInt(s) - 1).filter(i => i >= 0 && i < TAROT_TOPICS.length);
            if (!topicIdxs.length) {
                return api.sendMessage("Vui l�ng ch?n s? h?p l?!", event.threadID, event.messageID);
            }
            userInfo.topics = topicIdxs;

            const prompt =
                `B?n l� chuy�n gia Tarot. D?a tr�n th�ng tin sau, h�y ch?n 1 l� b�i Major Arcana ph� h?p nh?t v?i ngu?i d�ng, gi?i th�ch � nghia v� dua ra l?i khuy�n th?c t?:\n` +
                `- H? t�n: ${userInfo.name}\n- Ng�y sinh: ${userInfo.birth}\n- M�u s?c y�u th�ch: ${userInfo.color.name}\n- Ch? d?: ${topicIdxs.map(i => TAROT_TOPICS[i]).join(", ")}\n` +
                `Danh s�ch c�c l� b�i Major Arcana: ${TAROT_MAJOR.join(", ")}\n` +
                `Tr? v? d�ng t�n l� b�i b?n ch?n ? d?u c�u tr? l?i, sau d� l� � nghia v� l?i khuy�n.`;

            api.sendMessage("?? �ang d? AI ch?n l� b�i ph� h?p nh?t cho b?n...", event.threadID, async (err, info) => {
                try {
                    const aiText = await getGeminiTarot(event.senderID, prompt, []);
                    let cardName = TAROT_MAJOR.find(card => aiText.toLowerCase().includes(card.toLowerCase()));
                    if (!cardName) cardName = TAROT_MAJOR[Math.floor(Math.random() * TAROT_MAJOR.length)]; 
                    const imgPath = drawTarotCard(cardName, userInfo.color.hex, userInfo, topicIdxs);

                    api.sendMessage({
                        body: `?? L� b�i AI ch?n cho b?n l�: ${cardName}\nGi?i nghia:\n${aiText}`,
                        attachment: fs.createReadStream(imgPath)
                    }, event.threadID, () => {
                        fs.unlink(imgPath, () => {});
                    });
                } catch (e) {
                    api.sendMessage("? L?i AI: " + e.message, event.threadID);
                }
            }, event.messageID);
        }
    }
};
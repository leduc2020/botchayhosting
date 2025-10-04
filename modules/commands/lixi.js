<<<<<<< HEAD
﻿const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "lixi",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "YourName",
    description: "Nhận lì xì mỗi ngày!",
    commandCategory: "Tài Chính",
    cooldowns: 5,
    images: []
};

module.exports.languages = {
    "vi": {
        "cooldown": "🧧 Bạn đã nhận lì xì rồi, vui lòng quay lại vào ngày mai 🎋.",
        "notAuthor": "❌ Chỉ người gửi lệnh mới được chọn phong bao lì xì!",
        "invalidChoice": "Vui lòng nhập một số từ 1 đến 14!",
        "success": "🌸🧧 Chúc mừng năm mới 2026 🧧🌸\n🧧 Bạn nhận được %1 VNĐ\n\n%2\n\n» Chúc bạn năm mới an khang!"
    },
    "en": {
        "cooldown": "🧧 You've already received lucky money, please come back tomorrow 🎋.",
        "notAuthor": "❌ Only command sender can choose lucky envelope!",
        "invalidChoice": "Please enter a number from 1 to 14!",
        "success": "🌸🧧 Happy New Year 2026 🧧🌸\n🧧 You received %1 VNĐ\n\n%2\n\n» Wishing you a prosperous new year!"
    }
};

module.exports.handleReply = async ({ event, api, handleReply, Currencies, getText }) => {
    const { threadID, messageID, senderID } = event;

    // Kiểm tra người reply có phải là người gửi lệnh ban đầu không
    if (senderID !== handleReply.author) {
        return api.sendMessage(getText("notAuthor"), threadID, messageID);
    }

    const lixiAmount = Math.floor(Math.random() * 300001) + 200000; // Số tiền ngẫu nhiên từ 200,000 đến 500,000
    const wishes = [
        "Mùng 3 Tết bạn sẽ gặp được một đại gia giàu có đã phá sản 🎐",
        "Chúc bạn một năm mới an khang thịnh vượng!",
        "Năm 2026: Đánh đâu thắng đó, làm gì cũng thành công! 🌟"
    ];
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];

    if (handleReply.type === "chooseLixi") {
        const choose = parseInt(event.body);

        if (isNaN(choose) || choose < 1 || choose > 14) {
            return api.sendMessage(getText("invalidChoice"), threadID, messageID);
        }

        // Cộng tiền vào tài khoản
        await Currencies.increaseMoney(senderID, lixiAmount);

        // Lưu dữ liệu người dùng
        let data = (await Currencies.getData(senderID)).data || {};
        data.totalLixiReceived = (data.totalLixiReceived || 0) + lixiAmount;
        data.lixiTime = Date.now();
        await Currencies.setData(senderID, { data });

        const formattedLixiAmount = lixiAmount.toLocaleString('vi-VN') + ' VNĐ';
        const msg = getText("success", formattedLixiAmount, randomWish);

        api.unsendMessage(handleReply.messageID);
        return api.sendMessage(msg, threadID, messageID);
    }
};

module.exports.run = async ({ event, api, Currencies, getText }) => {
    const { threadID, messageID, senderID } = event;

    // Lấy dữ liệu người dùng
    let data = (await Currencies.getData(senderID)).data || {};

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh ngày

    const lastLixiTime = data.lixiTime ? new Date(data.lixiTime) : null;
    let canReceive = true;

    if (lastLixiTime) {
        lastLixiTime.setHours(0, 0, 0, 0); // Đặt giờ của lần nhận trước về 00:00:00
        if (lastLixiTime.getTime() === today.getTime()) {
            canReceive = false;
        }
    }

    if (!canReceive) {
        return api.sendMessage(getText("cooldown"), threadID, messageID);
    } else {
        const lixiOptions = Array.from({ length: 14 }, (_, i) => `${i + 1}. Bao lì xì ${i + 1} 🧧`).join('\n');
        return api.sendMessage(
            `🎋 Phong bao lì xì 🎋\n🌸🧧 Chúc mừng năm mới 2026 🧧🌸\n\n${lixiOptions}\n\nReply số tương ứng để nhận lì xì`,
            threadID,
            (error, info) => {
                global.client.handleReply.push({
                    type: "chooseLixi",
                    name: this.config.name,
                    author: senderID,
                    messageID: info.messageID
                });
            },
            messageID
        );
    }
};
=======
module.exports.config = {
    name: "lixi",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Dũngkon",
    description: "Tạo ảnh lì xì",
    commandCategory: "Box chat",
    usages: "lixi",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "path": "",
        "jimp": ""
    }
};

module.exports.onLoad = () => {
    const fs = require("fs-extra");
    const request = require("request");

    const dirMaterial = __dirname + `/cache/canvas/`;
    if (!fs.existsSync(dirMaterial + "canvas")) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(dirMaterial + "lixi.png")) request("https://i.imgur.com/VUWRn9N.jpg").pipe(fs.createWriteStream(dirMaterial + "lixi.png"));
}

async function makeImage({ one, two, args, api, event }) { 
    //const stk = args.join(""); 
    
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");
    const jimp = require("jimp");
    const __root = path.resolve(__dirname, "cache", "canvas");

    let lixi_image = await jimp.read(__root + "/lixi.png");
    let pathImg = __root + `/lixi${one}.png`;
    let avatar = __root + `/avt_${one}.png`;
    let qrbank = __root + `/avt_qrcode.png`;

    
    
    let avt = (await axios.get(`https://graph.facebook.com/${one}/picture?width=1500&height=1500&access_token=2712477385668128%7Cb429aeb53369951d411e1cae8e810640`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatar, Buffer.from(avt, 'utf-8'));
    
    let qrcode = (await axios.get(`https://sumiproject.io.vn/qrcodembbank?stk=${stk}&apikey=SHARE`, { responseType: 'arraybuffer' })).data;
    console.log(stk)
    fs.writeFileSync(qrbank, Buffer.from(qrcode, 'utf-8'));
    
     let circleOne = await jimp.read(await circle(avatar));
    // let circleTwo = await jimp.read(await circle(qrbank));
    // let circleOne = await jimp.read(avatarOne);
    let circleTwo = await jimp.read(qrbank);
    circleTwo.rotate(-10)
    lixi_image.composite(circleOne.resize(150, 150), 226, 79).composite(circleTwo.resize(75, 75), 218, 260);

    let raw = await lixi_image.getBufferAsync("image/png");
    
    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatar);
    fs.unlinkSync(qrbank);
    
    return pathImg;
}
async function circle(image) {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID, senderID } = event;
    var out = (msg) => api.sendMessage(msg, threadID, messageID);
  if (!args.join(" ")) return out("Thiếu Stk");
  if (event.type == "message_reply") stk  = event.messageReply.senderID
else stk = args.join(" ");  
    const mention = Object.keys(event.mentions);
    if (!mention) return api.sendMessage("", threadID, messageID);
    else {
        var one = senderID;
        return makeImage({ one }).then(path => api.sendMessage({ body: "Cháu lớn rồi!", attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID));
    }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

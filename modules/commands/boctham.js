<<<<<<< HEAD
﻿const activeGiveaways = new Map();

// Lệnh tạo bốc thăm
module.exports.config = {
    name: "boctham",
    version: "1.0.0", 
    hasPermssion: 0,
    credits: "Developer",
    description: "Tạo bốc thăm với từ 'nhận' để tham gia",
    commandCategory: "Game",
    usages: "[số tiền] [số người]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
    const { threadID, messageID, senderID } = event;
    
    try {
        // Kiểm tra nếu đã có bốc thăm đang chạy
        if (activeGiveaways.has(threadID)) {
            const existing = activeGiveaways.get(threadID);
            const remaining = existing.maxParticipants - existing.participants.length;
            return api.sendMessage(
                `❌ Đang có bốc thăm ${existing.totalAmount.toLocaleString('vi-VN')}đ!\n` +
                `📊 Còn ${remaining} người có thể nhận!\n` +
                `👉 Gõ "nhận" để nhận ngay!`,
                threadID,
                messageID
            );
        }
        
        if (args.length < 2) {
            return api.sendMessage(
                "🎲 Cú pháp tạo bốc thăm:\n\n" +
                "Dùng: boctham [số tiền] [số người]\n" +
                "Ví dụ:\n" +
                "• boctham 100000 5\n" +
                "• boctham 50000 3\n\n" +
                "Để nhận thưởng: nhận\n\n" +
                "💡 Mỗi người nhận được số tiền NGẪU NHIÊN!",
                threadID,
                messageID
            );
        }
        
        const amountInput = args[0].toLowerCase();
        const maxParticipants = parseInt(args[1]);
        
        if (isNaN(maxParticipants) || maxParticipants < 2 || maxParticipants > 20) {
            return api.sendMessage("❌ Số người phải từ 2 đến 20!", threadID, messageID);
        }
        
        // Xử lý số tiền
        let amount;
        if (amountInput.includes('k')) {
            amount = parseFloat(amountInput.replace('k', '')) * 1000;
        } else if (amountInput.includes('m')) {
            amount = parseFloat(amountInput.replace('m', '')) * 1000000;
        } else if (amountInput.includes('b')) {
            amount = parseFloat(amountInput.replace('b', '')) * 1000000000;
        } else {
            amount = parseInt(amountInput.replace(/[.,]/g, ''));
        }
        
        if (isNaN(amount) || amount < 10000) {
            return api.sendMessage("❌ Số tiền không hợp lệ (tối thiểu 10,000đ)!", threadID, messageID);
        }
        
        // Kiểm tra số dư
        const userMoney = (await Currencies.getData(senderID))?.money || 0;
        if (userMoney < amount) {
            return api.sendMessage(`❌ Bạn không đủ tiền! Hiện có: ${userMoney.toLocaleString('vi-VN')}đ`, threadID, messageID);
        }
        
        // Trừ tiền người tạo
        await Currencies.decreaseMoney(senderID, amount);
        
        // Tạo bốc thăm mới
        activeGiveaways.set(threadID, {
            creator: senderID,
            totalAmount: amount,
            remainingAmount: amount,
            maxParticipants: maxParticipants,
            participants: []
        });
        
        // Thông báo
        const creatorName = await Users.getNameUser(senderID);
        const message = `🎊 ${creatorName} đã tạo bốc thăm ${amount.toLocaleString('vi-VN')}đ cho ${maxParticipants} người!\n\n` +
                       `🎯 Mỗi người nhận được số tiền NGẪU NHIÊN\n` +
                       `👉 Để nhận thưởng, gõ: nhận\n` +
                       `⏰ Ưu tiên ${maxParticipants} người đầu tiên!\n\n` +
                       `💡 Ai nhanh tay thì được!`;
        
        api.sendMessage(message, threadID, messageID);
        
    } catch (error) {
        console.error("Lỗi trong lệnh boctham:", error);
        return api.sendMessage("❌ Đã có lỗi xảy ra. Vui lòng thử lại sau.", threadID, messageID);
    }
};

// Lệnh nhận thưởng với từ "nhận"
module.exports.handleEvent = async function ({ api, event, Currencies, Users }) {
    const { threadID, messageID, senderID, body } = event;
    
    if (body.toLowerCase() !== "nhận") return;
    
    try {
        const giveaway = activeGiveaways.get(threadID);
        if (!giveaway) return;

        if (giveaway.participants.find(p => p.userID === senderID)) {
            return api.sendMessage("⚠️ Bạn đã nhận thưởng rồi!", threadID, messageID);
        }

        if (senderID === giveaway.creator) {
            return api.sendMessage("⚠️ Bạn là người tạo, không thể nhận thưởng!", threadID, messageID);
        }

        if (giveaway.participants.length >= giveaway.maxParticipants) {
            return api.sendMessage("❌ Đã đủ số người nhận thưởng!", threadID, messageID);
        }

        // Random số tiền từ 0 đến số tiền còn lại
        const maxPossible = giveaway.remainingAmount;
        const randomReward = Math.floor(Math.random() * (maxPossible + 1));
        
        // Thêm người nhận
        giveaway.participants.push({
            userID: senderID,
            reward: randomReward
        });
        giveaway.remainingAmount -= randomReward;

        // Thông báo
        const userName = await Users.getNameUser(senderID);
        const participantsCount = giveaway.participants.length;
        const remainingSlots = giveaway.maxParticipants - participantsCount;

        let replyMessage = ``;
        replyMessage += `📊 Đã có ${participantsCount}/${giveaway.maxParticipants} người nhận\n`;

        if (remainingSlots > 0) {
            replyMessage += `⏰ 🎁 ${userName} Còn ${remainingSlots} suất nữa!`;
        } else {
            replyMessage += `✅ Đã đủ người!`;
        }

        api.sendMessage(replyMessage, threadID, messageID);

        // Nếu đủ người, kết thúc
        if (participantsCount === giveaway.maxParticipants) {
            setTimeout(async () => {
                let resultMessage = `🎊 KẾT QUẢ BỐC THĂM\n`;
                resultMessage += `💰 Tổng tiền: ${giveaway.totalAmount.toLocaleString('vi-VN')}đ\n`;
                resultMessage += `👥 Số người: ${giveaway.maxParticipants} người\n\n`;
                
                let totalDistributed = 0;
                let rank = 1;
                
                for (const participant of giveaway.participants) {
                    await Currencies.increaseMoney(participant.userID, participant.reward);
                    const name = await Users.getNameUser(participant.userID);
                    resultMessage += `🏆 ${rank}. ${name}: ${participant.reward.toLocaleString('vi-VN')}đ\n`;
                    totalDistributed += participant.reward;
                    rank++;
                }
                
                resultMessage += `\n✅ Tổng đã phân phối: ${totalDistributed.toLocaleString('vi-VN')}đ`;
                api.sendMessage(resultMessage, threadID);
                activeGiveaways.delete(threadID);
            }, 2000);
        }
    } catch (error) {
        console.error("Lỗi khi nhận thưởng:", error);
    }
};
=======
/*
@credit ⚡️D-Jukie
@vui lòng không chỉnh sửa credit
*/
const fs = require("fs");
module.exports.config = {
    name: "boctham",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "⚡D-Jukie", //Sang Nguyễn edit mod, Code working của diện,suhao chỉnh chữ thoai ko có rì đâu
    description: "💴𝐁𝐨̂́𝐜 𝐓𝐡𝐚̆𝐦 𝐯𝐨̛́𝐢 𝐜����́c 𝐠𝐨́𝐢 𝟏𝟎𝐤 𝟐𝟎𝐤 𝟓𝟎𝐤 𝟏𝟎𝟎𝐤 𝟐𝟎𝟎𝐤 𝟓𝟎𝟎𝐤💎",
    commandCategory: "game",
    cooldowns: 5,
    envConfig: {
        cooldownTime: 0 
    },
    denpendencies: {
        "fs": "",
        "request": ""
}
};
module.exports.onLoad = () => {
    const fs = require("fs-extra");
    const request = require("request");
    const dirMaterial = __dirname + `/cache/`;
    if (!fs.existsSync(dirMaterial + "cache")) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(dirMaterial + "baolixi1.png")) request("https://i.imgur.com/luFyD1C.jpg").pipe(fs.createWriteStream(dirMaterial + "baolixi1.png"));
}
module.exports.handleReply = async ({ 
    event:e, 
    api, 
    handleReply, 
    Currencies }) => {
    const { threadID, messageID, senderID } = e;
    let data = (await Currencies.getData(senderID)).data || {};
if (handleReply.author != e.senderID) 
return api.sendMessage("🎋𝐋𝐮̛𝐨̛̣𝐭 𝐛𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦 𝐜𝐮̉𝐚 𝐚𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 đ𝐨́ 𝐛𝐨̂́𝐜 𝐧𝐡𝐚́, 𝐛𝐚̣𝐧 𝐤𝐨 𝐧𝐞̂𝐧 𝐭𝐫��𝐧𝐡 𝐥𝐮̛𝐨̛̣𝐭 𝐜𝐮̉𝐚 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐚́𝐜", e.threadID, e.messageID)

var a = Math.floor(Math.random() * 1000) + 80; 
var b = Math.floor(Math.random() * 100) + 80; 
var c = Math.floor(Math.random() * 100) + 80; 
var x = Math.floor(Math.random() * 100) + 80; 
var y = Math.floor(Math.random() * 100) + 80; 
var f = Math.floor(Math.random() * 100) + 50;
  var msg = "";
    switch(handleReply.type) {
        case "choosee": {
            var t = Date.parse("February 1, 2022 00:00:00") - Date.parse(new Date()),
            m = Math.floor( (t/1000/60) % 60 ),
            h = Math.floor( (t/(1000*60*60)) % 24 ),
            d = Math.floor( t/(1000*60*60*24) ); 
           
            switch(e.body) {
                case "1": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟏𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${a}𝐊 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧��𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋` ;
                await Currencies.increaseMoney(e.senderID, parseInt(a)); 
                break; 
                case "2": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟐𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${a}𝐊 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(x));  
                await Currencies.increaseMoney(e.senderID, parseInt(b)); 
                break;
                case "3": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟓𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${a}𝐊 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(c)); 
                break;
                case "4": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟏𝟎𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${a}𝐊 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(x)); 
                break;
                case "5": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟐𝟎𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${a}𝐊 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(y)); 
                break;
                case "6": msg = `💷𝐂𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐠𝐨́𝐢 𝟓𝟎𝟎𝐤 𝐛𝐚̣𝐧 𝐦𝐮𝐚 đ𝐚̃ 𝐦𝐨̛̉ 𝐫𝐚 𝐝𝐜  ${a}𝐊 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 𝐧𝐚̆𝐦 𝐦𝐨̛́𝐢 𝐚𝐧 𝐤𝐡𝐚𝐧𝐠 , 𝐯𝐚̣𝐧 𝐬𝐮̛̣ 𝐧𝐡𝐮̛ 𝐲́ 𝐧𝐞̀ <𝟑🎐\n🎀𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭🎋`; 
                await Currencies.increaseMoney(e.senderID, parseInt(f)); 
                break;
                default: break;
            };
            const choose = parseInt(e.body);
            if (isNaN(e.body)) 
            return api.sendMessage("💶𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐜𝐡𝐨̣𝐧 𝟏 𝐠𝐨́𝐢 𝐭𝐢𝐞̂̀𝐧 𝐜𝐨́ 𝐭𝐫𝐨𝐧𝐠 𝐛𝐚̉𝐧𝐠 🎀", e.threadID, e.messageID);
            if (choose > 6 || choose < 1) 
            return api.sendMessage("💶𝐋𝐮̛̣𝐚 𝐜𝐡𝐨̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐧𝐚̆̀𝐦 𝐭𝐫𝐨𝐧𝐠 𝐝𝐚𝐧𝐡 𝐬𝐚́𝐜𝐡🎀.", e.threadID, e.messageID); 
            api.unsendMessage(handleReply.messageID);
            if (msg == "🎋Chưa update...") {
                msg = "🎋Update soon...";
            };
            return api.sendMessage(`${msg}`, threadID, async () => {
            data.work2Time = Date.now();
            await Currencies.setData(senderID, { data });
            
        });

    };
}
}


module.exports.run = async ({  
    event:e, 
    api, 
    handleReply, 
    Currencies }) => {
    const { threadID, messageID, senderID } = e;
    const cooldown = global.configModule[this.config.name].cooldownTime;
    let data = (await Currencies.getData(senderID)).data || {};
    var   t = Date.parse("February 1, 2022") - Date.parse(new Date()),
    d = Math.floor( t/(1000*60*60*24) ),
    h = Math.floor( (t/(1000*60*60)) % 24 ),
    m = Math.floor( (t/1000/60) % 60 );

    if (typeof data !== "undefined" && cooldown - (Date.now() - data.work2Time) > 0) {

        var time = cooldown - (Date.now() - data.work2Time),
            hours = Math.floor((time / (60000 * 60000 ))/24),
            minutes = Math.floor(time / 60000),
            seconds = ((time % 60000) / 1000).toFixed(0); 
        return api.sendMessage(`💎𝐁𝐚̣𝐧 đ𝐚̃ 𝐧𝐡𝐚̣̂𝐧 𝐛𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦 𝐫𝐨̂̀𝐢, 𝐯𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐪𝐮𝐚𝐲 𝐥𝐚̣𝐢 𝐯𝐚̀𝐨 𝐧𝐠𝐚̀𝐲 𝐦𝐚𝐢💴.\n🌸 𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭`, e.threadID, e.messageID); // Đoạn này ae có thể để quay lại sau ${housr}giờ ${minutes}phút ${seconds}giây
    }
    else {    
        var msg = {
            body: "🎋𝐁𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦 𝐜𝐡𝐮́𝐧𝐠 𝐭𝐡𝐮̛𝐨̛̉𝐧𝐠🎋" +
                `\n🌸𝐓𝐞̂́𝐭 𝐚̂𝐦 𝐥𝐢̣𝐜𝐡 𝐜𝐨̀𝐧 » ${d} 𝐧𝐠𝐚̀𝐲 ${h} 𝐠𝐢𝐨̛̀ ${m} 𝐩𝐡𝐮́𝐭` +
                "\n𝟏.   𝐆𝐨́𝐢 𝟏𝟎𝐤 💴 " +
                "\n𝟐.   𝐆𝐨́𝐢 𝟐𝟎𝐤 💶 " +
                "\n𝟑.   𝐆𝐨́𝐢 𝟓𝟎𝐤 💷 " +
                "\n𝟒.   𝐆𝐨́𝐢 𝟏𝟎𝟎𝐤💸 " +
                "\n𝟓.   𝐆𝐨́𝐢 𝟐𝟎𝟎𝐤💎 " +
                "\n𝟔.   𝐆𝐨́𝐢 𝟓𝟎𝟎𝐤💵 " +
                `\n\n🧨𝐇𝐚̃𝐲 𝐫𝐞𝐩𝐥𝐲 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐜𝐡𝐨̣𝐧 𝐠𝐨́𝐢 𝐭𝐢𝐞̂̀𝐧 𝐛𝐚̣𝐧 𝐦𝐮𝐨̂́𝐧 𝐛𝐨̂́𝐜 𝐭𝐡𝐚̆𝐦.`,
                attachment: fs.createReadStream(__dirname + `/cache/baolixi1.png`)}
                return api.sendMessage(msg,e.threadID,  (error, info) => {
                data.work2Time = Date.now();
        global.client.handleReply.push({
            type: "choosee",
            name: this.config.name,
            author: e.senderID,
            messageID: info.messageID
          })  
        })
    }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

const activeGiveaways = new Map();

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
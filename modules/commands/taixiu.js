<<<<<<< HEAD
const cooldownTime = 30000; // 1 phút = 60 * 1000 ms.
const minBet = 50000; // 50.000 VNĐ
const cooldowns = new Map();

module.exports.config = {
    name: "taixiu",
    version: "1.1.5", 
    hasPermssion: 0,
    credits: "Developer",
    description: "Chơi game tài xỉu có cược xu",
    commandCategory: "Game",
    usages: "[tài/xỉu] [số tiền/all]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
    const { threadID, messageID, senderID } = event;
    
    try {
        console.log("Bắt đầu game tài xỉu với args:", args);
        
        // Kiểm tra nếu không có đối số
        if (args.length === 0) {
            return api.sendMessage(
                "🎲 Cú pháp chơi Tài Xỉu:\n\n" +
                "Dùng: taixiu [tài/xỉu] [số tiền cược]\n" +
                "Ví dụ:\n" +
                "• taixiu tài 100000\n" +
                "• taixiu tài 100k\n" +
                "• taixiu xỉu 1m\n" +
                "• taixiu tài 1b\n" +
                "• taixiu xỉu all\n\n" +
                "💰 Mức cược tối thiểu: 50,000 xu",
                threadID,
                messageID
            );
        }

        const choice = args[0]?.toLowerCase();
        console.log("Lựa chọn:", choice);

        // --- Bắt đầu logic chơi game ---
        if (!["tài", "xỉu"].includes(choice)) {
            return api.sendMessage(
                "⚠️ Lựa chọn không hợp lệ!\nVui lòng chọn 'tài' hoặc 'xỉu'\nVí dụ: taixiu tài 100000",
                threadID,
                messageID
            );
        }

        // Kiểm tra nếu có đủ tham số
        if (args.length < 2) {
            return api.sendMessage(
                "⚠️ Thiếu số tiền cược!\nVui lòng nhập số tiền bạn muốn cược\nVí dụ: taixiu tài 100000",
                threadID,
                messageID
            );
        }

        // Lấy thông tin tiền
        let moneyData;
        try {
            moneyData = await Currencies.getData(senderID);
            console.log("Money data:", moneyData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu tiền:", error);
            return api.sendMessage("❌ Lỗi hệ thống tiền tệ. Vui lòng thử lại sau.", threadID, messageID);
        }

        if (!moneyData) {
            return api.sendMessage("❌ Không thể lấy thông tin số dư của bạn.", threadID, messageID);
        }
        
        // Chuyển đổi BigInt sang Number nếu cần
        const money = Number(moneyData.money) || 0;
        console.log("Số dư hiện tại:", money);

        // Lấy thông tin người dùng
        let userName = "Người chơi";
        try {
            const userInfo = await api.getUserInfo(senderID);
            userName = userInfo[senderID]?.name || "Người chơi";
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
        }

        let bet;
        const betInput = args[1]?.toLowerCase();

        if (betInput === "all") {
            if (money < minBet) {
                return api.sendMessage(`⚠️ Bạn cần ít nhất ${minBet.toLocaleString('vi-VN')} xu để cược all`, threadID, messageID);
            }
            bet = money;
        } else {
            // Xử lý các định dạng tiền
            let numericValue;
            
            if (betInput.includes('k') || betInput.includes('K')) {
                numericValue = parseFloat(betInput.replace(/[kK]/, '')) * 1000;
            } else if (betInput.includes('m') || betInput.includes('M')) {
                numericValue = parseFloat(betInput.replace(/[mM]/, '')) * 1000000;
            } else if (betInput.includes('b') || betInput.includes('B')) {
                numericValue = parseFloat(betInput.replace(/[bB]/, '')) * 1000000000;
            } else {
                numericValue = parseInt(betInput.replace(/[.,]/g, ''));
            }

            if (isNaN(numericValue) || numericValue <= 0) {
                return api.sendMessage(
                    "⚠️ Số tiền cược không hợp lệ!\nVui lòng nhập số tiền hợp lệ\nVí dụ: 100000, 100k, 1m, 1b",
                    threadID,
                    messageID
                );
            }
            
            bet = numericValue;
            
            if (bet < minBet) {
                return api.sendMessage(`⚠️ Mức cược tối thiểu là ${minBet.toLocaleString('vi-VN')} xu`, threadID, messageID);
            }
            if (money < bet) {
                return api.sendMessage(`💸 Bạn không đủ tiền. Hiện có: ${money.toLocaleString('vi-VN')} xu`, threadID, messageID);
            }
        }

        console.log("Tiền cược:", bet);

        // Kiểm tra cooldown
        const now = Date.now();
        const lastPlayed = cooldowns.get(senderID) || 0;
        if (now - lastPlayed < cooldownTime) {
            const timeLeft = cooldownTime - (now - lastPlayed);
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);

            let timeString = "";
            if (minutes > 0) {
                timeString += `${minutes} phút `;
            }
            timeString += `${seconds} giây`;

            return api.sendMessage(`🕒 Bạn cần đợi ${timeString} nữa mới được chơi tiếp.`, threadID, messageID);
        }

        // Tung xúc xắc
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const dice3 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2 + dice3;

        let actualResult;
        if (dice1 === dice2 && dice2 === dice3) {
            actualResult = "bão";
        } else {
            actualResult = total >= 11 ? "tài" : "xỉu";
        }

        console.log("Kết quả xúc xắc:", dice1, dice2, dice3, "Tổng:", total, "Kết quả:", actualResult);

        // Xử lý kết quả
        let finalMessage = `👤 Người chơi: ${userName}\n`;
        finalMessage += `🎲 Kết quả: ${dice1} + ${dice2} + ${dice3} = ${total}\n`;
        finalMessage += `🎉 Bạn đã chọn: ${choice.toUpperCase()}\n`;

        let newBalance = money;
        let statusMessage = "";

        if (actualResult === "bão") {
            finalMessage += `🚨 Kết quả: BÃO ${dice1} NÚT!\n`;
            // Chuyển đổi bet thành number trước khi trừ
            await Currencies.decreaseMoney(senderID, Number(bet));
            newBalance -= Number(bet);
            statusMessage = "❌ Bạn đoán sai!";
            finalMessage += `💔 Mất: ${Number(bet).toLocaleString('vi-VN')}đ\n`;
        } else {
            finalMessage += `📢 Kết quả: ${actualResult.toUpperCase()}\n`;
            if (choice === actualResult) {
                // Chuyển đổi bet thành number trước khi cộng
                await Currencies.increaseMoney(senderID, Number(bet));
                newBalance += Number(bet);
                statusMessage = "✅ Bạn đoán đúng!";
                finalMessage += `💰 Nhận: +${Number(bet).toLocaleString('vi-VN')}đ\n`;
            } else {
                // Chuyển đổi bet thành number trước khi trừ
                await Currencies.decreaseMoney(senderID, Number(bet));
                newBalance -= Number(bet);
                statusMessage = "❌ Bạn đoán sai!";
                finalMessage += `💔 Mất: ${Number(bet).toLocaleString('vi-VN')}đ\n`;
            }
        }

        finalMessage += `${statusMessage}\n`;
        finalMessage += `💵 Số dư còn lại: ${Number(newBalance).toLocaleString('vi-VN')}đ`;

        cooldowns.set(senderID, now);
        return api.sendMessage(finalMessage, threadID, messageID);

    } catch (error) {
        console.error("Lỗi trong game tài xỉu:", error);
        return api.sendMessage("❌ Đã có lỗi xảy ra khi chơi game. Vui lòng thử lại sau.", threadID, messageID);
    }
};
=======
module.exports.config = {
  name: "taixiu",
  version: "6.9.3",
  hasPermssion: 0,
  credits: "Yae Miko & Mod by DongDev",
  description: "Tài xỉu trên hệ thống Bot Zuri đa dạng nhiều kiểu",
  commandCategory: "Game",
    usages: "[tài/xỉu/b3gn/b2gn/cs/ct] [số tiền]",
    cooldowns: 5
};
const axios = require('axios');
var bdsd = true;
var tilethang = 2;
var tilethangb3dn = 10;
var tilethangb2dn = 5;
var timedelay = 2;
var haisogiong = 2;
var basogiong = 3;
var motsogiong = 1;
function replace(int){
    var str = int.toString();
    var newstr = str.replace(/(.)(?=(\d{3})+$)/g,'$1,');
    return newstr;
}
function getImage(number){
    switch (number){
      case 1: return "https://i.imgur.com/cmdORaJ.jpg";
      case 2: return "https://i.imgur.com/WNFbw4O.jpg";
      case 3: return "https://i.imgur.com/Xo6xIX2.jpg";
      case 4: return "https://i.imgur.com/NJJjlRK.jpg";
      case 5: return "https://i.imgur.com/QLixtBe.jpg";
      case 6: return "https://i.imgur.com/y8gyJYG.jpg";
    }
}
function getRATE(tong){
    if(tong == 4) var rate = 40;
    if(tong == 5) var rate = 35;
    if(tong == 6) var rate = 33.33;
    if(tong == 7) var rate = 25;
    if(tong == 8) var rate = 20;
    if(tong == 9) var rate = 16.66;
    if(tong == 10) var rate = 14.28;
    if(tong == 11) var rate = 12.5;
    if(tong == 12) var rate = 11.11;
    if(tong == 13) var rate = 10;
    if(tong == 14) var rate = 9.09;
    if(tong == 15) var rate = 8.33;
    if(tong == 16) var rate = 7.69;
    if(tong == 17) var rate = 7.14;
    return rate
}
module.exports.run = async function ({ event, api, Currencies, Users, args }) {
 try{
    const moment = require("moment-timezone");
    const format_day = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:ss");
    const { increaseMoney , decreaseMoney } = Currencies;
    const { threadID, messageID, senderID } = event;
    var name = await Users.getNameUser(senderID);
    var money = (await Currencies.getData(event.senderID)).money;
    var bet = parseInt((args[1] == "allin" ? money : args[1]));
    var input = args[0];
    var tong = parseInt(args[2])
    if(!input) return api.sendMessage("[ ❗ ] 𝗕𝗮̣𝗻 𝗰𝗵𝘂̛𝗮 𝗻𝗵𝗮̣̂𝗽 𝘁𝗮̀𝗶/𝘅𝗶̉𝘂/𝗯𝗼̣̂ 𝟯 𝗴𝗶𝗼̂́𝗻𝗴 𝗻𝗵𝗮𝘂/𝗯𝗼̣̂ 𝟮 𝗴𝗶𝗼̂́𝗻𝗴 𝗻𝗵𝗮𝘂/𝗰𝘂̛𝗼̛̣𝗰 𝘁𝗼̂̉𝗻𝗴/𝗰𝘂̛𝗼̛̣𝗰 𝘀𝗼̂́", threadID, messageID);
    if(!bet) return api.sendMessage("Bạn Không Đủ Tiền", threadID, messageID);
    if(bet < 1000) return api.sendMessage("[ 💸 ] 𝗕𝗮̣𝗻 𝗰𝗮̂̀𝗻 𝗰𝘂̛𝗼̛̣𝗰 𝘁𝗼̂́𝗶 𝘁𝗵𝗶𝗲̂̉𝘂 𝗹𝗮̀ 𝟭𝟬𝟬𝟬$", threadID, messageID);
    if(bet > money) return api.sendMessage("[ 💸 ] 𝗕𝗮̣𝗻 𝘁𝗵𝗶𝗲̂́𝘂 𝘁𝗶𝗲̂̀𝗻 𝗸𝗵𝗼̂𝗻𝗴 𝘁𝗵𝗲̂̉ 𝗰𝘂̛𝗼̛̣𝗰", threadID, messageID);
    if(input == "tài" || input == "Tài" || input == '-t') var choose = 'tài'
    if(input == "xỉu" || input == "Xỉu" || input == '-x') var choose = 'xỉu'
    if(input == 'b3gn' || input == 'bbgn' || input == 'btgn') var choose = 'b3gn'
    if(input == 'b2gn' || input == 'bdgn' || input == 'bhgn') var choose = 'b2gn'
    if(input == 'cuoctong' || input == 'ct') var choose = 'cuoctong'
    if(input == 'cuocso' || input == 'cs') var choose = 'cuocso'
    var tag = ['tài','xỉu','b3gn','b2gn','cuoctong','cuocso']
    if(!tag.includes(choose)) return api.sendMessage('[ ❗ ] 𝗕𝗮̣𝗻 𝗻𝗵𝗮̣̂𝗽 𝘀𝗮𝗶 𝗹𝘂̛̣𝗮 𝗰𝗵𝗼̣𝗻, 𝗵𝗮̃𝘆 𝗰𝗵𝗼̣𝗻 𝘁𝗮̀𝗶/𝘅𝗶̉𝘂/𝗯𝟯𝗴𝗻/𝗯𝟮𝗴𝗻/𝗰𝘁/𝗰𝘀', threadID, messageID)
    if(choose == 'cuoctong' && (tong < 4 || tong > 17)) return api.sendMessage("[ 💸 ] 𝗧𝗼̂̉𝗻𝗴 𝗰𝘂̛𝗼̛̣𝗰 𝗸𝗵𝗼̂𝗻𝗴 𝗵𝗼̛̣𝗽 𝗹𝗲̣̂", threadID, messageID);
    if(choose == 'cuocso' && (tong < 1 || tong > 6)) return api.sendMessage("[ ❗ ] 𝗦𝗼̂́ 𝗯𝗮̣𝗻 𝗰𝗵𝗼̣𝗻 𝗸𝗵𝗼̂𝗻𝗴 𝗵𝗼̛̣𝗽 𝗹𝗲̣̂ ?", threadID, messageID);
    const number = [], img = [], bodem = 0;
   api.sendMessage("[ 🎲 ] - Bot đang lắc...", threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 7 * 1000));
      return api.unsendMessage(info.messageID);
          }, messageID);
    for(let i = 1; i < 4; i++){
    var n = Math.floor(Math.random() * 6 + 1) 
    number.push(n)
    var img_ = (await axios.get(encodeURI(getImage(n)), { responseType: 'stream' })).data;
    img.push(img_)
     await new Promise(resolve => setTimeout(resolve, timedelay * 1000))
}
var total = number[0] + number[1] + number[2];
if(choose == 'cuocso'){
    if(number[0] == tong || number[1] == tong || number[2] == tong){
        var ans = `${tong}`
        var result = 'win'
        var mn = bet * motsogiong
    }
    if(number[1] == tong && number[2] == tong || number[0] == tong && number[2] == tong || number[0] == tong && number[1] == tong){
        var ans = `${tong}`
        var result = 'win'
        var mn = bet * haisogiong
    }
    if(number[0] == tong && number[1] == tong && number[2] == tong){
        var ans = `${tong}`
        var result = 'win'
        var mn = bet * basogiong
    }
    if(number[0] != tong && number[1] != tong && number[2] != tong){
        var ans = `${tong}`
        var result = 'lose'
        var mn = bet
    }   
}
if(choose == 'cuoctong'){
    if(total == tong){
        var ans = "cược tổng"
        var result = 'win'
        var mn = bet * parseInt((getRATE(tong)))
    } else {
        var ans = `${total}`
        var result = 'lose'
        var mn = bet
    }
}
if(choose == 'b3gn' ){
    if(number[0] == number[1] && number[1] == number[2]) {
        var ans = "bộ ba đồng nhất"
        var result = 'win'
        var mn = bet * tilethangb3dn
    } else {
        var ans = (total >= 11 && total <= 18 ? "tài" : "xỉu") 
        var result = 'lose'
        var mn = bet
    }
}
if(choose == 'b2gn'){
    if(number[0] == number[1] || number[1] == number[2] || number[0] == number[2]) {
        var ans = "bộ hai đồng nhất"
        var result = 'win'
        var mn = bet * tilethangb2dn
    } else {
        var ans = (total >= 11 && total <= 18 ? "tài" : "xỉu") 
        var result = 'lose'
        var mn = bet
    }
}
if(choose == 'tài' || choose == 'xỉu') {
if(number[0] == number[1] && number[1] == number[2]){
var ans = "bộ ba đồng nhất"
} else {
var ans = (total >= 11 && total <= 18 ? "tài" : "xỉu") 
}
if(number[0] == number[1] && number[1] == number[2]) {
    var result = 'lose'
    var mn = bet
}
if(ans == choose) {
    var result = 'win'
    var mn = bet * tilethang
} else {
    var result = 'lose'
    var mn = bet
   }
}
       if(result =='lose'){
    Currencies.decreaseMoney(senderID, mn)
} else if(result == 'win'){
    Currencies.increaseMoney(senderID, mn)
}
  var msg = `=======〘 𝐊𝐄̂́𝐓 𝐐𝐔𝐀̉ 〙=======` 
            + '\n' +
            `◈ 𝐓𝐢𝐦𝐞: ${format_day}`
            + '\n' +
            `◈🧸 𝐏𝐥𝐚𝐲𝐞𝐫: ${name}`
            + '\n' +
            `◈🎲 𝐋𝐮̛̣𝐚 𝐂𝐡𝐨̣𝐧: ${choose}`
            + '\n' +
            `◈💰 𝐓𝐢𝐞̂̀𝐧 𝐂𝐮̛𝐨̛̣𝐜: ${replace(bet)}`
            + '\n' +
            `▭▭▭▭▭▭▭▭▭▭▭▭▭▭`            
            + '\n' +
            `◈🎲 𝐋𝐚̂̀𝐧 𝐋𝐚̆́𝐜 𝐓𝐡𝐮̛́ 𝟏: ${number[0]}`
            + '\n' + 
            `◈🎲 𝐋𝐚̂̀𝐧 𝐋𝐚̆́𝐜 𝐓𝐡𝐮̛́ 𝟐: ${number[1]}`
            + '\n' +
            `◈🎲 𝐋𝐚̂̀𝐧 𝐋𝐚̆́𝐜 𝐓𝐡𝐮̛́ 𝟑: ${number[2]}`
            + '\n' +
            `▭▭▭▭▭▭▭▭▭▭▭▭▭▭`
            + '\n' +
            `➾🎲 𝐁𝐨𝐭 𝐋𝐚̆́𝐜 𝐑𝐚: ${ans}`
            + '\n' +
            `➾🔎 𝐓𝐨̂̉𝐧𝐠 𝐏𝐨𝐢𝐧𝐭: ${total}`
            + '\n' +
            `➾🤑 𝐊𝐞̂́𝐭 𝐐𝐮𝐚̉: ${(result == 'win' ? 'Thắng' : 'Thua')}`
            + '\n' +
            `➾📌 𝐌𝐨𝐧𝐞𝐲: ${(result == 'win' ? '+' : '-')} ${replace(Math.floor(mn))}$`
            + '\n' +
            `➾🛎️ 𝐓𝐫𝐚̣𝐧𝐠 𝐓𝐡𝐚́𝐢: ${(result == 'win' ? 'Đã Trả Thưởng' : 'Đã Trừ Tiền')}`
         api.sendMessage({body: msg, attachment: img }, threadID, messageID);
} catch(e){
    console.log(e);
  }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

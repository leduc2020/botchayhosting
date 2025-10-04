<<<<<<< HEAD
﻿const fs = require("fs");
const path = require("path");

// Bảng tiền thưởng 15 câu
const PRIZE_MONEY = [
    10000, 20000, 30000, 50000, 100000,
    200000, 360000, 600000, 800000, 1500000,
    2500000, 3500000, 5000000, 8000000, 12000000
];

// Biến toàn cục để theo dõi các trò chơi đang diễn ra
const activeGames = new Map(); // Lưu trạng thái trò chơi theo threadID

// Hàm hiển thị câu hỏi với xáo trộn đáp án
function showQuestion(question, questionNum, totalMoney, helps, api, event, handleReply) {
    const currentPrize = PRIZE_MONEY[questionNum - 1].toLocaleString();
    const safeHaven = questionNum >= 5 ? PRIZE_MONEY[4].toLocaleString() : "0";

    // Tạo mảng chứa các đáp án
    let answers = [
        { key: 'A', value: question.A },
        { key: 'B', value: question.B },
        { key: 'C', value: question.C },
        { key: 'D', value: question.D }
    ];

    // Xáo trộn mảng đáp án (Fisher-Yates shuffle)
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    // Tạo ánh xạ để kiểm tra đáp án sau khi xáo trộn
    const answerMap = {};
    answers.forEach((ans, index) => {
        answerMap[['A', 'B', 'C', 'D'][index]] = ans.key; // Ánh xạ vị trí mới sang key gốc
    });

    // Cập nhật đáp án đúng theo vị trí mới
    const newCorrectAnswer = Object.keys(answerMap).find(key => answerMap[key] === question.dapan.toUpperCase());

    let helpText = "TRỢ GIÚP (chọn số):\n";
    if (!helps.used1) helpText += "1. 50/50\n";
    if (!helps.used2) helpText += "2. Trường quay\n";
    if (!helps.used3) helpText += "3. Khán giả\n";
    if (!helps.used4) helpText += "4. Gọi người nhà\n";

    const message = `
🎯 CÂU ${questionNum} - ${currentPrize} VND
${question.cauhoi}

A: ${answers[0].value}
B: ${answers[1].value}
C: ${answers[2].value}
D: ${answers[3].value}

${helpText}
⏳ Bạn có 40 giây để trả lời!
⏳ Mốc an toàn: ${safeHaven} VND
    `;

    api.sendMessage(message, event.threadID, (err, info) => {
        const timeoutID = setTimeout(async () => {
            // Thu hồi tin nhắn câu hỏi
            await api.unsendMessage(info.messageID);
            const finalPrize = questionNum >= 5 ? PRIZE_MONEY[4] : 0;
            await api.sendMessage(
                `⏰ HẾT GIỜ! Bạn thua do không trả lời trong 40 giây.\n` +
                `Đáp án đúng: ${newCorrectAnswer}\n` +
                `Giải thích: ${question.giaithich}\n` +
                `Bạn nhận được ${finalPrize.toLocaleString()} VND!`,
                event.threadID
            );
            if (finalPrize > 0) await global.Currencies.increaseMoney(event.senderID, finalPrize);
            activeGames.delete(event.threadID); // Kết thúc trò chơi để người khác có thể chơi
            // Xóa handleReply để tránh xử lý thêm
            global.client.handleReply = global.client.handleReply.filter(reply => reply.messageID !== info.messageID);
        }, 40000); // 40 giây

        global.client.handleReply.push({
            ...handleReply,
            messageID: info.messageID,
            step: "answering",
            timeoutID: timeoutID,
            answerMap: answerMap, // Lưu ánh xạ để kiểm tra đáp án
            newCorrectAnswer: newCorrectAnswer // Lưu đáp án đúng mới
        });
    });
}

module.exports.config = {
    name: "altp",
    version: "4.1.0", // Cập nhật version để đánh dấu tính năng xáo trộn đáp án
    hasPermssion: 0,
    credits: "Niio-team (Vtuan) - Enhanced by D-Jukie, ChatGPT & Grok",
    description: "Game Ai Là Triệu Phú",
    commandCategory: "Game",
    usages: "altp",
    cooldowns: 0,
};

module.exports.run = async function ({ api, event }) {
    const { threadID, senderID } = event;

    // Kiểm tra xem có trò chơi nào đang diễn ra trong thread này không
    if (activeGames.has(threadID)) {
        const currentPlayer = activeGames.get(threadID).author;
        if (currentPlayer !== senderID) {
            return api.sendMessage(
                "⛔ Hiện tại đang có người chơi trong nhóm này. Vui lòng đợi họ hoàn thành trước khi bắt đầu!",
                threadID
            );
        }
    }

    const message = `
─────────────────────────
[ 🏆 ] AI LÀ TRIỆU PHÚ [ 🏆 ]
─────────────────────────

[ 📚 ] Luật chơi:
- 15 câu hỏi, tiền thưởng tăng dần
- 4 trợ giúp (mỗi loại dùng 1 lần)
- Bạn có 40 giây để trả lời mỗi câu hỏi, nếu không câu hỏi sẽ bị thu hồi và bạn thua!
- Các đáp án sẽ được xáo trộn ngẫu nhiên mỗi khi câu hỏi được hiển thị.

[ 💰 ] CƠ CẤU TIỀN THƯỞNG VÀ MỐC AN TOÀN:

• Mốc Câu Hỏi: Câu 1-4
- Tiền Thưởng: 10,000 - 50,000 VND
- Mốc An Toàn: 0 VND
- Nếu Sai/Thua Sẽ Nhận: 0 VND

• Mốc Câu Hỏi: Câu 5
- Tiền Thưởng: 100,000 VND
- Mốc An Toàn: 100,000 VND
- Nếu Sai/Thua Sẽ Nhận: 100,000 VND

• Mốc Câu Hỏi: Câu 6-15
- Tiền Thưởng: 200,000 - 12,000,000 VND
- Mốc An Toàn: 100,000 VND
- Nếu Sai/Thua Sẽ Nhận: 100,000 VND

- (Mốc An Toàn là số tiền tối thiểu bạn nhận khi vượt mốc đó, kể cả khi sai hoặc thua ở câu tiếp theo.)

─────────────────────────

[ 🎮 ] Chọn:
- Gõ "play" để bắt đầu chơi
- (Gõ "dừng" để giữ tiền) `;

    api.sendMessage(message, threadID, (error, info) => {
        // Lưu trạng thái trò chơi
        activeGames.set(threadID, { author: senderID });
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            step: "choosing",
            questionNum: 0,
            totalMoney: 0,
            helps: {
                used1: false,
                used2: false,
                used3: false,
                used4: false
            },
            askedQuestions: []
        });
    });
}

module.exports.handleReply = async function ({ handleReply, event, api, Currencies }) {
    const { body, threadID, messageID, senderID } = event;
    const { step, question, questionNum, totalMoney, helps, askedQuestions, timeoutID, answerMap, newCorrectAnswer } = handleReply;

    // Kiểm tra người chơi
    if (senderID !== handleReply.author) {
        return api.sendMessage("⛔ Không phải lượt của bạn!", threadID);
    }

    // Hủy timeout khi nhận được phản hồi
    clearTimeout(timeoutID);

    api.unsendMessage(handleReply.messageID);

    // Helper function để tạo khóa duy nhất cho một câu hỏi
    const generateQuestionKey = (q) => {
        return `${q.cauhoi.trim()}|||${q.dapan.trim()}`;
    };

    // Lấy câu hỏi ngẫu nhiên
    const getQuestion = (difficulty, currentAskedQuestions) => {
        const file = path.join(__dirname, "Game", "altp.json");
        let data;
        try {
            data = JSON.parse(fs.readFileSync(file, "utf8"));
        } catch (e) {
            console.error(`[ALTP] Lỗi đọc hoặc parse file altp.json: ${e.message}`);
            api.sendMessage("Đã xảy ra lỗi khi đọc dữ liệu câu hỏi. Vui lòng kiểm tra file altp.json hoặc liên hệ admin.", threadID);
            return null;
        }

        const allQuestionsForDifficulty = data[difficulty] || [];
        const availableQuestions = allQuestionsForDifficulty.filter(q => {
            const qKey = generateQuestionKey(q);
            return !currentAskedQuestions.includes(qKey);
        });

        if (availableQuestions.length === 0) {
            console.warn(`[ALTP] Hết câu hỏi cho độ khó: ${difficulty} hoặc tất cả đã được hỏi.`);
            return null;
        }

        const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        return selectedQuestion;
    };

    // Xử lý lệnh dừng
    if (body.toLowerCase().includes("dừng")) {
        const finalPrize = questionNum >= 5 ? PRIZE_MONEY[4] : 0;
        const wonAmount = (questionNum > 0 && questionNum <= PRIZE_MONEY.length) ? PRIZE_MONEY[questionNum - 1] : 0;
        const actualWon = Math.max(wonAmount, finalPrize);

        if (actualWon > 0) await Currencies.increaseMoney(senderID, actualWon);
        activeGames.delete(threadID); // Kết thúc trò chơi
        return api.sendMessage(
            `🎉 Bạn dừng cuộc chơi tại câu ${questionNum} và nhận ${actualWon.toLocaleString()} VND!`,
            threadID
        );
    }

    // Chọn chế độ
    if (step === "choosing" && body.toLowerCase() === "play") {
        const firstQuestion = getQuestion("de", askedQuestions);
        if (!firstQuestion) {
            activeGames.delete(threadID); // Xóa trạng thái nếu không có câu hỏi
            return api.sendMessage("Xin lỗi, không thể bắt đầu game. Không có câu hỏi nào sẵn sàng.", threadID);
        }

        askedQuestions.push(generateQuestionKey(firstQuestion));

        showQuestion(firstQuestion, 1, 0, helps, api, event, {
            ...handleReply,
            question: firstQuestion,
            step: "answering",
            questionNum: 1,
            askedQuestions: askedQuestions
        });
        return;
    }

    // Xử lý trợ giúp (1-4)
    if (step === "answering" && /^[1-4]$/.test(body)) {
        const helpNum = parseInt(body);
        const helpKey = `used${helpNum}`;

        if (helps[helpKey]) {
            return api.sendMessage("⚠️ Bạn đã dùng trợ giúp này rồi!", threadID);
        }

        helps[helpKey] = true;
        let result = "";

        // Khai báo allOptions dựa trên đáp án đã xáo trộn
        const allOptions = ['A', 'B', 'C', 'D'];

        switch (helpNum) {
            case 1: // 50/50
                const correct = newCorrectAnswer; // Sử dụng đáp án đúng mới
                const wrong = allOptions.filter(a => a !== correct);
                const removed = wrong.sort(() => 0.5 - Math.random()).slice(0, 2);
                result = `50/50: Loại ${removed.join(", ")}\nCòn lại: ${correct} và ${allOptions.find(a => a !== correct && !removed.includes(a))}`;
                break;

            case 2: // Trường quay
                const correctAnsStudio = newCorrectAnswer;
                const isStudioCorrect = Math.random() < 0.7;

                let studioSuggestions = [];
                let mainAnswerPercent;
                let otherAnswerPercent;
                let otherAnswer;

                if (isStudioCorrect) {
                    mainAnswerPercent = Math.floor(Math.random() * 21) + 60;
                    otherAnswerPercent = 100 - mainAnswerPercent;
                    const incorrectOptions = allOptions.filter(o => o !== correctAnsStudio);
                    otherAnswer = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
                    studioSuggestions.push({ ans: correctAnsStudio, percent: mainAnswerPercent });
                    studioSuggestions.push({ ans: otherAnswer, percent: otherAnswerPercent });
                } else {
                    const incorrectOptions = allOptions.filter(o => o !== correctAnsStudio);
                    const mainIncorrectAns = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
                    mainAnswerPercent = Math.floor(Math.random() * 21) + 50;
                    otherAnswerPercent = 100 - mainAnswerPercent;
                    otherAnswer = correctAnsStudio;
                    studioSuggestions.push({ ans: mainIncorrectAns, percent: mainAnswerPercent });
                    studioSuggestions.push({ ans: otherAnswer, percent: otherAnswerPercent });
                }

                studioSuggestions.sort((a, b) => b.percent - a.percent);
                result = `🎤 Trường quay:\n` + studioSuggestions.map(s => `${s.ans}: ${s.percent}%`).join('\n');
                break;

            case 3: // Khán giả
                const correctPercent = Math.floor(Math.random() * 31) + 40; // 40-70% cho đáp án đúng
                const remainingPercent = 100 - correctPercent; // Phần trăm còn lại
                const correctAnswer = newCorrectAnswer;
                const wrongOptions = allOptions.filter(a => a !== correctAnswer);

                // Phân bổ phần trăm cho các đáp án sai
                let distribution = [0, 0, 0];
                let currentSum = 0;
                for (let i = 0; i < 2; i++) {
                    distribution[i] = Math.floor(Math.random() * (remainingPercent - currentSum) / (3 - i));
                    currentSum += distribution[i];
                }
                distribution[2] = remainingPercent - currentSum;

                // Gán phần trăm cho từng đáp án theo thứ tự A, B, C, D
                const percentages = {};
                allOptions.forEach((option, index) => {
                    if (option === correctAnswer) {
                        percentages[option] = correctPercent;
                    } else {
                        percentages[option] = distribution[wrongOptions.indexOf(option)] || 0;
                    }
                });

                // Hiển thị theo thứ tự A, B, C, D
                result = "📊 Khán giả bình chọn:\n" +
                    `A: ${percentages['A'] || 0}%\n` +
                    `B: ${percentages['B'] || 0}%\n` +
                    `C: ${percentages['C'] || 0}%\n` +
                    `D: ${percentages['D'] || 0}%`;
                break;

            case 4: // Người nhà
                const isRight = Math.random() < 0.7;
                const answer = isRight
                    ? newCorrectAnswer
                    : allOptions.filter(a => a !== newCorrectAnswer)[Math.floor(Math.random() * 3)];
                result = `📞 Người nhà: "${isRight ? 'Chắc chắn' : 'Nghiêng về'} ${answer}"`;
                break;
        }

        await api.sendMessage(result, threadID);
        showQuestion(question, questionNum, totalMoney, helps, api, event, handleReply);
        return;
    }

    // Xử lý trả lời
    if (step === "answering" && /^[a-dA-D]$/.test(body)) {
        const userAnswer = body.toUpperCase();
        const correctAnswer = newCorrectAnswer; // Sử dụng đáp án đúng mới

        if (userAnswer === correctAnswer) {
            const newTotal = PRIZE_MONEY[questionNum - 1];

            if (questionNum === 15) {
                await Currencies.increaseMoney(senderID, newTotal);
                activeGames.delete(threadID); // Kết thúc trò chơi
                return api.sendMessage(
                    `🏆 CHÚC MỪNG! Bạn đã chiến thắng với 12,000,000 VND!\n` +
                    `Đáp án: ${correctAnswer}\nGiải thích: ${question.giaithich}`,
                    threadID
                );
            }

            const nextQuestion = getQuestion(
                questionNum < 5 ? "de" :
                questionNum < 10 ? "binhthuong" :
                questionNum < 13 ? "kho" : "sieukho",
                askedQuestions
            );

            if (!nextQuestion) {
                await Currencies.increaseMoney(senderID, newTotal);
                activeGames.delete(threadID); // Kết thúc trò chơi
                return api.sendMessage(
                    `🏆 CHÚC MỪNG! Bạn đã trả lời đúng ${questionNum} câu và không còn câu hỏi nào để tiếp tục. Bạn nhận được ${newTotal.toLocaleString()} VND!`,
                    threadID
                );
            }

            askedQuestions.push(generateQuestionKey(nextQuestion));

            await api.sendMessage(
                `✅ ĐÚNG! (+${newTotal.toLocaleString()} VND)\nGiải thích: ${question.giaithich}`,
                threadID
            );

            showQuestion(nextQuestion, questionNum + 1, newTotal, helps, api, event, {
                ...handleReply,
                question: nextQuestion,
                questionNum: questionNum + 1,
                totalMoney: newTotal,
                askedQuestions: askedQuestions
            });
        } else {
            const finalPrize = questionNum >= 5 ? PRIZE_MONEY[4] : 0;
            await api.sendMessage(
                `❌ SAI! Đáp án: ${correctAnswer}\nGiải thích: ${question.giaithich}\n` +
                `Bạn nhận được ${finalPrize.toLocaleString()} VND!`,
                threadID
            );
            if (finalPrize > 0) await Currencies.increaseMoney(senderID, finalPrize);
            activeGames.delete(threadID); // Kết thúc trò chơi
        }
    }
};
=======
const moneydown = 1000; // Sửa số tiền đăng kí chơi tại đây

const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
const { loadImage, createCanvas, registerFont } = require("canvas");
const path = __dirname + "/cache/question.png";
const pathhelp = __dirname + "/cache/helpaltp.png";

module.exports.config = {
  name: "altp",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Khoa x Nam",
  description: "chương trình Ai Là Triệu Phú siêu khó vip pro",
  commandCategory: "Game",
  usages: "register/play/info/stop",
  cooldowns: 0,
  images: [],
};

function equi(level) {
  if (level == 0) var tienthuong = 0x0;
  if (level == 1) var tienthuong = 0xC8;
  if (level == 2) var tienthuong = 0x190;
  if (level == 3) var tienthuong = 0x258;
  if (level == 4) var tienthuong = 0x3E8;
  if (level == 5) var tienthuong = 0x7D0;
  if (level == 6) var tienthuong = 0xBB8;
  if (level == 7) var tienthuong = 0x1770;
  if (level == 8) var tienthuong = 0x2710;
  if (level == 9) var tienthuong = 0x36B0;
  if (level == 10) var tienthuong = 0x55F0;
  if (level == 11) var tienthuong = 0x7530;
  if (level == 12) var tienthuong = 0x9C40;
  if (level == 13) var tienthuong = 0x13880;
  if (level == 14) var tienthuong = 0x249F0;
  if (level == 15) var tienthuong = 0x3D090;
  return tienthuong;
}

function getlink(helpp, dapan) {
  if (helpp == 1) {
    if (dapan == "A") var link = "https://i.postimg.cc/FKsB9FFL/A.png";
    if (dapan == "B") var link = "https://i.postimg.cc/XJtHcwff/B.png";
    if (dapan == "C") var link = "https://i.postimg.cc/9MDg7x7X/C.png";
    if (dapan == "D") var link = "https://i.postimg.cc/bvCFdXdF/D.png";
  }
  if (helpp == 3) {
    if (dapan == "A") var link = "https://i.postimg.cc/WzjrvzTR/A.png";
    if (dapan == "B") var link = "https://i.postimg.cc/sDjSHMT7/B.png";
    if (dapan == "C") var link = "https://i.postimg.cc/j2XfdTSD/C.png";
    if (dapan == "D") var link = "https://i.postimg.cc/wxcLkXQ9/D.png";
  }
  return link;
}

async function makeWinner(id, lv) {
  var arr = [];
  let canvas = createCanvas(1280, 720);
  let ctx = canvas.getContext("2d");
  let avatar = await loadImage(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  ctx.drawImage(avatar, 351, 75, 566, 566);
  let background = await loadImage("https://i.postimg.cc/gjyHDjYD/winner.png");
  ctx.drawImage(background, 0, 0, 1280, 720);
  var link = [
    "https://i.postimg.cc/6qzBnVGf/lv0.png",
    "https://i.postimg.cc/J7Qrf8dH/lv1.png",
    "https://i.postimg.cc/dttsvfzH/lv2.png",
    "https://i.postimg.cc/xdHYtVzC/lv3.png",
    "https://i.postimg.cc/cLvdtn1f/lv4.png",
    "https://i.postimg.cc/tCSXg5bX/lv5.png",
    "https://i.postimg.cc/d1YFfN29/lv6.png",
    "https://i.postimg.cc/x1Bnv1qh/lv7.png",
    "https://i.postimg.cc/Y287X3h1/lv8.png",
    "https://i.postimg.cc/2yHfVzPH/lv9.png",
    "https://i.postimg.cc/m2DsKHHK/lv10.png",
    "https://i.postimg.cc/4NSgGxvy/lv11.png",
    "https://i.postimg.cc/s2pd5PkG/lv12.png",
    "https://i.postimg.cc/vmRw12Nd/lv13.png",
    "https://i.postimg.cc/KzN6HGvZ/lv14.png",
    "https://i.postimg.cc/fLD4Cts2/lv15.png"
  ];
  let tienthuong = await loadImage(link[lv]);
  ctx.drawImage(tienthuong, 0, 0, 1280, 720);
  fs.writeFileSync(path, canvas.toBuffer("image/png"));
  arr.push(fs.createReadStream(path));
  return arr;
}

module.exports.handleReply = async function ({ event, Users, api, handleReply, Currencies }) {
  if (handleReply.type == "answer") {
    var { threadID, messageID, senderID } = event;
    if (senderID !== handleReply.author) return api.sendMessage("𝗡𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗮 đ𝗮𝗻𝗴 𝗰𝗵𝗼̛𝗶 , đ𝗶 𝗿𝗮 𝗰𝗵𝗼̂̃ 𝗸𝗵𝗮́𝗰", threadID, messageID);
    var name = await Users.getNameUser(senderID);
    var senderInfo = await Users.getData(senderID);
    var choose = event.body.toUpperCase();
    var mot = handleReply.one;
    var hai = handleReply.two;
    var ba = handleReply.three;
    var a = handleReply.author;
    var b = handleReply.dapandung;
    var c = handleReply.giaithich;
    var loz = handleReply.link;

    if (choose == "HELP 1" || choose == "HELP1") {
      if (senderInfo.data.helpaltp.helpm !== 1) return api.sendMessage("𝗕𝗮̣𝗻 đ𝗮̃ 𝗱𝘂̀𝗻𝗴 𝗾𝘂𝘆𝗲̂̀𝗻 𝘁𝗿𝗼̛̣ 𝗴𝗶𝘂́𝗽 𝗻𝗮̀𝘆 𝗿𝗼̂̀𝗶", threadID, messageID);
      api.unsendMessage(handleReply.messageID);
      let canvas = createCanvas(588, 375);
      let background = await loadImage(loz);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(background, 0, 0, 588, 375);
      let loaibo1 = await loadImage(getlink(1, mot[0]));
      let loaibo2 = await loadImage(getlink(1, mot[1]));
      ctx.drawImage(loaibo1, 0, 0, 588, 375);
      ctx.drawImage(loaibo2, 0, 0, 588, 375);
      if (senderInfo.data.helpaltp.helpb == 2) {
        let tuvan1 = await loadImage(getlink(3, ba[0]));
        let tuvan2 = await loadImage(getlink(3, ba[1]));
        let tuvan3 = await loadImage(getlink(3, ba[2]));
        ctx.drawImage(tuvan1, 407, 50, 181, 50);
        ctx.drawImage(tuvan2, 407, 100, 181, 50);
        ctx.drawImage(tuvan3, 407, 150, 181, 50);
      }
      fs.writeFileSync(pathhelp, canvas.toBuffer("image/png"));
      senderInfo.data.helpaltp.helpm = 2;
      await Users.setData(senderID, senderInfo);
      var fuckk = `𝗛𝗲̣̂ 𝘁𝗵𝗼̂́𝗻𝗴 đ𝗮̃ 𝗹𝗼𝗮̣𝗶 𝗯𝗼̉ 𝗵𝗮𝘆 𝗽𝗵𝘂̛𝗼̛𝗻𝗴 𝗮́𝗻 𝘀𝗮𝗶 𝗹𝗮̀ ${mot[0]} 𝘃𝗮̀ ${mot[1]}`;
      if (senderInfo.data.helpaltp.helph == 1 || senderInfo.data.helpaltp.helpb == 1) fuckk += "\n== [ 𝗖𝗢́ 2 𝗦𝗨̛̣ 𝗧𝗥𝗢̛̣ 𝗚𝗜𝗨́𝗣 ] ==";
      if (senderInfo.data.helpaltp.helph == 1) fuckk += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help2 " Hỏi ý kiến khán giả';
      if (senderInfo.data.helpaltp.helpb == 1) fuckk += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help3 " Hỏi tổ tư vấn tại chỗ';
      return api.sendMessage({
        body: fuckk,
        attachment: fs.createReadStream(pathhelp)}, threadID, (error, info) => {
          global.client.handleReply.push({
            type: "answer",
            name: this.config.name,
            author: a,
            dapandung: b,
            giaithich: c,
            one: mot,
            two: hai,
            three: ba,
            link: loz,
            level: senderInfo.data.altp.level,
            messageID: info.messageID
          })
        fs.unlinkSync(pathhelp)
      })
    }
    if (senderInfo.data.helpaltp.helpm == 2 && (choose == mot[0] || choose == mot[1])) return api.sendMessage("Đ𝗮́𝗽 𝗮́𝗻 𝗻𝗮̀𝘆 đ𝗮̃ 𝗯𝗶̣ 𝗹𝗼𝗮̣𝗶 𝗯𝗼̉!", threadID, messageID);

    if (choose == "HELP 2" || choose == "HELP2") {
      if (senderInfo.data.helpaltp.helph !== 1) return api.sendMessage("𝗕𝗮̣𝗻 đ𝗮̃ 𝗱𝘂̀𝗻𝗴 𝗾𝘂𝘆𝗲̂̀𝗻 𝘁𝗿𝗼̛̣ 𝗴𝗶𝘂́𝗽 𝗻𝗮̀𝘆 𝗿𝗼̂̀𝗶", threadID, messageID);
  var linkhai = hai.length == 1 ? hai[0] : senderInfo.data.helpaltp.helpm == 2 ? hai[1] : hai[0];
      var down = (await axios.get(linkhai, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathhelp, Buffer.from(down, "utf-8"));
      senderInfo.data.helpaltp.helph = 2;
      await Users.setData(senderID, senderInfo);
      return api.sendMessage({
        body: "Đ𝗮̂𝘆 𝗹𝗮̀ 𝗸𝗲̂́𝘁 𝗾𝘂𝗮̉ 𝗸𝗵𝗮̉𝗼 𝘀𝗮́𝘁 𝘆́ 𝗸𝗶𝗲̂́𝗻 𝗸𝗵𝗮́𝗻 𝗴𝗶𝗮̉!",
        attachment: fs.createReadStream(pathhelp)
      }, threadID, () => fs.unlinkSync(pathhelp), messageID);
    }

    if (choose == "HELP 3" || choose == "HELP3") {
      if (senderInfo.data.helpaltp.helpb !== 1) return api.sendMessage("𝗕𝗮̣𝗻 đ𝗮̃ 𝗱𝘂̀𝗻𝗴 𝗾𝘂𝘆𝗲̂̀𝗻 𝘁𝗿𝗼̛̣ 𝗴𝗶𝘂́𝗽 𝗻𝗮̀𝘆 𝗿𝗼̂̀𝗶", threadID, messageID);
      api.unsendMessage(handleReply.messageID);
      let background = await loadImage(loz);
      let tuvan1 = await loadImage(getlink(3, ba[0]));
      let tuvan2 = await loadImage(getlink(3, ba[1]));
      let tuvan3 = await loadImage(getlink(3, ba[2]));
      let canvas = createCanvas(588, 375);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(background, 0, 0, 588, 375);
      if (senderInfo.data.helpaltp.helpm == 2) {
        let loaibo1 = await loadImage(getlink(1, mot[0]));
        let loaibo2 = await loadImage(getlink(1, mot[1]));
        ctx.drawImage(loaibo1, 0, 0, 588, 375);
        ctx.drawImage(loaibo2, 0, 0, 588, 375);
      }
      ctx.drawImage(tuvan1, 407, 50, 181, 50);
      ctx.drawImage(tuvan2, 407, 100, 181, 50);
      ctx.drawImage(tuvan3, 407, 150, 181, 50);
      fs.writeFileSync(pathhelp, canvas.toBuffer("image/png"));
      senderInfo.data.helpaltp.helpb = 2;
      await Users.setData(senderID, senderInfo);
      var bd = "Đ𝗮̂𝘆 𝗹𝗮̀ 𝘆́ 𝗸𝗶𝗲̂́𝗻 𝗰𝘂̉𝗮 𝟯 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝘁𝗿𝗼𝗻𝗴 𝘁𝗼̂̉ 𝘁𝘂̛ 𝘃𝗮̂́𝗻!";
      if (senderInfo.data.helpaltp.helpm == 1 || senderInfo.data.helpaltp.helph == 1) bd += "\n== [ 𝗖𝗢́ 2 𝗦𝗨̛̣ 𝗧𝗥𝗢̛̣ 𝗚𝗜𝗨́𝗣 ] ==";
      if (senderInfo.data.helpaltp.helpm == 1)  bd += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help1 " 50 đúng 50 sai';
      if (senderInfo.data.helpaltp.helph == 1)  bd += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help2 " hỏi ý kiến khán giả';
      return api.sendMessage({
        body: bd,
        attachment: fs.createReadStream(pathhelp)}, threadID, (error, info) => {
          global.client.handleReply.push({
            type: "answer",
            name: this.config.name,
            author: a,
            dapandung: b,
            giaithich: c,
            one: mot,
            two: hai,
            three: ba,
            link: loz,
            level: senderInfo.data.altp.level,
            messageID: info.messageID
          })
        fs.unlinkSync(pathhelp)
      })
    }

    if (choose !== "A" && choose !== "B" && choose !== "C" && choose !== "D") return api.sendMessage("𝗞𝗵𝗼̂𝗻𝗴 𝗵𝗼̛̣𝗽 𝗹𝗲̣̂",threadID, messageID);
    if (choose == handleReply.dapandung) {
      var levelcc = handleReply.level + 1;
      if (levelcc < 15) {
        api.unsendMessage(handleReply.messageID);
        var djtme = levelcc == 1 ? "➝ câu hỏi đầu tiên" : `➝ câu hỏi số ${levelcc}`;
        api.sendMessage(`➝ ${choose} là đáp án chính xác, ${handleReply.giaithich}\n\n➝ Xin chúc mừng người chơi ${name} đã xuất sắc trả lời đúng ${djtme} nâng mức phần thưởng lên ${equi(levelcc)}$`, threadID, messageID);
        var cauhoi = levelcc + 1;
try {
        const res = await axios.get(`https://raw.githubusercontent.com/dongdev06/ailatrieuphu/main/altp${cauhoi}.json`);
        var x = Math.floor(Math.random() * res.data.allquestion.length);
        var question = res.data.allquestion[x];
        var linkanh = question.link;
        var dapandung = question.dapan;
        var giaithich = question.giaithich;
        var helpmot = question.helpone;
        var helphai = question.helptwo;
        var helpba = question.helpthree;
        senderInfo.data.altp = { level: levelcc, rd: x };
        if (senderInfo.data.helpaltp.helpm == 2) senderInfo.data.helpaltp.helpm = 0;
        if (senderInfo.data.helpaltp.helph == 2) senderInfo.data.helpaltp.helph = 0;
        if (senderInfo.data.helpaltp.helpb == 2) senderInfo.data.helpaltp.helpb = 0;
        await Users.setData(senderID, senderInfo);
        var cc = cauhoi == 5 ? "➝ Câu hỏi cột mốc đầu tiên" : cauhoi == 10 ? "➝ Câu hỏi cột mốc thứ hai" : cauhoi == 15 ? "➝ Câu hỏi cuối cùng" : `➝ Câu hỏi số ${cauhoi}`;
        var lmao = cc !== `Câu hỏi số ${cauhoi}` ? "trị giá" : "nâng mức phần thưởng lên";
        var bruh = `${cc} ${lmao} ${equi(cauhoi)}$`;
        if (senderInfo.data.helpaltp.helpm == 1 || senderInfo.data.helpaltp.helph == 1 || senderInfo.data.helpaltp.helpb == 1) bruh += "\n== [ 𝗖𝗢́ 3 𝗦𝗨̛̣ 𝗧𝗥𝗢̛̣ 𝗚𝗜𝗨́𝗣 ] ==";
        if (senderInfo.data.helpaltp.helpm == 1) bruh += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help1 " 50 đúng 50 sai';
        if (senderInfo.data.helpaltp.helph == 1) bruh += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help2 " hỏi ý kiến khán giả';
        if (senderInfo.data.helpaltp.helpb == 1) bruh += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help3 " hỏi tổ tư vấn tại chỗ';
        var callback = () => api.sendMessage({
        body: `${bruh}`,
        attachment: fs.createReadStream(path)}, threadID, (error, info) => {
          global.client.handleReply.push({
            type: "answer",
            name: this.config.name,
            author: senderID,
            dapandung: dapandung,
            giaithich: giaithich,
            one: helpmot,
            two: helphai,
            three: helpba,
            link: linkanh,
            level: senderInfo.data.altp.level,
            messageID: info.messageID
          })
        fs.unlinkSync(__dirname + "/cache/question.png")
        })
        return request(linkanh).pipe(fs.createWriteStream(path)).on("close",() => callback());
} catch (error) {
  return api.sendMessage(`➝ Đã xảy ra lỗi khi lấy câu hỏi tiếp theo!\n${error}`,threadID);
}
      } else if (levelcc == 15) {
        api.unsendMessage(handleReply.messageID);
        Currencies.increaseMoney(senderID, 0x3D090);
        senderInfo.data.altp = { level: -1, rd: -1 };
        await Users.setData(senderID, senderInfo);
        return api.sendMessage({ body: `➝ ${choose} là đáp án chính xác, ${handleReply.giaithich}\n\n➝
 Xin chúc mừng người chơi ${name} đã xuất sắc vượt qua 15 câu hỏi của chương trình mang về 250000$\n➝ Hẹn gặp lại bạn ở chương trình lần sau!`, attachment: await makeWinner(senderID, 15)}, threadID, () => fs.unlinkSync(path), messageID);
      }
    } else {
      api.unsendMessage(handleReply.messageID);
      var level = handleReply.level;
      if (level >= 5 && level < 10) { var tienthuong = 0x7D0; } else if (level >= 10) { var tienthuong = 0x55F0; } else var tienthuong = 0;
      senderInfo.data.altp = { level: -1, rd: -1 };
      await Users.setData(senderID, senderInfo);
      if (tienthuong == 0x7D0) var moc = "đầu tiên", xx = 5;
      if (tienthuong == 0x55F0) var moc = "thứ hai", xx = 10;
      if (moc == "đầu tiên" || moc == "thứ hai") {
        Currencies.increaseMoney(senderID, tienthuong);
        return api.sendMessage({ body:`➝ ${choose} là đáp án không chính xác, câu trả lời đúng của chúng ta là ${handleReply.dapandung}, ${handleReply.giaithich}\n\n➝ Người chơi của chúng ta đã trả lời sai và ra về với phần thưởng ở mốc ${moc} là ${tienthuong}$\n➝ Cảm ơn bạn đã tham gia chương trình, hẹn gặp lại bạn ở chương trình lần sau!`, attachment: await makeWinner(senderID, xx)}, threadID, () => fs.unlinkSync(path), messageID);
      } else {
        return api.sendMessage({ body: `➝ ${choose} là đáp án không chính xác, câu trả lời đúng của chúng ta là ${handleReply.dapandung}, ${handleReply.giaithich}\n\n➝ Cảm ơn bạn đã tham gia chương trình, hẹn gặp lại bạn ở chương trình lần sau!`, attachment: await makeWinner(senderID, 0)}, threadID, () => fs.unlinkSync(path), messageID); 
      }
    }
  }
}


module.exports.run = async function ({ api, event, args, Currencies, Users}) {
  const { ADMINBOT, PREFIX } = global.config;
  const timeVN = require("moment-timezone").tz("Asia/Ho_Chi_Minh"),
  gio = timeVN.format("HH:mm:ss"),
  ngay = timeVN.format("DD/MM/YYYY")
  const threadSetting = global.data.threadData.get(event.threadID) || {};
  var prefix = threadSetting.PREFIX || PREFIX;
  const { configPath } = global.client;
  delete require.cache[require.resolve(configPath)];
  var config = require(configPath);
  var { threadID, messageID, senderID } = event;
  const dataMoney = await Currencies.getData(senderID);
  const money = dataMoney.money;
  var senderInfo = await Users.getData(senderID);
  var playto = (!senderInfo.data.altp || senderInfo.data.altp.level == -1) ? "Bắt đầu chơi (cần đăng kí)" : senderInfo.data.altp.level == 0 ? "Bắt đầu chơi" : `chơi tiếp tại câu hỏi số ${senderInfo.data.altp.level}`;

var path = __dirname + "/cache/altp.png";
    let getimg = (await axios.get(`https://i.imgur.com/PiUzRJK.png`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(path, Buffer.from(getimg, "utf-8"));
  
  var msg = "=== [ 𝗔𝗜 𝗟𝗔̀ 𝗧𝗥𝗜𝗘̣̂𝗨 𝗣𝗛𝗨́ ] ===" + "\n"
+ prefix + "𝗔𝗟𝗧𝗣 𝗥𝗘𝗚𝗜𝗦𝗧𝗘𝗥 ➝ Đăng kí chương trình (cần 1000$)" + "\n"
+ prefix + "𝗔𝗟𝗧𝗣 𝗣𝗟𝗔𝗬 ➝ " + playto + "\n"
+ prefix + "𝗔𝗟𝗧𝗣 𝗜𝗡𝗙𝗢 ➝ Xem thông tin câu hỏi và tiền thưởng" + "\n"
+ prefix + "𝗔𝗟𝗧𝗣 𝗧𝗢𝗣 <𝗕𝗢𝗫/𝗦𝗘𝗩𝗘𝗥> ➝ Xem hạng level box và sever" + "\n"
+ prefix + "𝗔𝗟𝗧𝗣 𝗦𝗧𝗢𝗣 ➝ Dừng chơi và nhận tiền thưởng"
  if (ADMINBOT.includes(senderID)) msg += `\n𝗔𝗟𝗧𝗣 𝗦𝗘𝗧𝗟𝗩 ➝ Set level của @tag (dành riêng admin)\n\n`;
  if (args.length == 0) return api.sendMessage({ body: msg , attachment: fs.createReadStream(__dirname + "/cache/altp.png")}, event.threadID, event.messageID);

  var type = args[0].toLowerCase();
  const allType = ["register","play","info","stop","setlv","top"];
  if (!allType.includes(type)) return api.sendMessage(msg, threadID, messageID);
  
  if (type == "top") {
    if (args.length == 1 || (args[1] !== "box" && args[1] !== "sever")) return api.sendMessage(`➝ Cú pháp: ${prefix}altp top <Box/Sever>`,threadID, messageID);
    var arr = [], count = 0;
    let allID = args[1] == "box" ? (await api.getThreadInfo(threadID)).participantIDs : args[1] == "sever" ? global.data.allUserID : ""
    for (const i of allID) {
      let dataUser = await Users.getData(i)
      var lv = (!dataUser.data.altp || dataUser.data.altp.level == -1) ? 0 : dataUser.data.altp.level;
      arr.push({
        idUser: i,
        nameUser: dataUser.name,
        level: lv
      })
      ++count;
      if (count > 10) break;
    }
    count = 0;
    arr.sort(VC("level"));
    var msg = `𝗧𝗢𝗣 ${arr.length} 𝗡𝗚𝗨̛𝗢̛̀𝗜 𝗖𝗛𝗢̛𝗜 𝗖𝗢́ 𝗟𝗘𝗩𝗘𝗟 𝗖𝗔𝗢 𝗡𝗛𝗔̂́𝗧 ${args[1] == "box" ? "nhóm" : args[1] == "sever" ? "server" : ""}\n`.toUpperCase()
    for (const i in arr) {
      msg += `${count == 1 ? "「🥇」" : count == 2 ? "「🥈」" : count == 3 ? "「🥉」" : ""} ${count == 0 ? "「🏆」" : `${count}`} ${arr[i].nameUser}\n➝ 𝗟𝗘𝗩𝗘𝗟: ${arr[i].level}\n`;
      ++count
      if (count >= 10) break;
    }
    api.sendMessage(msg, event.threadID);

    function VC(key) {
      return function(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
        let sos = 0;
        if (a[key] > b[key]) {
          sos = 1
        } else if (a[key] < b[key]) {
          sos = -1
        }
        return sos * -1
      }
    }
  }
  
  if (type == "setlv") {
    try {
      if (!ADMINBOT.includes(event.senderID)) return api.sendMessage("➝ Bạn không đủ quyền hạn để dùng tính năng này!", threadID, messageID);
      var lv = parseInt(args[1]);
      if (isNaN(lv) || lv < 0 || lv > 15) return api.sendMessage(`➝ Level ${args[1]} không hợp lệ!`, threadID, messageID);
      let mention = Object.keys(event.mentions);
      var arr = [];
      var allName = [];
      if (event.type == 'message_reply') {
        arr.push(event.messageReply.senderID)
      } else if (mention.length != 0) {
        for (var i = 0; i < mention.length; i++) arr.push(mention[i])
      } else arr.push(event.senderID)
      for (var i = 0; i < arr.length; i++) {
        var Info = await Users.getData(arr[i]);
        if (!Info.data.altp || Info.data.altp.level == -1) Info.data.helpaltp = { helpm: 1, helph: 1, helpb: 1 };
        Info.data.altp = {
          level: lv,
          rd: -1
        };
        await Users.setData(arr[i], Info);
        if (arr[i] == senderID) {
          allName.push("bản thân");
        } else allName.push(`${i == 0 ? "" : " "}${Info.name}`)
      }
      return api.sendMessage(`Đã đặt level của ${allName} thành ${lv}!`, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`${error}!`, threadID, messageID);
    }
  }

  if (type == "register") {
    if (senderInfo.data.altp && senderInfo.data.altp.level !== -1) return api.sendMessage("➝ Bạn đã đăng kí rồi, vui lòng vượt qua hết câu hỏi hoặc dừng cuộc chơi để có thể đăng kí lại!", threadID, messageID);
    if (money < moneydown) return api.sendMessage(`➝ Bạn không có đủ ${moneydown} để đăng kí, vui lòng theo thầy Huấn làm ăn bươn chải!`, threadID, messageID);
    return api.sendMessage(`➝ Thả icon vào tin nhắn này để xác nhận dùng ${moneydown}$ đăng kí tham gia chương trình!`, threadID, (error, info) => {
      global.client.handleReaction.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        type: "register"
      })
    }, messageID)
  };
  
  if (type == "stop") {
    if (!senderInfo.data.altp || senderInfo.data.altp.level == -1) return api.sendMessage("➝ Bạn chưa đăng kí tham gia chương trình!", threadID, messageID);
    var abc = senderInfo.data.altp.level;
    return api.sendMessage(`➝ Thả icon vào tin nhắn này để xác nhận dừng cuộc chơi tại đây và ra về với phần thưởng ${equi(abc)}$`, threadID, (error, info) => {
      global.client.handleReaction.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        type: "stop"
      })
    }, messageID)
  };
  
  if (type == "info") {
    const pathinfo = __dirname + '/cache/info.png';
    if (!senderInfo.data.altp || senderInfo.data.altp.level == -1) {
      var down = (await axios.get("https://i.postimg.cc/gJT4rzCb/chuadangki.png", { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathinfo, Buffer.from(down, "utf-8"));
      return api.sendMessage({body: `➝ Dùng ${prefix}altp register để đăng kí!`, attachment: fs.createReadStream(pathinfo)}, threadID, () => fs.unlinkSync(pathinfo), messageID);
    }
    var lv = senderInfo.data.altp.level;
    let canvas = createCanvas(1149, 1600);
    let ctx = canvas.getContext("2d");
    let avatar = await loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    ctx.drawImage(avatar, 49, 25, 204, 204);
    var linkinfo = [
      "https://i.postimg.cc/fbM8rgcp/lv0.png",
      "https://i.postimg.cc/jCVXQ8q8/lv1.png",
      "https://i.postimg.cc/Pxx2tpFM/lv2.png",
      "https://i.postimg.cc/RhJdtrm6/lv3.png",
      "https://i.postimg.cc/HWJ1zVs5/lv4.png",
      "https://i.postimg.cc/TPQtMqQw/lv5.png",
      "https://i.postimg.cc/9Xv5nCrk/lv6.png",
      "https://i.postimg.cc/hj6w61Pm/lv7.png",
      "https://i.postimg.cc/4ycMgHmS/lv8.png",
      "https://i.postimg.cc/RVc8pfr3/lv9.png",
      "https://i.postimg.cc/HsGRtzND/lv10.png",
      "https://i.postimg.cc/L4gGfwN3/lv11.png",
      "https://i.postimg.cc/6pcPtXpt/lv12.png",
      "https://i.postimg.cc/BvvVvVjD/lv13.png",
      "https://i.postimg.cc/G3DS9YmM/lv14.png",
      "https://i.postimg.cc/vHd2nB1G/lv15.png"
    ];
    let background = await loadImage(linkinfo[lv]);
    ctx.drawImage(background, 0, 0, 1149, 1600);
    if (senderInfo.data.helpaltp.helpm !== 1 || senderInfo.data.helpaltp.helph !== 1 || senderInfo.data.helpaltp.helpb !== 1) var gachcheo = await loadImage("https://i.postimg.cc/Mp7st8Q1/gachcheo.png");
    if (senderInfo.data.helpaltp.helpm !== 1) ctx.drawImage(gachcheo, 500, 65, 160, 107);
    if (senderInfo.data.helpaltp.helph !== 1) ctx.drawImage(gachcheo, 700, 65, 160, 107);
    if (senderInfo.data.helpaltp.helpb !== 1) ctx.drawImage(gachcheo, 900, 65, 160, 107);
    fs.writeFileSync(pathinfo, canvas.toBuffer("image/png"));
    var sucCak = lv == 0 ? "bắt đầu!" : "tiếp tục!";
    return api.sendMessage({ body: `Dùng ${prefix}altp play để ${sucCak}`, attachment: fs.createReadStream(pathinfo)}, threadID, () => fs.unlinkSync(pathinfo), messageID);
  };

  if (type == "play") {
    try {
      if (!senderInfo.data.altp || senderInfo.data.altp.level == -1) return api.sendMessage (`➝ Bạn chưa đăng kí tham gia chương trình\nVui lòng dùng "${prefix}altp register" để đăng kí (tốn ${moneydown}$)`, threadID, messageID);
      if (isNaN(senderInfo.data.altp.level)) {
        senderInfo.data.altp = { level: 0, rd: -1 }
        await Users.setData(senderID, senderInfo);
      }
      var level = senderInfo.data.altp.level;
      if (level == 15) {
        var name = await Users.getNameUser(senderID);
        Currencies.increaseMoney(senderID, 0x3D090);
        senderInfo.data.altp = { level: -1, rd: -1 };
        await Users.setData(senderID, senderInfo);
        return api.sendMessage({ body: `➝ Xin chúc mừng người chơi ${name} đã xuất sắc vượt qua 15 câu hỏi của chương trình mang về 250000$\nHẹn gặp lại bạn ở chương trình lần sau!`, attachment: await makeWinner(senderID, 15)}, threadID, () => fs.unlinkSync(path), messageID);
      }
      var cauhoi = level + 1;
      const res = await axios.get(`https://raw.githubusercontent.com/dongdev06/ailatrieuphu/main/altp${cauhoi}.json`);
      if (!senderInfo.data.altp.rd || senderInfo.data.altp.rd == -1) {
        var x = Math.floor(Math.random() * res.data.allquestion.length);
        senderInfo.data.altp = { level: level, rd: x };
        await Users.setData(senderID, senderInfo);
      } else var x = senderInfo.data.altp.rd;
      var question = res.data.allquestion[x];
      var linkanh = question.link;
      var dapan = question.dapan;
      var giaithich = question.giaithich;
      var helpmot = question.helpone;
      var helphai = question.helptwo;
      var helpba = question.helpthree;
      var cc = cauhoi == 1 ? "Câu hỏi đầu tiên" : cauhoi == 5 ? "Câu hỏi cột mốc đầu tiên" : cauhoi == 10 ? "Câu hỏi cột mốc thứ hai" : cauhoi == 15 ? "Câu hỏi cuối cùng" : `Câu hỏi số ${cauhoi}`;
      var lmao = cc !== `Câu hỏi số ${cauhoi}` ? "trị giá" : "nâng mức phần thưởng lên";
  var bruh = `${cc} ${lmao} ${equi(level+1)}$`;
  if (senderInfo.data.helpaltp.helpm == 1 || senderInfo.data.helpaltp.helph == 1 || senderInfo.data.helpaltp.helpb == 1) bruh += "\n== [ 𝗖𝗢́ 3 𝗦𝗨̛̣ 𝗧𝗥𝗢̛̣ 𝗚𝗜𝗨́𝗣 ] ==";
  if (senderInfo.data.helpaltp.helpm == 1) bruh += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help1 " 50 đúng 50 sai';
  if (senderInfo.data.helpaltp.helph == 1) bruh += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help2 " hỏi ý kiến khán giả';
      if (senderInfo.data.helpaltp.helpb == 1) bruh += '\n➝ Reply ( Phản hồi ) tin nhắn nhập " help3 " hỏi tổ tư vấn tại chỗ';
  
      if (senderInfo.data.helpaltp.helpm !== 2 && senderInfo.data.helpaltp.helph !== 2 && senderInfo.data.helpaltp.helpb !== 2) {
        var callback = () => api.sendMessage({
          body: `${bruh}`,
          attachment: fs.createReadStream(path)}, threadID, (error, info) => {
            global.client.handleReply.push({
            type: "answer",
            name: this.config.name,
            author: senderID,
            dapandung: dapan,
            giaithich: giaithich,
            one: helpmot,
            two: helphai,
            three: helpba,
            link: linkanh,
            level: level,
            messageID: info.messageID
          })
          fs.unlinkSync(path)
        })
        return request(linkanh).pipe(fs.createWriteStream(path)).on("close",() => callback());
      } else {
        api.sendMessage("Đang khôi phục...", threadID, messageID);
        let canvas = createCanvas(588, 375);
        let background = await loadImage(linkanh);
        let ctx = canvas.getContext("2d");
        ctx.drawImage(background, 0, 0, 588, 375);
        if (senderInfo.data.helpaltp.helpm == 2) {
          let loaibo1 = await loadImage(getlink(1, helpmot[0]));
          let loaibo2 = await loadImage(getlink(1, helpmot[1]));
          ctx.drawImage(loaibo1, 0, 0, 588, 375);
          ctx.drawImage(loaibo2, 0, 0, 588, 375);
        }
        if (senderInfo.data.helpaltp.helpb == 2) {
          let tuvan1 = await loadImage(getlink(3, helpba[0]));
          let tuvan2 = await loadImage(getlink(3, helpba[1]));
          let tuvan3 = await loadImage(getlink(3, helpba[2]));
          ctx.drawImage(tuvan1, 407, 50, 181, 50);
          ctx.drawImage(tuvan2, 407, 100, 181, 50);
          ctx.drawImage(tuvan3, 407, 150, 181, 50);
        }
        fs.writeFileSync(path, canvas.toBuffer("image/png"));
        api.sendMessage({
          body: `${bruh}`,
          attachment: fs.createReadStream(path)}, threadID, (error, info) => {
            global.client.handleReply.push({
            type: "answer",
            name: this.config.name,
            author: senderID,
            dapandung: dapan,
            giaithich: giaithich,
            one: helpmot,
            two: helphai,
            three: helpba,
            link: linkanh,
            level: level,
            messageID: info.messageID
            })
            fs.unlinkSync(path)
          })
        if (senderInfo.data.helpaltp.helph == 2) {
          var linkhai = helphai.length == 1 ? helphai[0] : senderInfo.data.helpaltp.helpm == 2 ? helphai[1] : helphai[0];
          var callback = () => api.sendMessage({ body: "→ Đây là kết quả khảo sát ý kiến khán giả tại trường quay!", attachment: fs.createReadStream(pathhelp)}, threadID, () => fs.unlinkSync(pathhelp));
          return request(linkhai).pipe(fs.createWriteStream(pathhelp)).on("close",() => callback());
        }
        return;
      }
    } catch (error) {
      return api.sendMessage(`Đã xảy ra lỗi!\n${error}`, threadID, messageID);
    }
  }
}

module.exports.handleReaction = async({ api, event, Threads, handleReaction, Currencies, Users }) => {
  if (event.userID != handleReaction.author) return;
  var senderInfo = await Users.getData(handleReaction.author);
  if (handleReaction.type == "register") {
    const threadSetting = global.data.threadData.get(event.threadID) || {};
    var prefix = threadSetting.PREFIX || global.config.PREFIX;
    api.unsendMessage(handleReaction.messageID);
    Currencies.decreaseMoney(handleReaction.author, moneydown);
  //  const path1 = __dirname + '/cache/intro.png';
   // var down = (await axios.get("https://i.postimg.cc/FH7B0wvY/intronew.png", { responseType: "arraybuffer" })).data;
   // fs.writeFileSync(path1, Buffer.from(down, "utf-8"));
    senderInfo.data.altp = { level: 0, rd: -1 };
    senderInfo.data.helpaltp = { helpm: 1, helph: 1, helpb: 1 };
    await Users.setData(handleReaction.author, senderInfo);
    return api.sendMessage(`→ Đăng kí thành công, chào mừng bạn đến với chương trình Ai Là Triệu Phú!\n\nDùng "${prefix}altp play" để bắt đầu!`, event.threadID);
  }
  if (handleReaction.type == "stop") {
    api.unsendMessage(handleReaction.messageID);
    var level = senderInfo.data.altp.level;
    var name = await Users.getNameUser(handleReaction.author);
    Currencies.increaseMoney(handleReaction.author,equi(level));
    senderInfo.data.altp = { level: -1, rd: -1 };
    senderInfo.data.helpaltp = { helpm: 0, helph: 0, helpb: 0 };
    await Users.setData(handleReaction.author, senderInfo);
    return api.sendMessage({body: `→ Người chơi ${name} đã vượt qua ${level} câu hỏi, mang về phần thưởng là ${equi(level)}$\nHẹn gặp lại bạn ở chương trình lần sau!`, attachment: await makeWinner(handleReaction.author, level)}, event.threadID, () => fs.unlinkSync(path));
  }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

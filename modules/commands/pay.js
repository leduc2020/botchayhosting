module.exports.config = {
  name: "pay",
<<<<<<< HEAD
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Mirai Team, sửa bởi Grok",
  description: "Chuyển tiền cho người khác",
  commandCategory: "Tài Chính",
  usages: "pay <số tiền/all/10k/1m/0.5b> @tag",
  cooldowns: 5,
};

// Hàm định dạng tiền tệ kiểu Việt Nam
function formatCurrencyVietnamese(amount) {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
  } else if (amount >= 1000000) {
    return (amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' triệu';
  } else if (amount >= 1000) {
    return (amount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' nghìn';
  } else {
    return amount.toLocaleString('vi-VN');
  }
}

// Hàm xử lý số tiền (hỗ trợ 10k, 1m, 0.5b)
function parseCurrencyInput(input) {
  const cleanInput = input.toLowerCase();
  const kMatch = cleanInput.match(/^(\d+(\.\d+)?)[k]$/i);
  const mMatch = cleanInput.match(/^(\d+(\.\d+)?)[m]$/i);
  const bMatch = cleanInput.match(/^(\d+(\.\d+)?)[b]$/i);

  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000;
  } else if (mMatch) {
    return parseFloat(mMatch[1]) * 1000000;
  } else if (bMatch) {
    return parseFloat(bMatch[1]) * 1000000000;
  } else {
    return parseInt(cleanInput);
  }
}

module.exports.run = async ({ event, api, Currencies, args, Users }) => {
  let { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions)[0];
  const MIN_TRANSFER = 2000; // Số tiền tối thiểu để chuyển

  let coinsInput;
  let targetID;

  // Trường hợp reply tin nhắn
  if (!mention && event.messageReply) {
    targetID = event.messageReply.senderID;
    coinsInput = args[0]; // Số tiền là args[0] khi reply
  }
  // Trường hợp tag người dùng (pay <số tiền> @tag)
  else if (mention) {
    targetID = mention;
    coinsInput = args[0]; // Số tiền là args[0] khi tag
  }
  // Không có tag hoặc reply
  else {
    return api.sendMessage('Sai cú pháp! Dùng: pay <số tiền> @tag hoặc reply tin nhắn với pay <số tiền>', threadID, messageID);
  }

  // Xử lý số tiền
  let coins;
  if (coinsInput?.toLowerCase() === "all") {
    let balance = (await Currencies.getData(senderID)).money;
    if (balance < MIN_TRANSFER) {
      return api.sendMessage(
        `Bạn chỉ có ${formatCurrencyVietnamese(balance)}, không đủ để chuyển, tối thiểu là ${formatCurrencyVietnamese(MIN_TRANSFER)} VND!`,
        threadID,
        messageID
      );
    }
    coins = balance;
  } else {
    coins = parseCurrencyInput(coinsInput);
  }

  // Kiểm tra số tiền hợp lệ
  if (isNaN(coins) || coins <= 0) {
    return api.sendMessage(`Số tiền "${coinsInput}" không hợp lệ!`, threadID, messageID);
  }

  // Kiểm tra số tiền tối thiểu
  if (coins < MIN_TRANSFER) {
    return api.sendMessage(
      `Chuyển ít vậy sao nổi? Tối thiểu là ${formatCurrencyVietnamese(MIN_TRANSFER)} VND nha!`,
      threadID,
      messageID
    );
  }

  // Kiểm tra số dư
  let balance = (await Currencies.getData(senderID)).money;
  if (coins > balance) {
    return api.sendMessage(
      `Bạn muốn chuyển ${formatCurrencyVietnamese(coins)} VND nhưng chỉ có ${formatCurrencyVietnamese(balance)} VND!`,
      threadID,
      messageID
    );
  }

  // Lấy tên người nhận
  const namePay = await Users.getNameUser(targetID);
  if (!namePay) {
    return api.sendMessage("Không lấy được thông tin người nhận. Thử lại nha!", threadID, messageID);
  }

  // Chuyển tiền và gửi thông báo
  return api.sendMessage(
    { body: `Đã chuyển cho ${namePay} ${formatCurrencyVietnamese(coins)} VND` },
    threadID,
    async () => {
      await Currencies.increaseMoney(targetID, coins);
      await Currencies.decreaseMoney(senderID, coins);
    },
    messageID
  );
};
=======
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Mirai Team",
  description: "Chuyển tiền của bản thân cho ai đó",
  commandCategory: "Tiện ích",
  usages: "pay @tag coins",
  cooldowns: 5,
};

module.exports.run = async ({ event, api, Currencies, args, Users }) => {
  let { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions)[0];
  if (!mention && event.messageReply) {
    if (isNaN(args[0]) == true) return api.sendMessage(`Nội dung bạn nhập không phải là 1 con số hợp lệ!`, threadID, messageID);
    const coins = parseInt(args[0]);
    let balance = (await Currencies.getData(senderID)).money;
    const namePay = await Users.getNameUser(event.messageReply.senderID);
    if (coins > balance) return api.sendMessage(`Số coins bạn muốn chuyển lớn hơn số coins bạn hiện có!`, threadID, messageID);
    return api.sendMessage({ body: 'Đã chuyển cho ' + namePay + ` ${args[0]} coins` }, threadID, async () => {
      await Currencies.increaseMoney(event.messageReply.senderID, coins);
      Currencies.decreaseMoney(senderID, coins)
    }, messageID);
  }
  let name = event.mentions[mention].split(" ").length
  if (!mention || !event.messageReply) return api.sendMessage('Vui lòng tag hoặc reply tin nhắn của người muốn chuyển coins cho!', threadID, messageID);
  else {
    if (!isNaN(args[0 + name])) {
      const coins = parseInt(args[0 + name]);
      let balance = (await Currencies.getData(senderID)).money;
      if (event.type == "message_reply") { mention[0] = event.messageReply.senderID }
      if (coins <= 0) return api.sendMessage('Số coins bạn muốn chuyển không hợp lệ', threadID, messageID);
      if (coins > balance) return api.sendMessage('Số coins bạn muốn chuyển lớn hơn số coins bạn hiện có!', threadID, messageID);
      else {
        return api.sendMessage({ body: 'Đã chuyển cho ' + event.mentions[mention].replace(/@/g, "") + ` ${args[0 + name]} coins` }, threadID, async () => {
          await Currencies.increaseMoney(mention, coins);
          Currencies.decreaseMoney(senderID, coins)
        }, messageID);
      }
    } else return api.sendMessage('Vui lòng nhập số coins muốn chuyển', threadID, messageID);
  }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

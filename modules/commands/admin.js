<<<<<<< HEAD
﻿module.exports.config = {
	name: "admin",
	version: "1.0.5",
	hasPermssion: 0,
	credits: "Mirai Team & mod by DongDev",
	description: "Bật tắt chế độ chỉ qtv dùng lệnh",
	commandCategory: "Admin",
	usages: "Bật tắt chế độ chỉ admin và qtv dùng lệnh",
    cooldowns: 0,
    usePrefix: false,
    images: [],
=======
const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs-extra");
const { resolve } = require("path");

module.exports.config = {
    name: "admin",
    version: "1.0.6",
    hasPermssion: 1,
    credits: "Mirai Team - Modified by Satoru",
    description: "Quản lý và cấu hình ADMIN BOT",
    commandCategory: "Hệ thống",
    usages: "< add/remove | Super Admin & Admin > | < list/only/ibrieng >",
    cooldowns: 2,
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
<<<<<<< HEAD
      "vi": {
        "notHavePermssion": '⚠️ Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
        "addedNewAdmin": '[ ADD NEW ADMIN ]\n────────────────────\n📝 Thêm thành công %1 người dùng trở thành admin bot\n\n%2\n────────────────────\n[⏰] → Time: %3',
        "removedAdmin": '[ REMOVE ADMIN ]\n────────────────────\n📝 Gỡ thành công %1 người dùng trở lại làm thành viên\n\n%2\n────────────────────\n[⏰] → Time: %3'
    },
    "en": {
        "listAdmin": '[Admin] Admin list: \n\n%1',
        "notHavePermssion": '[Admin] You have no permission to use "%1"',
        "addedNewAdmin": '[Admin] Added %1 Admin :\n\n%2',
        "removedAdmin": '[Admin] Remove %1 Admin:\n\n%2'
    }
}
module.exports.onLoad = function() {
    const { writeFileSync, existsSync } = require('fs-extra');
    const { resolve } = require("path");
    const path = resolve(__dirname, 'data', 'dataAdbox.json');
    if (!existsSync(path)) {
        const obj = {
            adminbox: {}
        };
        writeFileSync(path, JSON.stringify(obj, null, 4));
    } else {
        const data = require(path);
        if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
        writeFileSync(path, JSON.stringify(data, null, 4));
     }
}
module.exports.run = async function ({ api, event, args, Users, permssion, getText, Currencies }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const moment = require("moment-timezone");
  const gio = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:ss");
  const nd = await Users.getNameUser(event.senderID);
  const { PREFIX } = global.config;
  const { threadID, messageID, mentions, senderID } = event;
  const { configPath } = global.client;
  const { throwError } = global.utils;

  async function streamURL(url, mime='jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`;
    const downloader = require('image-downloader');
    const fse = require('fs-extra');
    await downloader.image({
        url, dest
    });
    setTimeout(j => fse.unlinkSync(j), 60 * 1000, dest);
    return fse.createReadStream(dest);
  }

  const allowedUserIDs = global.config.NDH.map(id => id.toString());
  const senderIDStr = senderID.toString();
  const threadSetting = global.data.threadData.get(threadID) || {};
  const pref = threadSetting.PREFIX || PREFIX;
  const content = args.slice(1, args.length);
    if (args.length == 0) 
    return api.sendMessage(`[ ADMIN CONFIG SETTING ]\n──────────────────\n${pref}admin add: thêm người dùng làm admin\n${pref}admin remove: gỡ vai trò admin\n${pref}admin list: xem danh sách admin\n${pref}admin qtvonly: bật/tắt chế độ quản trị viên\n${pref}admin only: bật/tắt chế độ vô cực\n${pref}admin echo: bot sẽ trả về câu mà bạn nói\n${pref}admin fast: xem tốc độ mạng của bot\n${pref}admin create [tên mdl]: tạo file mới trong commands\n${pref}admin del [tên mdl]: xoá file trong commands\n${pref}admin rename [tên mdl] => [tên muốn đổi]: đổi tên file trong commands\n${pref}admin ping: xem tốc độ phản hồi của bot\n${pref}admin offbot: tắt bot\n${pref}admin reload [time]: reset hệ thống bot\n${pref}admin resetmoney: reset toàn bộ tiền trên hệ thống bot\n${pref}admin ship [tên mdl]: gửi 1 mdl cho thành viên trong nhóm\n──────────────────\n📝 HDSD: ${pref}admin + [text] lệnh cần dùng`, event.threadID, event.messageID);
    const { ADMINBOT } = global.config;
    const { NDH } = global.config;
    const { userName } = global.data;
    const { writeFileSync } = require("fs-extra");
    const mention = Object.keys(mentions);

    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);
switch (args[0]) {
        case "list": {
    var i = 1;
    var msg = [];
    const listAdmin = config.ADMINBOT || [];
    let count = 1;
    
    // Duyệt qua danh sách admin và tạo tin nhắn hiển thị
    for (const idAdmin of listAdmin) {
        if (parseInt(idAdmin)) {
            const name = (await Users.getData(idAdmin)).name;
            msg.push(`${count}. 👤: ${name}\n📎 Link: fb.com/${idAdmin}`);
            count++;
        }
    }

    // Gửi danh sách admin và thông báo phản hồi để xóa
    api.sendMessage(`[ Người Điều Hành Bot ]\n──────────────────\n👤 Name: ${global.config.ADMIN_NAME}\n📎 Facebook: ${global.config.FACEBOOK_ADMIN}\n📩 Admin Chicken project\n──────────────────\n\n[ ADMIN BOT ]\n──────────────────\n${msg.join("\n")}\n──────────────────\n👤 Người dùng: ${nd}\n⏰ Time: ${gio}\n\nHãy trả lời tin nhắn này với các số thứ tự để xóa ID admin tương ứng (VD: "1 2 3").`, event.threadID, (error, info) => {
        if (!error) {
            global.client.handleReply.push({
                name: "deleteAdmin",
                messageID: info.messageID,
                author: event.senderID,
                type: 'replyToDeleteAdmin',
                data: { listAdmin }
            });
        }
    });

    // Xử lý khi có tin nhắn trả lời để xóa admin
    api.listenMqtt((err, message) => {
        const replyData = global.client.handleReply.find(r => r.name === "deleteAdmin" && r.messageID === message.messageReply?.messageID);

        if (replyData && replyData.author === message.senderID) {
            const indices = message.body.split(" ").map(num => parseInt(num) - 1).filter(index => !isNaN(index) && index >= 0 && index < replyData.data.listAdmin.length);
            const idsToDelete = indices.map(index => replyData.data.listAdmin[index]);

            if (idsToDelete.length > 0) {
                // Xóa các ID admin từ danh sách
                idsToDelete.forEach(id => {
                    const index = replyData.data.listAdmin.indexOf(id);
                    if (index > -1) replyData.data.listAdmin.splice(index, 1);
                });

                api.sendMessage(`Đã xóa các admin với ID: ${idsToDelete.join(", ")}`, message.threadID, message.messageID);

                // Cập nhật danh sách admin trong config và lưu vào file cấu hình
                config.ADMINBOT = replyData.data.listAdmin;
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            } else {
                api.sendMessage("Không tìm thấy số thứ tự hợp lệ!", message.threadID, message.messageID);
            }
        }
    });

    break;
}
            case "add": { 
            if (event.senderID != 61554620715942) return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID)
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
            if(event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mention.length != 0 && isNaN(content[0])) {
                var listAdd = [];

                for (const id of mention) {
                    ADMINBOT.push(id);
                    config.ADMINBOT.push(id);
                    listAdd.push(`[👤] → Name: ${event.mentions[id]}\n[🔰] → Uid: ${id}`);
                };
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage({body: getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, ""), moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss")), attachment: await streamURL(`https://graph.facebook.com/${mention}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)},event.threadID)
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                ADMINBOT.push(content[0]);
                config.ADMINBOT.push(content[0]);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage({body: getText("addedNewAdmin", 1, `[👤] → Name: ${name}\n[🔰] → Uid: ${content[0]}`, moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss")),attachment: await streamURL(`https://graph.facebook.com/${content[0]}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)},event.threadID)
            }
            else return throwError(this.config.name, threadID, messageID);
        }
        case "removeAdmin":
        case "rm":
        case "delete": {
            if (event.senderID != 61554620715942) return api.sendMessage(`⚠️ Cần quyền Admin để thực hiện lệnh`, event.threadID, event.messageID)
            if (permssion != 3) return api.sendMessage(getText("notHavePermission", "removeAdmin", gio), threadID, messageID);
            if(event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mentions.length != 0 && isNaN(content[0])) {
                const mention = Object.keys(mentions);
                var listAdd = [];

                for (const id of mention) {
                    const index = config.ADMINBOT.findIndex(item => item == id);
                    ADMINBOT.splice(index, 1);
                    config.ADMINBOT.splice(index, 1);
                    listAdd.push(`[👤] → Name: ${event.mentions[id]}\n[🔰] → Uid: ${id}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", mention.length, listAdd.join("\n").replace(/\@/g, ""), moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.ADMINBOT.findIndex(item => item.toString() == content[0]);
                ADMINBOT.splice(index, 1);
                config.ADMINBOT.splice(index, 1);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", 1, `[👤] → Name: ${name}\n[🔰] → Uid: ${content[0]}`, moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss")), threadID, messageID);
            }
            else throwError(this.config.name, threadID, messageID);
                                               }
        case 'qtvonly': {
            const { resolve } = require("path");
            const pathData = resolve(__dirname, 'data', 'dataAdbox.json');
            const database = require(pathData);
            const { adminbox } = database;
            if (permssion < 1) return api.sendMessage("⚠️ Cần quyền Quản trị viên trở lên để thực hiện lệnh", threadID, messageID);
            if (adminbox[threadID] == true) {
                adminbox[threadID] = false;
                api.sendMessage("☑️ Tắt thành công chế độ quản trị viên, tất cả thành viên có thể sử dụng bot", threadID, messageID);
            } else {
                adminbox[threadID] = true;
                api.sendMessage("☑️ Kích hoạt chế độ quản trị viên, chỉ quản trị viên nhóm mới có thể sử dụng bot", threadID, messageID);
            }
            writeFileSync(pathData, JSON.stringify(database, null, 4));
            break;
        }
        case 'only':
        case '-o': {
            //---> CODE ADMIN ONLY<---//
            if (permssion != 3) return api.sendMessage("⚠️ Bạn không phải admin chính", threadID, messageID);
            if (config.adminOnly == false) {
                config.adminOnly = true;
                api.sendMessage(`☑️ Kích hoạt chế độ vô cực, chỉ Admin được sử dụng bot`, threadID, messageID);
            } else {
                config.adminOnly = false;
                api.sendMessage(`☑️ Tắt chế độ vô cực, tất cả thành viên có thể sử dụng bot`, threadID, messageID);
            }
            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            break;
        }
  case 'echo': {
      const input = args.join(" ");
      const spaceIndex = input.indexOf(' ');

      if (spaceIndex !== -1) {
        const textAfterFirstWord = input.substring(spaceIndex + 1).trim();
        return api.sendMessage(textAfterFirstWord, event.threadID);
      }
      break;
    }
  case 'fast': {
      try {
        const fast = require("fast-speedtest-api");
        const speedTest = new fast({
          token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
          verbose: false,
          timeout: 10000,
          https: true,
          urlCount: 5,
          bufferSize: 8,
          unit: fast.UNITS.Mbps
        });
        const result = await speedTest.getSpeed();
        return api.sendMessage(`🚀 Speed Test: ${result} Mbps`, event.threadID, event.messageID);
      } catch (error) {
        return api.sendMessage("⚠️ Không thể đo tốc độ ngay lúc này, hãy thử lại sau!", event.threadID, event.messageID);
      }
      break;
    }
 case 'create': {
      if (!allowedUserIDs.includes(senderIDStr)) {
        return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID);
      }

      if (args.slice(1).length === 0) return api.sendMessage("⚠️ Vui lòng đặt tên cho file của bạn", event.threadID);

      const commandName = args.slice(1).join(' ');
      const filePath = `${__dirname}/${commandName}.js`;

      if (fs.existsSync(filePath)) {
        return api.sendMessage(`⚠️ File ${commandName}.js đã tồn tại từ trước`, event.threadID, event.messageID);
      }

      fs.copySync(`${__dirname}/example.js`, filePath);
      return api.sendMessage(`☑️ Đã tạo thành công file "${commandName}.js"`, event.threadID, event.messageID);
      break;
    }
 case 'del': {
    if (!allowedUserIDs.includes(senderIDStr)) {
        return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID);
      }
    const commandName = args.slice(1).join(' ');
    if (!commandName) return api.sendMessage(`⚠️ Vui lòng cung cấp tên lệnh cần xoá`, event.threadID, event.messageID);
    
    fs.unlink(`${__dirname}/${commandName}.js`, (err) => {
        if (err) return api.sendMessage(`❎ Xoá file ${commandName}.js thất bại: ${err.message}`, event.threadID, event.messageID);
        return api.sendMessage(`☑️ Đã xoá file ${commandName}.js thành công`, event.threadID, event.messageID);
    });
    break;
}
   case 'rename': {
    if (!allowedUserIDs.includes(senderIDStr)) {
        return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID);
      }
    const renameArgs = args.slice(1).join(' ').split('=>');
    
    if (renameArgs.length !== 2) {
        return api.sendMessage(`⚠️ Vui lòng nhập đúng định dạng [tên mdl] => [tên muốn đổi]`, event.threadID, event.messageID);
    }

    const oldName = renameArgs[0].trim();
    const newName = renameArgs[1].trim();

    fs.rename(`${__dirname}/${oldName}.js`, `${__dirname}/${newName}.js`, function (err) {
        if (err) throw err;
        return api.sendMessage(
            `☑️ Đã đổi tên file ${oldName}.js thành ${newName}.js`,
            event.threadID,
            event.messageID
        );
    });
    break;
   }
 case 'ping': {
  const timeStart = Date.now();
  const pingrs = Date.now() - timeStart;
      api.sendMessage(`📶 Ping phản hồi: ${pingrs} ms`, event.threadID, event.messageID);
      break;
}
  case 'offbot': {
    if (!allowedUserIDs.includes(senderIDStr)) {
        return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID);
      }
    api.sendMessage("☠️ Pái pai", event.threadID, () => process.exit(0))
    break;
  }
  case 'reload': {
  if (!allowedUserIDs.includes(senderIDStr)) {
        return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID);
      }

  const { commands } = global.client;
  const pidusage = await global.nodemodule["pidusage"](process.pid);
  const os = require("os");
  const cpus = os.cpus();
  let chips, speed;

  for (const cpu of cpus) {
    chips = cpu.model;
    speed = cpu.speed;
  }

  const timeStart = Date.now();
  const { threadID, messageID } = event;
  const time = args.join(" ");
  let rstime = "68";

  if (time) {
    rstime = time;
  }

  api.sendMessage(`[ RELOAD SYSTEM ]\n──────────────────\n[⚙️] → Bot sẽ tiến hành reset sau ${rstime} giây nữa\n[⏰] → Time: ${gio}\n[📊] → Tốc độ xử lý: ${speed}MHz\n[↪️] → Số luồng CPU: ${os.cpus().length}\n[📶] → Độ trễ: ${Date.now() - timeStart}ms`, event.threadID, event.messageID);

  setTimeout(() => { 
    api.sendMessage("[💨] → Bot Tiến Hành Reset Hệ Thống!", event.threadID, () => process.exit(1));
  }, rstime * 1000);

  break;
}
  case "resetmoney": {
    if (!allowedUserIDs.includes(senderIDStr)) {
        return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID);
      }

    const mentionID = Object.keys(event.mentions);
    const message = [];
    const error = [];

    const resetMoneyForUser = async (userID) => {
        try {
            await Currencies.setData(userID, { money: 0 });
            message.push(userID);
        } catch (e) {
            error.push(e);
        }
    };

    const allUserData = await Currencies.getAll(['userID']);

    for (const userData of allUserData) {
        await resetMoneyForUser(userData.userID);
    }

    api.sendMessage(`✅ Đã xóa toàn bộ dữ liệu tiền của ${message.length} người`, event.threadID, async () => {
        if (error.length !== 0) {
            await api.sendMessage(`❎ Không thể xóa dữ liệu tiền của ${error.length} người`, event.threadID);
        }
    }, event.messageID);

    for (const singleID of mentionID) {
        await resetMoneyForUser(singleID);
    }

    api.sendMessage(`✅ Đã xóa dữ liệu tiền của ${message.length} người`, event.threadID, async () => {
        if (error.length !== 0) {
            await api.sendMessage(`❎ Không thể xóa dữ liệu tiền của ${error.length} người`, event.threadID);
        }
    }, event.messageID);

    break;
}
  
case 'ship': {
  if (!allowedUserIDs.includes(senderIDStr)) {
    return api.sendMessage(`⚠️ Cần quyền admin chính để thực hiện lệnh`, event.threadID, event.messageID);
  }

  const { messageReply, type } = event;

  let name = args[1];
  const commandName = args.slice(1).join(' ');

  let text, uid;
  if (type === "message_reply") {
    text = messageReply.body;
    uid = messageReply.senderID;
  } else {
    uid = event.senderID;
  }

  if (!text && !name) {
    return api.sendMessage(`[⏰] → Bây giờ là: ${gio}\n[📝] → Hãy reply hoặc tag người muốn share`, event.threadID, event.messageID);
  }

  fs.readFile(`./modules/commands/${commandName}.js`, "utf-8", async (err, data) => {
    if (err) {
      return api.sendMessage(`[⏰] → Bây giờ là: ${gio}\n[🔎] → Rất tiếc mdl ${commandName} mà bạn cần hiện không có trên hệ thống của bot ${global.config.BOTNAME}`, event.threadID, event.messageID);
    }

    const response = await axios.post("https://api.mocky.io/api/mock", {
      "status": 200,
      "content": data,
      "content_type": "application/json",
      "charset": "UTF-8",
      "secret": "PhamMinhDong",
      "expiration": "never"
    });
    
    const link = response.data.link;
    const use = await Users.getNameUser(uid);
    api.sendMessage(`[📜] → Nhóm: ${global.data.threadInfo.get(event.threadID).threadName}\n[⏰] → Vào lúc: ${gio}\n[💼] → Tên lệnh: ${commandName}\n[👤] → Admin: ${nd}\n[📌] → Đã gửi module ☑️\n[📝] → ${use} vui lòng check tin nhắn chờ hoặc spam để nhận module`, event.threadID, event.messageID);
    api.sendMessage(`[⏰] → Vào lúc: ${gio}\n[🔗] → Link: ${link}\n[🔰] → Tên lệnh: ${commandName}\n[📜] → Nhóm: ${global.data.threadInfo.get(event.threadID).threadName}\n[🔎] → Bạn được admin share riêng một module`, uid);
  });

  break;
}
   default: {
  return throwError(this.config.name, threadID, messageID);
        }
    }
}
=======
    "vi": {
        "listAdmin": `=== [ DANH SÁCH ADMIN & NGƯỜI HỖ TRỢ ] ===\n━━━━━━━━━━━━━━━━━━\n=== [ ADMIN BOT ] ===\n%1\n\n=== [ NGƯỜI HỖ TRỢ ] ===\n%2\n\nReply số thứ tự để xóa đối tượng tương ứng.`,
        "notHavePermssion": '[ ADMIN ] → Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
        "addedSuccess": '[ ADMIN ] → Đã thêm %1 người dùng trở thành %2:\n\n%3',
        "removedSuccess": '[ ADMIN ] → Đã gỡ vai trò %1 của %2 người dùng:\n\n%3',
        "removedByIndex": '[ ADMIN ] → Đã gỡ thành công %1:\n%2',
        "invalidIndex": '[ ADMIN ] → Số thứ tự không hợp lệ!'
    }
};

module.exports.onLoad = function() {
    const pathData = resolve(__dirname, 'data', 'dataAdbox.json');
    if (!existsSync(pathData)) {
        const obj = {
            adminOnly: {},
            adminbox: {},
            only: {},
            privateChat: {}
        };
        writeFileSync(pathData, JSON.stringify(obj, null, 4));
    }
};

module.exports.handleReply = async function({ api, event, handleReply, getText, Users }) {
    if (event.senderID != handleReply.author) return;
    const { threadID, messageID, body } = event;
    const { configPath } = global.client;
    const config = require(configPath);
    
    const index = parseInt(body);
    if (isNaN(index)) return api.sendMessage(getText("invalidIndex"), threadID, messageID);
    
    let targetArray, targetIndex, roleText;
    const adminLength = config.ADMINBOT.length;
    
    if (index <= adminLength) {
        targetArray = config.ADMINBOT;
        targetIndex = index - 1;
        roleText = "ADMIN BOT";
    } else {
        targetArray = config.NDH;
        targetIndex = index - adminLength - 1;
        roleText = "NGƯỜI HỖ TRỢ";
    }
    
    if (targetIndex < 0 || targetIndex >= targetArray.length) {
        return api.sendMessage(getText("invalidIndex"), threadID, messageID);
    }
    
    const removedUID = targetArray[targetIndex];
    const name = await Users.getNameUser(removedUID);
    
    targetArray.splice(targetIndex, 1);
    if (roleText === "ADMIN BOT") {
        global.config.ADMINBOT.splice(global.config.ADMINBOT.indexOf(removedUID), 1);
    } else {
        global.config.NDH.splice(global.config.NDH.indexOf(removedUID), 1);
    }
    
    writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
    
    return api.sendMessage(
        getText("removedByIndex", roleText, `${removedUID} - ${name}`),
        threadID,
        messageID
    );
};

module.exports.run = async function({ api, event, args, Users, permssion, getText }) {
    const { threadID, messageID, mentions, senderID } = event;
    const { configPath } = global.client;
    const config = require(configPath);
    const mention = Object.keys(mentions);
    
    if (!args[0]) {
        return api.sendMessage(
            `=== [ ADMIN PANEL ] ===\n━━━━━━━━━━━━━━━━━━\n\n` +
            `→ admin list: Xem danh sách quản lý\n` +
            `→ admin add: Thêm quản trị viên\n` +
            `→ admin remove: Gỡ quản trị viên\n` +
            `→ admin addndh: Thêm người hỗ trợ\n` +
            `→ admin removendh: Gỡ người hỗ trợ\n` +
            `→ admin qtvonly: Bật/tắt chế độ QTV\n` +
            `→ admin only: Bật/tắt chế độ Admin\n` +
            `→ admin ibrieng: Bật/tắt chat riêng\n\n` +
            `━━━━━━━━━━━━━━━━━━`,
            threadID, messageID
        );
    }

    const getUids = async (type) => {
        let uids = [];
        if (event.type === "message_reply") {
            uids.push(event.messageReply.senderID);
        } else if (mention.length > 0) {
            uids = mention;
        } else if (args[1] && !isNaN(args[1])) {
            uids.push(args[1]);
        }
        return uids;
    };

    const addUsers = async (uids, type) => {
        const added = [];
        for (const uid of uids) {
            const name = global.data.userName.get(uid) || await Users.getNameUser(uid);
            if (type === "ADMIN" && !config.ADMINBOT.includes(uid)) {
                config.ADMINBOT.push(uid);
                global.config.ADMINBOT.push(uid);
                added.push(`${uid} - ${name}`);
            } else if (type === "NDH" && !config.NDH.includes(uid)) {
                config.NDH.push(uid);
                global.config.NDH.push(uid);
                added.push(`${uid} - ${name}`);
            }
        }
        return added;
    };

    const removeUsers = async (uids, type) => {
        const removed = [];
        for (const uid of uids) {
            const name = global.data.userName.get(uid) || await Users.getNameUser(uid);
            if (type === "ADMIN") {
                const index = config.ADMINBOT.indexOf(uid);
                if (index !== -1) {
                    config.ADMINBOT.splice(index, 1);
                    global.config.ADMINBOT.splice(global.config.ADMINBOT.indexOf(uid), 1);
                    removed.push(`${uid} - ${name}`);
                }
            } else if (type === "NDH") {
                const index = config.NDH.indexOf(uid);
                if (index !== -1) {
                    config.NDH.splice(index, 1);
                    global.config.NDH.splice(global.config.NDH.indexOf(uid), 1);
                    removed.push(`${uid} - ${name}`);
                }
            }
        }
        return removed;
    };

    switch (args[0]) {
        case "list": {
            if (permssion < 2) return api.sendMessage(getText("notHavePermssion", "list"), threadID, messageID);
            
            let adminList = [], ndhList = [];
            let count = 1;
            
            for (const id of config.ADMINBOT) {
                const name = global.data.userName.get(id) || await Users.getNameUser(id);
                adminList.push(`${count++}. ${name}\n→ ID: ${id}`);
            }
            
            for (const id of config.NDH) {
                const name = global.data.userName.get(id) || await Users.getNameUser(id);
                ndhList.push(`${count++}. ${name}\n→ ID: ${id}`);
            }

            return api.sendMessage(
                getText("listAdmin", adminList.join("\n\n"), ndhList.join("\n\n")),
                threadID,
                (error, info) => {
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: senderID
                    });
                },
                messageID
            );
        }

        case "add": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
            const uids = await getUids("ADMIN");
            const added = await addUsers(uids, "ADMIN");
            if (added.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedSuccess", added.length, "ADMIN BOT", added.join("\n")), threadID, messageID);
            }
            break;
        }

        case "addndh": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "addndh"), threadID, messageID);
            const uids = await getUids("NDH");
            const added = await addUsers(uids, "NDH");
            if (added.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedSuccess", added.length, "NGƯỜI HỖ TRỢ", added.join("\n")), threadID, messageID);
            }
            break;
        }

        case "remove": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "remove"), threadID, messageID);
            const uids = await getUids("ADMIN");
            const removed = await removeUsers(uids, "ADMIN");
            if (removed.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedSuccess", "ADMIN BOT", removed.length, removed.join("\n")), threadID, messageID);
            }
            break;
        }

        case "removendh": {
            if (permssion !== 3) return api.sendMessage(getText("notHavePermssion", "removendh"), threadID, messageID);
            const uids = await getUids("NDH");
            const removed = await removeUsers(uids, "NDH");
            if (removed.length > 0) {
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedSuccess", "NGƯỜI HỖ TRỢ", removed.length, removed.join("\n")), threadID, messageID);
            }
            break;
        }

        case "qtvonly": {
            const pathData = resolve(__dirname, 'data', 'dataAdbox.json');
            const database = require(pathData);
            if (permssion < 1) return api.sendMessage("[ ADMIN ] → Cần quyền Quản trị viên trở lên", threadID, messageID);
            
            database.adminbox[threadID] = !database.adminbox[threadID];
            writeFileSync(pathData, JSON.stringify(database, null, 4));
            
            return api.sendMessage(
                `[ ADMIN ] → ${database.adminbox[threadID] ? 
                    "Bật chế độ QTV Only thành công" : 
                    "Tắt chế độ QTV Only thành công"}`,
                threadID, messageID
            );
        }

        case "only": {
            const pathData = resolve(__dirname, 'data', 'dataAdbox.json');
            const database = require(pathData);
            if (permssion < 2) return api.sendMessage("[ ADMIN ] → Cần quyền ADMIN trở lên", threadID, messageID);
            
            database.only[threadID] = !database.only[threadID];
            writeFileSync(pathData, JSON.stringify(database, null, 4));
            
            return api.sendMessage(
                `[ ADMIN ] → ${database.only[threadID] ? 
                    "Bật chế độ Admin Only thành công" : 
                    "Tắt chế độ Admin Only thành công"}`,
                threadID, messageID
            );
        }

        case "ibrieng": {
            const pathData = resolve(__dirname, 'data', 'dataAdbox.json');
            const database = require(pathData);
            if (permssion !== 3) return api.sendMessage("[ ADMIN ] → Cần quyền ADMIN để thực hiện", threadID, messageID);
            
            database.privateChat[threadID] = !database.privateChat[threadID];
            writeFileSync(pathData, JSON.stringify(database, null, 4));
            
            return api.sendMessage(
                `[ ADMIN ] → ${database.privateChat[threadID] ? 
                    "Bật chế độ chat riêng thành công" : 
                    "Tắt chế độ chat riêng thành công"}`,
                threadID, messageID
            );
        }

        default: {
            return api.sendMessage("[ ADMIN ] → Lệnh không hợp lệ! Gõ 'admin' để xem hướng dẫn", threadID, messageID);
        }
    }
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

<<<<<<< HEAD
const moment = require("moment-timezone");

module.exports.config = {
  name: 'help',
  version: '1.0.2',
  hasPermssion: 0,
  credits: 'YourName',
  description: 'Xem danh sách lệnh và thông tin chi tiết',
  commandCategory: 'Tiện ích',
  usages: '',
  cooldowns: 5,
  usePrefix: false,
  images: [],
  envConfig: {
    autoUnsend: {
      status: true,
      timeOut: 300
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { sendMessage: send, unsendMessage: un } = api;
  const { threadID: tid, messageID: mid, senderID: sid } = event;

  // Kiểm tra global.client.commands
  if (!global.client || !global.client.commands) {
    return send('⚠️ Hệ thống bot chưa được khởi tạo đúng cách!', tid, mid);
  }

  const cmds = global.client.commands;
  const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");

  if (args.length === 0) {
    const data = commandsGroup();
    if (data.length === 0) {
      return send('⚠️ Không tìm thấy lệnh nào trong hệ thống!', tid, mid);
    }

    let txt = '〘 Danh sách lệnh hiện có 〙\n──────────────\n';
    let count = 0;
    for (const { commandCategory, commandsName } of data) {
      txt += `〘 ${++count} 〙${commandCategory} ┃ ${commandsName.length} lệnh\n`;
    }
    txt += '──────────────\nReply tin nhắn theo số để xem lệnh\n──────────────';
    return send({ body: txt }, tid, (a, b) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: b.messageID,
        author: sid,
        case: 'infoGr',
        data
      });
      if (this.config.envConfig.autoUnsend.status) {
        setTimeout(v1 => un(v1), 1000 * this.config.envConfig.autoUnsend.timeOut, b.messageID);
      }
    }, mid);
  } else {
    return send('⚠️ Vui lòng chỉ sử dụng lệnh "menu" mà không có tham số!', tid, mid);
  }
};

module.exports.handleReply = async function ({ handleReply: $, api, event }) {
  const { sendMessage: send, unsendMessage: un } = api;
  const { threadID: tid, messageID: mid, senderID: sid, args } = event;

  if (sid !== $.author) {
    return send('⛔ Vui lòng không reply tin nhắn của người khác!', tid, mid);
  }

  switch ($.case) {
    case 'infoGr': {
      const data = $.data[(+args[0]) - 1];
      if (!data) {
        return send(`❎ "${args[0]}" không nằm trong số thứ tự menu`, tid, mid);
      }

      un($.messageID);
      let txt = `〘 ${data.commandCategory} 〙\n──────────────\n`;
      let count = 0;
      for (const name of data.commandsName) {
        const cmdInfo = global.client.commands.get(name)?.config;
        if (!cmdInfo) continue; // Bỏ qua nếu lệnh không có config
        txt += `〘 ${++count} 〙${name} : ${cmdInfo.description || 'Không có mô tả'}\n`;
      }
      txt += '──────────────\nReply tin nhắn theo số để xem';
      return send({ body: txt }, tid, (a, b) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: b.messageID,
          author: sid,
          case: 'infoCmds',
          data: data.commandsName
        });
        if (this.config.envConfig.autoUnsend.status) {
          setTimeout(v1 => un(v1), 1000 * this.config.envConfig.autoUnsend.timeOut, b.messageID);
        }
      });
    }
    case 'infoCmds': {
      const data = global.client.commands.get($.data[(+args[0]) - 1]);
      if (!data || !data.config) {
        return send(`⚠️ "${args[0]}" không nằm trong số thứ tự menu hoặc lệnh không tồn tại`, tid, mid);
      }

      const { config } = data;
      un($.messageID);
      const txt = `〘 ${config.commandCategory} 〙\n──────────────\nTên lệnh: ${config.name}\nMô tả: ${config.description || 'Không có mô tả'}\nQuyền hạn: ${premssionTxt(config.hasPermssion)}`;
      return send(txt, tid, mid);
    }
    default:
      return send('❎ Lựa chọn không hợp lệ!', tid, mid);
  }
};

function commandsGroup() {
  const array = [];
  if (!global.client.commands) return array;

  const cmds = global.client.commands.values();
  for (const cmd of cmds) {
    if (!cmd.config || !cmd.config.name || !cmd.config.commandCategory) continue;
    const { name, commandCategory } = cmd.config;
    const find = array.find(i => i.commandCategory === commandCategory);
    if (!find) array.push({ commandCategory, commandsName: [name] });
    else find.commandsName.push(name);
  }
  array.sort((a, b) => b.commandsName.length - a.commandsName.length);
  return array;
}

function premssionTxt(a) {
  return a === 0 ? 'Thành viên' : a === 1 ? 'Quản trị viên nhóm' : a === 2 ? 'ADMINBOT' : 'Người điều hành bot';
=======
this.config = {
    name: "help",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "DC-Nam mod by Niio-team",
    description: "Xem danh sách lệnh và info",
    commandCategory: "Nhóm",
    usages: "[tên lệnh/all]",
    cooldowns: 0
};
this.languages = {
    "vi": {},
    "en": {}
}
this.run = async function({
    api,
    event,
    args
}) {
    const {
        threadID: tid,
        messageID: mid,
        senderID: sid
    } = event;
    const axios = global.nodemodule['axios'];
    var type = !args[0] ? "" : args[0].toLowerCase();
    var msg = "";
    const cmds = global.client.commands;
    const TIDdata = global.data.threadData.get(tid) || {};
    const moment = require("moment-timezone");
    var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
    if (thu == 'Sunday') thu = 'Chủ Nhật';
    if (thu == 'Monday') thu = 'Thứ Hai';
    if (thu == 'Tuesday') thu = 'Thứ Ba';
    if (thu == 'Wednesday') thu = 'Thứ Tư';
    if (thu == "Thursday") thu = 'Thứ Năm';
    if (thu == 'Friday') thu = 'Thứ Sáu';
    if (thu == 'Saturday') thu = 'Thứ Bảy';
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:s | DD/MM/YYYY");
    const hours = moment.tz("Asia/Ho_Chi_Minh").format("HH");
    const admin = config.ADMINBOT;
    const NameBot = config.BOTNAME;
    const version = config.version;
    var prefix = TIDdata.PREFIX || global.config.PREFIX;
    if (type == "all") {
        const commandsList = Array.from(cmds.values()).map((cmd, index) => {
            return `${index + 1}. ${cmd.config.name}\n📝 Mô tả: ${cmd.config.description}\n\n`;
        }).join('');
        return api.sendMessage(commandsList, tid, mid);
    }

    if (type) {
        const command = Array.from(cmds.values()).find(cmd => cmd.config.name.toLowerCase() === type);
        if (!command) {
            const stringSimilarity = require('string-similarity');
            const commandName = args.shift().toLowerCase() || "";
            const commandValues = cmds['keys']();
            const checker = stringSimilarity.findBestMatch(commandName, commandValues);
            if (checker.bestMatch.rating >= 0.5) command = client.commands.get(checker.bestMatch.target);
            msg = `⚠️ Không tìm thấy lệnh '${type}' trong hệ thống.\n📌 Lệnh gần giống được tìm thấy '${checker.bestMatch.target}'`;
            return api.sendMessage(msg, tid, mid);
        }
        const cmd = command.config;
        msg = `[ HƯỚNG DẪN SỬ DỤNG ]\n\n📜 Tên lệnh: ${cmd.name}\n🕹️ Phiên bản: ${cmd.version}\n🔑 Quyền Hạn: ${TextPr(cmd.hasPermssion)}\n📝 Mô Tả: ${cmd.description}\n🏘️ Nhóm: ${cmd.commandCategory}\n📌 Cách Dùng: ${cmd.usages}\n⏳ Cooldowns: ${cmd.cooldowns}s`;
        return api.sendMessage(msg, tid, mid);
    } else {
        const commandsArray = Array.from(cmds.values()).map(cmd => cmd.config);
        const array = [];
        commandsArray.forEach(cmd => {
            const { commandCategory, name: nameModule } = cmd;
            const find = array.find(i => i.cmdCategory == commandCategory);
            if (!find) {
                array.push({
                    cmdCategory: commandCategory,
                    nameModule: [nameModule]
                });
            } else {
                find.nameModule.push(nameModule);
            }
        });
        array.sort(S("nameModule"));
        array.forEach(cmd => {
 if (cmd.cmdCategory.toUpperCase() === 'ADMIN' && !global.config.ADMINBOT.includes(sid)) return
            msg += `[ ${cmd.cmdCategory.toUpperCase()} ]\n📝 Tổng lệnh: ${cmd.nameModule.length} lệnh\n${cmd.nameModule.join(", ")}\n\n`;
        });
        msg += `📝 Tổng số lệnh: ${cmds.size} lệnh\n👤 Tổng số admin bot: ${admin.length}\n👾 Tên Bot: ${NameBot}\n🕹️ Phiên bản: ${version}\n⏰ Hôm nay là: ${thu}\n⏱️ Thời gian: ${time}\n${prefix}help + tên lệnh để xem chi tiết\n${prefix}help + all để xem tất cả lệnh`;
        return api.sendMessage(msg, tid, mid);
    }
}
function S(k) {
    return function(a, b) {
        let i = 0;
        if (a[k].length > b[k].length) {
            i = 1;
        } else if (a[k].length < b[k].length) {
            i = -1;
        }
        return i * -1;
    }
}
function TextPr(permission) {
    p = permission;
    return p == 0 ? "Thành Viên" : p == 1 ? "Quản Trị Viên" : p = 2 ? "Admin Bot" : "Toàn Quyền";
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
}
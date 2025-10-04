<<<<<<< HEAD
const fs = require("fs-extra");
const path = __dirname + '/tt/';
const configPath = __dirname + '/tt-config.json';
const moment = require('moment-timezone');
const axios = require("axios");
const downloader = require('image-downloader');

async function streamURL(url, mime = 'jpg') {
  const dest = `${__dirname}/cache/${Date.now()}.${mime}`;
  try { console.log('[check] streamURL start', { url, dest }); } catch {}
  try {
    await downloader.image({ url, dest });
    try { console.log('[check] streamURL download success', { dest }); } catch {}
  } catch (err) {
    try { console.error('[check] streamURL download error', { url, dest, error: err && err.message ? err.message : err }); } catch {}
    throw err;
  }
  setTimeout(() => fs.unlinkSync(dest), 60 * 1000);
  return fs.createReadStream(dest);
}

module.exports.config = {
  name: "check",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "PTT & Modified by Grok (Fix map error)",
  description: "Check tương tác + lọc, reset, auto lọc tuần",
  commandCategory: "Tiện ích",
  usages: "[all/week/day/reset/loc <số>/auto-loc <số>]",
  cooldowns: 0,
  dependencies: {
    "fs-extra": "",
    "moment-timezone": "",
    "axios": "",
    "image-downloader": ""
  }
};

function ensureDataStructure(data, today) {
  if (!Array.isArray(data.day)) data.day = [];
  if (!Array.isArray(data.week)) data.week = [];
  if (!Array.isArray(data.total)) data.total = [];
  if (typeof data.time !== 'number') data.time = today;
  return data;
}

module.exports.onLoad = () => {
  if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
  if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}, null, 4));
  global.checkttConfig = JSON.parse(fs.readFileSync(configPath));

  setInterval(() => {
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    const files = fs.readdirSync(path);
    files.forEach(file => {
      try {
        let data = JSON.parse(fs.readFileSync(path + file));
        data = ensureDataStructure(data, today);

        if (data.time !== today) {
          data.day = data.day.map(u => ({ ...u, count: 0 }));
          data.time = today;
          fs.writeFileSync(path + file, JSON.stringify(data, null, 4));
        }

        const threadID = file.replace('.json', '');
        const threshold = global.checkttConfig[threadID];
        if (today === 1 && threshold !== undefined) {
          const toRemove = data.total.filter(u => u.count <= threshold && u.id != global.data.botID);
          let removed = toRemove.length;
          data.total = data.total.filter(u => u.count > threshold || u.id == global.data.botID);
          fs.writeFileSync(path + file, JSON.stringify(data, null, 4));
          if (removed > 0) {
            global.api.sendMessage(`🔔 Auto lọc: Đã loại bỏ ${removed} thành viên có số tin nhắn dưới ${threshold}`, threadID);
          }
        }
      } catch (err) {
        console.error(`Lỗi khi xử lý file ${file}:`, err);
      }
    });
  }, 60000);
};

module.exports.handleEvent = async function({ api, event }) {
  try {
    if (!event.isGroup || global.client.sending_top) return;
    const { threadID, senderID, participantIDs } = event;
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    const filePath = path + threadID + '.json';
    let data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : { total: [], week: [], day: [], time: today };
    data = ensureDataStructure(data, today);

    const userList = participantIDs || [];
    userList.forEach(user => {
      ['total', 'week', 'day'].forEach(type => {
        if (!data[type].some(e => e.id == user)) data[type].push({ id: user, count: 0 });
      });
    });

    if (data.time !== today) {
      global.client.sending_top = true;
      setTimeout(() => global.client.sending_top = false, 300000);
    }

    ['total', 'week', 'day'].forEach(type => {
      const index = data[type].findIndex(e => e.id == senderID);
      if (index > -1) data[type][index].count++;
    });

    const activeIDs = userList.map(String);
    ['total', 'week', 'day'].forEach(type => {
      data[type] = data[type].filter(e => activeIDs.includes(String(e.id)));
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  } catch (err) {
    console.error(`Lỗi khi xử lý sự kiện tương tác:`, err);
  }
};

module.exports.run = async function({ api, event, args, Users, Threads }) {
  const { threadID, senderID } = event;
  const filePath = path + threadID + '.json';
  if (!fs.existsSync(filePath)) return api.sendMessage("⚠️ Chưa có dữ liệu", threadID);
  let data = JSON.parse(fs.readFileSync(filePath));
  const query = args[0] ? args[0].toLowerCase() : '';
  let targetID = senderID;
  if (event.type === 'message_reply') {
    targetID = event.messageReply.senderID;
  } else if (event.mentions && Object.keys(event.mentions).length > 0) {
    targetID = Object.keys(event.mentions)[0];
  }

  if (query === 'reset') {
    const threadInfo = await Threads.getData(threadID).then(data => data.threadInfo);
    if (!threadInfo.adminIDs.some(item => item.id == senderID))
      return api.sendMessage('❎️ Bạn không đủ quyền để reset dữ liệu!', threadID);
    fs.unlinkSync(filePath);
    return api.sendMessage('✅ Đã reset dữ liệu tương tác của nhóm!', threadID);
  }

  if (query === 'lọc' || query === 'loc') {
    if (!args[1] || isNaN(args[1]))
      return api.sendMessage('⚠️ Vui lòng nhập số tin nhắn.\nVí dụ: check lọc 10', threadID);
    const threshold = parseInt(args[1]);
    if (threshold < 0 || threshold > 10000)
      return api.sendMessage('⚠️ Ngưỡng phải là số dương và hợp lý!', threadID);
    const threadInfo = await Threads.getData(threadID).then(data => data.threadInfo);
    if (!threadInfo.adminIDs.some(item => item.id == senderID))
      return api.sendMessage('❎️ Bạn không đủ quyền để lọc thành viên!', threadID);
    if (!threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID()))
      return api.sendMessage('⚠️ Bot cần quyền quản trị viên!', threadID);
    const toRemove = data.total.filter(u => u.count <= threshold && u.id != api.getCurrentUserID());
    let removed = 0;
    for (const user of toRemove) {
      try {
        await api.removeUserFromGroup(user.id, threadID);
        removed++;
      } catch {}
    }
    return api.sendMessage(`✅ Đã lọc ${removed} thành viên có số tin nhắn dưới ${threshold}`, threadID);
  }

  if (query === 'autoloc' || query === 'auto-loc') {
    const threadInfo = await Threads.getData(threadID).then(data => data.threadInfo);
    if (!threadInfo.adminIDs.some(item => item.id == senderID))
      return api.sendMessage('❎ Bạn không đủ quyền để thiết lập auto lọc!', threadID);
    if (!args[1])
      return api.sendMessage('⚠️ Vui lòng nhập số tin nhắn hoặc "off" để tắt.\nVí dụ: check autoloc 5 hoặc check autoloc off', threadID);
    if (args[1].toLowerCase() === 'off') {
      delete global.checkttConfig[threadID];
      fs.writeFileSync(configPath, JSON.stringify(global.checkttConfig, null, 4));
      return api.sendMessage('✅ Đã tắt auto lọc.', threadID);
    }
    if (isNaN(args[1]))
      return api.sendMessage('⚠️ Vui lòng nhập số tin nhắn hợp lệ.', threadID);
    const threshold = parseInt(args[1]);
    if (threshold < 0 || threshold > 10000)
      return api.sendMessage('⚠️ Ngưỡng phải là số dương và hợp lý!', threadID);
    global.checkttConfig[threadID] = threshold;
    fs.writeFileSync(configPath, JSON.stringify(global.checkttConfig, null, 4));
    return api.sendMessage(`✅ Đã bật auto lọc với ngưỡng ${threshold} tin nhắn.`, threadID);
  }

  if (['all', 'week', 'day'].includes(query)) {
    let list = [];
    if (query === 'all') list = data.total;
    if (query === 'week') list = data.week;
    if (query === 'day') list = data.day;

    const sorted = list.slice().sort((a, b) => b.count - a.count);
    const totalMessages = sorted.reduce((a, b) => a + b.count, 0);

    const msg = `[ Bảng Xếp Hạng Tin Nhắn - ${query.toUpperCase()} ]\n\n` +
      sorted.map((u, i) => `${i + 1}. ${global.data.userName.get(u.id) || "Người dùng"} - ${u.count.toLocaleString()} Tin.`).join('\n') +
      `\n\n💬 Tổng Tin Nhắn: ${totalMessages.toLocaleString()}\n` +
      `📌 Chỉ QTV được reply số để xóa thành viên (VD: 1 2 3).`;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      try { console.log('[check] getThreadInfo (command flow)', { threadID, imageSrc: threadInfo && threadInfo.imageSrc ? threadInfo.imageSrc : null }); } catch {}
      if (threadInfo.imageSrc) {
        const boxImage = await streamURL(threadInfo.imageSrc);
        return api.sendMessage({ 
          body: msg, 
          attachment: boxImage 
        }, threadID, (err, info) => {
          if (err) {
            try { console.error('[check] Error sending message with image (command flow)', { threadID, error: err && err.message ? err.message : err }); } catch {}
            // Nếu không gửi được ảnh thì gửi text
            return sendRankMessage(api, threadID, msg, senderID, sorted, this.config.name);
          }
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            tag: 'locmen',
            thread: threadID,
            author: senderID,
            storage: sorted
          });
        });
      } else {
        try { console.log('[check] No imageSrc (command flow)', { threadID }); } catch {}
        return sendRankMessage(api, threadID, msg, senderID, sorted, this.config.name);
      }
    } catch (err) {
      // Nếu có lỗi khi lấy thông tin nhóm thì chỉ gửi text
      try { console.error('[check] getThreadInfo error (command flow)', { threadID, error: err && err.message ? err.message : err }); } catch {}
      return sendRankMessage(api, threadID, msg, senderID, sorted, this.config.name);
    }
  }

  const threadInfo = await Threads.getData(threadID).then(data => data.threadInfo);
  const nameThread = threadInfo.threadName;
  const nameUID = global.data.userName.get(targetID) || "Người dùng";
  const UID = targetID;
  let permission;
  if (global.config.ADMINBOT.includes(UID.toString())) {
    permission = 'Admin Bot';
  } else if (global.config.NDH && global.config.NDH.includes(UID.toString())) {
    permission = 'Người Thuê Bot';
  } else if (threadInfo.adminIDs.some(i => i.id == UID)) {
    permission = 'Quản Trị Viên';
  } else {
    permission = 'Thành Viên';
  }

  const totalDay = data.day.reduce((a, b) => a + b.count, 0);
  const totalWeek = data.week.reduce((a, b) => a + b.count, 0);
  const totalAll = data.total.reduce((a, b) => a + b.count, 0);

  const userTotalDay = data.day.find(u => u.id == targetID)?.count || 0;
  const userTotalWeek = data.week.find(u => u.id == targetID)?.count || 0;
  const userTotal = data.total.find(u => u.id == targetID)?.count || 0;

  const sortedDay = data.day.slice().sort((a, b) => b.count - a.count);
  const sortedWeek = data.week.slice().sort((a, b) => b.count - a.count);
  const sortedTotal = data.total.slice().sort((a, b) => b.count - a.count);

  const userRankDay = sortedDay.findIndex(u => u.id == targetID);
  const userRankWeek = sortedWeek.findIndex(u => u.id == targetID);
  const userRank = sortedTotal.findIndex(u => u.id == targetID);

  let body = `[ ${nameThread} ]\n\n👤 Tên: ${nameUID}\n🎖️ Chức Vụ: ${permission}\n📝 Profile: https://www.facebook.com/profile.php?id=${UID}\n───────────────\n💬 Tin Nhắn Trong Ngày: ${userTotalDay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n📊 Tỉ Lệ Tương Tác Ngày ${totalDay > 0 ? ((userTotalDay / totalDay) * 100).toFixed(2) : 0}%\n🥇 Hạng Trong Ngày: ${userRankDay + 1}\n───────────────\n💬 Tin Nhắn Trong Tuần: ${userTotalWeek.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n📊 Tỉ Lệ Tương Tác Tuần ${totalWeek > 0 ? ((userTotalWeek / totalWeek) * 100).toFixed(2) : 0}%\n🥈 Hạng Trong Tuần: ${userRankWeek + 1}\n───────────────\n💬 Tổng Tin Nhắn: ${userTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n📊 Tỉ Lệ Tương Tác Tổng ${totalAll > 0 ? ((userTotal / totalAll) * 100).toFixed(2) : 0}%\n🏆 Hạng Tổng: ${userRank + 1}\n\n📌 Dùng:\n- ${global.config.PREFIX}check day/week/all để xem BXH\n- Thả ❤️ để xem tổng BXH\n- ${global.config.PREFIX}check lọc/reset/autoloc [số] để quản lý nhóm.`;
  api.sendMessage({ body }, threadID, (err, info) => {
    if (err) return api.sendMessage("❌ Không thể gửi thông tin tương tác", threadID);
    global.client.handleReaction.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID
    });
  });
};

module.exports.handleReply = async function({ api, event, handleReply, Threads }) {
  try {
    const { senderID, threadID, messageID, body } = event;
    const dataThread = (await Threads.getData(threadID)).threadInfo;

    if (!dataThread.adminIDs.some(item => item.id == senderID))
      return api.sendMessage('❎ Chỉ quản trị viên mới được phép kick thành viên!', threadID, messageID);

    if (!dataThread.adminIDs.some(item => item.id == api.getCurrentUserID()))
      return api.sendMessage('❎ Bot cần quyền quản trị viên để kick!', threadID, messageID);

    const isValidInput = body.trim().match(/^\d+(\s+\d+)*$/);
    if (!isValidInput)
      return api.sendMessage('⚠️ Vui lòng chỉ reply số (VD: 1, 2 3) để kick thành viên!', threadID, messageID);

    const indexes = body.split(" ").map(i => parseInt(i)).filter(i => !isNaN(i));
    if (indexes.length === 0)
      return api.sendMessage(`⚠️ Dữ liệu không hợp lệ`, threadID, messageID);

    let success = 0, fail = 0, msg = '', botBlocked = false;
    for (let index of indexes) {
      const user = handleReply.storage[index - 1];
      if (user) {
        if (user.id == api.getCurrentUserID()) {
          botBlocked = true;
          continue;
        }
        try {
          await api.removeUserFromGroup(user.id, threadID);
          success++;
          msg += `${index}. ${global.data.userName.get(user.id) || "Người dùng"}\n`;
        } catch {
          fail++;
        }
      }
    }
    let resultMsg = `✅ Đã xóa ${success} thành viên thành công\n❎ Thất bại ${fail}\n\n${msg}`;
    api.sendMessage(resultMsg, threadID, () => {
      if (botBlocked) {
        api.sendMessage(`Kick em làm gì vậy!`, threadID);
      }
    });
  } catch (err) {
    console.error(`Lỗi khi xử lý reply:`, err);
    return api.sendMessage("❌ Lỗi khi xóa thành viên", threadID);
  }
};

module.exports.handleReaction = async function({ api, event, handleReaction }) {
  if (event.userID !== handleReaction.author || event.reaction !== '❤') return;

  api.unsendMessage(handleReaction.messageID);
  const filePath = path + event.threadID + '.json';
  if (!fs.existsSync(filePath)) return api.sendMessage("⚠️ Chưa có dữ liệu", event.threadID);

  const data = JSON.parse(fs.readFileSync(filePath));
  const sorted = data.total.sort((a, b) => b.count - a.count);
  const totalMessages = sorted.reduce((a, b) => a + b.count, 0);
  const rank = sorted.findIndex(u => u.id == event.userID) + 1;

  const msg = `[ Tất Cả Tin Nhắn ]\n\n` +
    sorted.map((u, i) => `${i + 1}. ${global.data.userName.get(u.id) || "Người dùng"} - ${u.count.toLocaleString()} Tin.`).join('\n') +
    `\n\n💬 Tổng Tin Nhắn: ${totalMessages.toLocaleString()}\n` +
    `📊 Bạn hiện đang đứng ở hạng: ${rank}\n\n` +
    `📌 Chỉ QTV được reply số để xóa thành viên (VD: 1 2 3).\n` +
    `${global.config.PREFIX}check lọc [số] để lọc thành viên.\n` +
    `${global.config.PREFIX}check autoloc [số] để tự lọc.\n` +
    `${global.config.PREFIX}check reset để reset dữ liệu.\n` +
    `${global.config.PREFIX}kickndfb để xóa người dùng fb.`;

  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    try { console.log('[check] getThreadInfo (reaction flow)', { threadID: event.threadID, imageSrc: threadInfo && threadInfo.imageSrc ? threadInfo.imageSrc : null }); } catch {}
    if (threadInfo.imageSrc) {
      const boxImage = await streamURL(threadInfo.imageSrc);
      return api.sendMessage({ 
        body: msg, 
        attachment: boxImage 
      }, event.threadID, (err, info) => {
        if (err) {
          try { console.error('[check] Error sending message with image (reaction flow)', { threadID: event.threadID, error: err && err.message ? err.message : err }); } catch {}
          // Nếu không gửi được ảnh thì gửi text
          return sendRankMessage(api, event.threadID, msg, event.userID, sorted, this.config.name);
        }
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          tag: 'locmen',
          thread: event.threadID,
          author: event.userID,
          storage: sorted
        });
      });
    } else {
      try { console.log('[check] No imageSrc (reaction flow)', { threadID: event.threadID }); } catch {}
      return sendRankMessage(api, event.threadID, msg, event.userID, sorted, this.config.name);
    }
  } catch (err) {
    // Nếu có lỗi thì chỉ gửi text
    try { console.error('[check] getThreadInfo error (reaction flow)', { threadID: event.threadID, error: err && err.message ? err.message : err }); } catch {}
    return sendRankMessage(api, event.threadID, msg, event.userID, sorted, this.config.name);
  }
};

function sendRankMessage(api, threadID, msg, senderID, sorted, configName) {
  api.sendMessage(msg, threadID, (err, info) => {
    if (err) return api.sendMessage("❌ Không thể gửi bảng xếp hạng", threadID);
    global.client.handleReply.push({
      name: configName,
      messageID: info.messageID,
      tag: 'locmen',
      thread: threadID,
      author: senderID,
      storage: sorted
    });
  });
}
=======
this.config = {
  name: "check",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "DungUwU && Nghĩa",
  description: "Check tương tác ngày/tuần/toàn bộ",
  commandCategory: "Box",
  usages: "[all/week/day]",
  cooldowns: 5,
  images: [],
  dependencies: {
    "fs": " ",
    "moment-timezone": " "
  }
};
const path = __dirname + '/_checktt/';
const moment = require('moment-timezone');

this.onLoad = () => {
  const fs = require('fs');
  if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
    fs.mkdirSync(path, { recursive: true });
  }
  setInterval(() => {
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    const checkttData = fs.readdirSync(path);
    checkttData.forEach(file => {
      try { var fileData = JSON.parse(fs.readFileSync(path + file)) } catch { return fs.unlinkSync(path+file) };
      if (fileData.time != today) {
        setTimeout(() => {
          fileData = JSON.parse(fs.readFileSync(path + file));
          if (fileData.time != today) {
            fileData.time = today;
            fs.writeFileSync(path + file, JSON.stringify(fileData, null, 4));
          }
        }, 60 * 1000);
      }
    })
  }, 60 * 1000);
}
this.handleEvent = async function({ api, event, Threads }) {
  try {
    if (!event.isGroup) return;
    if (global.client.sending_top == true) return;
    const fs = global.nodemodule['fs'];
    const { threadID, senderID } = event;
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    if (!fs.existsSync(path + threadID + '.json')) {
      var newObj = {
        total: [],
        week: [],
        day: [],
        time: today,
        last: {
          time: today,
          day: [],
          week: [],
        },
        lastInteraction: {}
      };
      fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));
    } else {
      var newObj = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    }
    if (true) {
      const UserIDs = event.participantIDs || [];
      if (UserIDs.length != 0) for (let user of UserIDs) {
        if (!newObj.last) newObj.last = {
          time: today,
          day: [],
          week: [],
        };
        if (!newObj.last.week.find(item => item.id == user)) {
          newObj.last.week.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.last.day.find(item => item.id == user)) {
          newObj.last.day.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.total.find(item => item.id == user)) {
          newObj.total.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.week.find(item => item.id == user)) {
          newObj.week.push({
            id: user,
            count: 0
          });
        }
        if (!newObj.day.find(item => item.id == user)) {
          newObj.day.push({
            id: user,
            count: 0
          });
        }
      }
    };
    fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));  
    const threadData = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    if (threadData.time != today) {
      global.client.sending_top = true;
      setTimeout(() => global.client.sending_top = false, 5 * 60 * 1000);
    }
    const userData_week_index = threadData.week.findIndex(e => e.id == senderID);
    const userData_day_index = threadData.day.findIndex(e => e.id == senderID);
    const userData_total_index = threadData.total.findIndex(e => e.id == senderID);
    if (userData_total_index == -1) {
      threadData.total.push({
        id: senderID,
        count: 1,
      });
    } else threadData.total[userData_total_index].count++;
    if (userData_week_index == -1) {
      threadData.week.push({
        id: senderID,
        count: 1
      });
    } else threadData.week[userData_week_index].count++;
    if (userData_day_index == -1) {
      threadData.day.push({
        id: senderID,
        count: 1
      });
    } else threadData.day[userData_day_index].count++;
    let p = event.participantIDs;
    if (!!p && p.length > 0) {
      p = p.map($=>$+'');
      ['day','week','total'].forEach(t=>threadData[t] = threadData[t].filter($=>p.includes($.id+'')));
    };
  
    // Thêm tương tác gần đây
    const lastInteraction = {
      id: senderID,
      time: Date.now()
    };
    threadData.lastInteraction = threadData.lastInteraction || {};
threadData.lastInteraction[senderID] = Date.now();
    fs.writeFileSync(path + threadID + '.json', JSON.stringify(threadData, null, 4));
  } catch(e) {};
}
this.run = async function({ api, event, args, Users, Threads, Currencies }) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const fs = global.nodemodule['fs'];
  const { threadID, messageID, senderID, mentions } = event;
  let path_data = path + threadID + '.json';
  if (!fs.existsSync(path_data)) {
    return api.sendMessage("⚠️ Chưa có dữ liệu", threadID);
  }
  const threadData = JSON.parse(fs.readFileSync(path_data));
  const query = args[0] ? args[0].toLowerCase() : '';

  if (query == 'box') {
    let body_ = event.args[0].replace(exports.config.name, '')+'box info';
    let args_ = body_.split(' ');
    
    arguments[0].args = args_.slice(1);
    arguments[0].event.args = args_;
    arguments[0].event.body = body_;
    
    return require('./box.js').run(...Object.values(arguments));
  } else if (query == 'loc') {
    if (!global.config.NDH.includes(senderID)) {
        return api.sendMessage("⚠️ Bạn không đủ quyền hạn để sử dụng lệnh này", threadID, messageID);
    }

    let count = 0;
    let removedCount = 0;
    const allThreads = await api.getThreadList(100, null, ['INBOX']);
    const allThreadIDs = new Set(allThreads.map(t => t.threadID));
    
    try {
        // Đọc tất cả files trong thư mục
        const dataPath = __dirname + '/_checktt/';
        const files = fs.readdirSync(dataPath);
        
        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            count++;
            
            const threadID = file.replace('.json', '');
            const filePath = dataPath + file;
            
            // Kiểm tra xem bot còn trong nhóm không
            if (!allThreadIDs.has(threadID)) {
                try {
                    fs.unlinkSync(filePath);
                    removedCount++;
                    console.log(`[CHECK] Đã xóa file của nhóm: ${threadID}`);
                } catch (err) {
                    console.error(`[CHECK] Lỗi khi xóa file ${file}:`, err);
                }
            }
        }

        // Tạo thông báo chi tiết
        let message = '✅ Đã lọc xong dữ liệu nhóm!\n\n';
        message += '📊 Thống kê:\n';
        message += `➣ Tổng số nhóm: ${count}\n`;
        message += `➣ Số nhóm đã xóa: ${removedCount}\n`;
        message += `➣ Số nhóm còn lại: ${count - removedCount}\n\n`;
        message += `💡 Đã xóa ${removedCount} nhóm không tồn tại khỏi dữ liệu`;

        return api.sendMessage(message, threadID);

    } catch (error) {
        console.error('[CHECK] Lỗi:', error);
        return api.sendMessage('❎ Đã xảy ra lỗi trong quá trình lọc dữ liệu', threadID);
    }
  } else if (query === 'ndfb') {
let body_ = event.args[0].replace(exports.config.name, '')+'kickdnfb';
    let args_ = body_.split(' ');
    
    arguments[0].args = args_.slice(1);
    arguments[0].event.args = args_;
    arguments[0].event.body = body_;
    
    return require('./kickndfb.js').run(...Object.values(arguments));
   } else if(query == 'locmem') {
        let threadInfo = await api.getThreadInfo(threadID);
        if(!threadInfo.adminIDs.some(e => e.id == senderID)) return api.sendMessage("❎ Bạn không có quyền sử dụng lệnh này", threadID);
        if(!threadInfo.isGroup) return api.sendMessage("❎ Chỉ có thể sử dụng trong nhóm", threadID);
        if(!threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID())) return api.sendMessage("⚠️ Bot Cần Quyền Quản Trị Viên", threadID);
        if(!args[1] || isNaN(args[1])) return api.sendMessage("Error", threadID);
        let minCount = +args[1],
            allUser = event.participantIDs;let id_rm = [];
        for(let user of allUser) {
            if(user == api.getCurrentUserID()) continue;
            if(!threadData.total.some(e => e.id == user) || threadData.total.find(e => e.id == user).count <= minCount) {
                await new Promise(resolve=>setTimeout(async () => {
                    await api.removeUserFromGroup(user, threadID);
                    id_rm.push(user);
                    resolve(true);
                }, 1000));
            }
        }
    return api.sendMessage(`☑️ Đã xóa ${id_rm.length} thành viên ${minCount} tin nhắn\n\n${id_rm.map(($,i)=>`${i+1}. ${global.data.userName.get($)}`)}`, threadID);
  } else if (query == 'call') {
    let threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo.adminIDs.some(e => e.id == senderID)) return api.sendMessage("❎ Bạn không có quyền sử dụng lệnh này", threadID);
    if (!threadInfo.isGroup) return api.sendMessage("❎ Chỉ có thể sử dụng trong nhóm", threadID);
    
    let inactiveUsers = threadData.total.filter(user => user.count < 5);
    if (inactiveUsers.length === 0) return api.sendMessage("Không có thành viên nào dưới 5 tin nhắn.", threadID);
    
    let mentionBody = "";
    let mentionIds = [];
    for (let user of inactiveUsers) {
      let name = await Users.getNameUser(user.id);
      mentionBody += `${name}\n`;
      mentionIds.push({ id: user.id, tag: `${name}` });
    }
    
    let message = `${mentionBody}\n Dậy tương tác đi, cá cảnh hơi lâu rồi đó 🙂!`;
    return api.sendMessage({ body: message, mentions: mentionIds }, threadID);
  }

  ////////small code///////////////////////
  var x = threadData.total.sort((a, b) => b.count - a.count);
  var o = [];
  for (i = 0; i < x.length; i++) {
    o.push({
      rank: i + 1,
      id: x[i].id,
      count: x[i].count
    })
  }
  /////////////////////////////////////////////////////////////
  var header = '',
      body = '',
      footer = '',
      msg = '',
      count = 1,
      storage = [],
      data = 0;
  if (query == 'all' || query == '-a') {
    header = '[ Kiểm Tra Tin nhắn Tổng ]\n────────────';
    data = threadData.total;
  } else if (query == 'week' || query == '-w') {
    header = '[ Kiểm Tra Tin nhắn Tuần ]\n────────────────';
    data = threadData.week;
  } else if (query == 'day' || query == '-d') {
    header = '[ Kiểm Tra Tin nhắn Ngày ]\n────────────────';
    data = threadData.day;
  } else {
    data = threadData.total;
  }
  for (const item of data) {
    const userName = await Users.getNameUser(item.id) || 'Facebook User';
    const itemToPush = item;
    itemToPush.name = userName;
    storage.push(itemToPush);
  };
  let check = ['all', '-a', 'week', '-w', 'day', '-d'].some(e => e == query);
  storage.sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    }
    else if (a.count < b.count) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
  if ((!check && Object.keys(mentions).length == 0) || (!check && Object.keys(mentions).length == 1) || (!check && event.type == 'message_reply')) {
    const UID = event.messageReply ? event.messageReply.senderID : Object.keys(mentions)[0] ? Object.keys(mentions)[0] : senderID;
    const userRank = storage.findIndex(e => e.id == UID);
    const userTotal = threadData.total.find(e => e.id == UID) ? threadData.total.find(e => e.id == UID).count : 0;
    const userTotalWeek = threadData.week.find(e => e.id == UID) ? threadData.week.find(e => e.id == UID).count : 0;
    const userRankWeek = threadData.week.sort((a, b) => b.count - a.count).findIndex(e => e.id == UID);
    const userTotalDay = threadData.day.find(e => e.id == UID) ? threadData.day.find(e => e.id == UID).count : 0;
    const userRankDay = threadData.week.sort((a, b) => b.count - a.count).findIndex(e => e.id == UID);
    const nameUID = storage[userRank].name || 'Facebook User';
    let threadInfo = await api.getThreadInfo(event.threadID);
    nameThread = threadInfo.threadName;
    var permission;
    if (global.config.ADMINBOT.includes(UID)) permission = `Admin Bot`;
    else if (global.config.NDH.includes(UID)) permission = `Người Thuê Bot`; 
    else if (threadInfo.adminIDs.some(i => i.id == UID)) permission = `Quản Trị Viên`; 
    else permission = `Thành Viên`;
    const target = UID == senderID ? 'Bạn' : nameUID;
    let lastInteraction = threadData.lastInteraction && threadData.lastInteraction[UID] 
      ? moment(threadData.lastInteraction[UID]).format('HH:mm:ss DD/MM/YYYY')
      : 'Chưa có';
    // Lấy exp từ hệ thống rankup
    let exp = 0;
try {
  const userData = await Currencies.getData(UID);
  exp = userData.exp;
} catch (error) {
  console.error("Error getting user data:", error);
  exp = 0; // Sử dụng giá trị mặc định nếu không lấy được dữ liệu
}
    const level = LV(exp);
    const realm = getCultivationRealm(level);

    body += `[ ${nameThread} ]\n👤Tên: ${nameUID}\n🔐Chức Vụ: ${permission}\n💬Tin Nhắn Trong Ngày: ${userTotalDay}\n🎖️Hạng Trong Ngày: ${userRankDay + 1}\n💬Tổng Tin Nhắn: ${userTotal}\n🏆Xếp Hạng Tổng: ${userRank + 1}\n📅Tương tác gần đây: ${lastInteraction}\n🔮Cảnh Giới: ${realm}\n\n📌 Thả cảm xúc "❤️" tin nhắn này để xem tổng tin nhắn của toàn bộ thành viên trong nhóm.
`.replace(/^ +/gm, '');
  } else {
    let userList = await Promise.all(storage.map(async item => {
      const userData = await Currencies.getData(item.id);
      const exp = userData.exp;
      const level = LV(exp);
      const realm = getCultivationRealm(level);
      return { ...item, exp, level, realm };
    }));
    
    userList.sort((a, b) => b.count - a.count);

    body = userList.map((item, index) => {
      return `${index + 1}. ${item.name} - ${item.count} tin nhắn \n${item.realm}\n `;
    }).join('-----------------\n');

    const userTotalWeek = threadData.week.find(e => e.id == senderID) ? threadData.week.find(e => e.id == senderID).count : 0;
    const userTotalDay = threadData.day.find(e => e.id == senderID) ? threadData.day.find(e => e.id == senderID).count : 0;
    const tlttd = (userTotalDay / (storage.reduce((a, b) => a + b.count, 0))) * 100;
    const tlttt = (userTotalWeek / (storage.reduce((a, b) => a + b.count, 0))) * 100
    const tltt = (((storage.filter($ => $.id == senderID))[0].count) / (storage.reduce((a, b) => a + b.count, 0))) * 100
    footer = `\n[💬] → Tổng Tin Nhắn: ${storage.reduce((a, b) => a + b.count, 0)}`;
  }

  msg = `${header}\n${body}\n${footer}`;
  return api.sendMessage(msg + '\n' + `${query == 'all' || query == '-a' ? `[🏆] → Bạn hiện đang đứng ở hạng: ${(o.filter(id => id.id == senderID))[0]['rank']}\n───────────────────\n📝 Hướng dẫn lọc thành viên:\n👉 Reply (phản hồi) tin nhắn này theo số thứ tự để xóa thành viên ra khỏi nhóm\n ${global.config.PREFIX}check locmem + số tin nhắn để xóa thành viên ra khỏi nhóm\n ${global.config.PREFIX}check reset -> reset lại toàn bộ dữ liệu tin nhắn\n${global.config.PREFIX}check ndfb -> kick người dùng bị bay acc khỏi nhóm\n${global.config.PREFIX}check box -> xem thông tin nhóm\n${global.config.PREFIX}check call -> tag những người dưới 5 tin nhắn` : ""}`, threadID, (error, info) => {
    if (error) return console.log(error)
    if (query == 'all' || query == '-a') {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        tag: 'locmen',
        thread: threadID,
        author: senderID,
        storage,
      })
    }
    global.client.handleReaction.push({
      name: this.config.name,
      messageID: info.messageID,
      sid: senderID,
    })
  },
  event.messageID);
  threadData = storage = null;
}
this.handleReply = async function({
  api
  , event
  , args
  , handleReply
  , client
  , __GLOBAL
  , permssion
  , Threads
  , Users
  , Currencies
}) {
  try {
    const { senderID } = event
    if (senderID != handleReply.author) return;
    let dataThread = (await Threads.getData(event.threadID)).threadInfo;
    if (!dataThread.adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage('❎ Bot cần quyền quản trị viên!', event.threadID, event.messageID);
    if (!dataThread.adminIDs.some(item => item.id == senderID)) return api.sendMessage('❎ Bạn không đủ quyền hạn để lọc thành viên!', event.threadID, event.messageID);
    const fs = require('fs');
    let split = event.body.split(" ");

    if (isNaN(split.join(''))) return api.sendMessage(`⚠️ Dữ liệu không hợp lệ`, event.threadID);

    let msg = [], count_err_rm = 0;
    for (let $ of split) {
      let id = handleReply?.storage[$ - 1]?.id;

      if (!!id)try {
        await api.removeUserFromGroup(id, event.threadID);
        msg.push(`${$}. ${global.data.userName.get(id)}`)
      } catch (e) {++count_err_rm;continue};
    };

    api.sendMessage(`🔄 Đã xóa ${split.length-count_err_rm} người dùng thành công, thất bại ${count_err_rm}\n\n${msg.join('\n')}`, handleReply.thread)

  } catch (e) {
    console.log(e)
  }
}
this.handleReaction = async function({ event, api, handleReaction, Threads, Users, Currencies }) {
  try {
    if (event.userID != handleReaction.sid) return;
    if (event.reaction != "❤") return;

    const threadID = event.threadID;
    const fs = require('fs');
    let path_data = path + threadID + '.json';
    
    if (!fs.existsSync(path_data)) {
      return api.sendMessage("⚠️ Không tìm thấy dữ liệu cho nhóm này.", threadID);
    }

    let threadData = JSON.parse(fs.readFileSync(path_data));
  
    let userList = await Promise.all(threadData.total.map(async item => {
      try {
        const userData = await Currencies.getData(item.id);
        const name = await Users.getNameUser(item.id) || 'Facebook User';
        const exp = userData.exp || 0;
        const level = LV(exp);
        const realm = getCultivationRealm(level);
        return { ...item, name, exp, level, realm };
      } catch (error) {
        console.error(`Error processing user ${item.id}:`, error);
        return { ...item, name: 'Unknown User', exp: 0, level: 0, realm: 'Unknown' };
      }
    }));

    userList.sort((a, b) => b.count - a.count);

    let msg = `[ Kiểm Tra Tất Cả Tin nhắn và Tu Tiên ]\n────────────\n`;
    msg += userList.map((item, index) => {
      return `${index + 1}. ${item.name} - ${item.count} tin nhắn\n${item.realm}\n `;
    }).join('-----------------\n');

    msg += `\n────────────\n`;
    msg += `[💬] → Tổng tin nhắn: ${userList.reduce((s, $) => s + $.count, 0)}\n`;
    msg += `[🏆] → Bạn hiện đứng ở hạng: ${userList.findIndex($ => $.id == event.userID) + 1}\n`;
    msg += `───────────────────\n`;
    msg += `📝 Hướng dẫn lọc thành viên:\n`;
    msg += `👉 Reply (phản hồi) tin nhắn này theo số thứ tự để xóa thành viên ra khỏi nhóm\n`;
    msg += ` ${global.config.PREFIX}check locmem + số tin nhắn để xóa thành viên ra khỏi nhóm\n`;
    msg += ` ${global.config.PREFIX}check reset -> reset lại toàn bộ dữ liệu tin nhắn\n`;
    msg += `${global.config.PREFIX}check ndfb -> kick người dùng bị bay acc khỏi nhóm\n`;
    msg += `${global.config.PREFIX}check box -> xem thông tin nhóm\n`;
    msg += `${global.config.PREFIX}check call -> tag những người dưới 5 tin nhắn`;

    api.unsendMessage(handleReaction.messageID);

    return api.sendMessage(msg, threadID, (err, info) => {
      if (err) {
        console.error("Error sending message:", err);
        return api.sendMessage("❎ Đã xảy ra lỗi khi gửi tin nhắn.", threadID);
      }
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        tag: 'locmen',
        thread: threadID,
        author: event.userID,
        storage: userList,
      });
    });
  } catch (error) {
    console.error("Error in handleReaction:", error);
    api.sendMessage("❎ Đã xảy ra lỗi khi xử lý phản ứng.", event.threadID);
  }
}

function getCultivationRealm(level) {
  const realms = [
    { name: "Luyện Khí", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Trúc Cơ", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Khai Quang", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Kim Đan", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Nguyên Anh", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Hóa Thần", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Phản Hư", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Luyện Hư", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Hợp Thể", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Đại Thừa", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Độ Kiếp", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Thiên Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Chân Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Kim Tiên", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Thánh Nhân", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Đại Thánh", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Tiên Đế", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Tiên Tôn", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Hỗn Độn", levels: 9, subRealms: ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ"] },
    { name: "Vô Cực", levels: 1, subRealms: ["Viên Mãn"] }
  ];

  let currentLevel = 0;
  for (let realm of realms) {
    if (level > currentLevel && level <= currentLevel + realm.levels) {
      const subRealmIndex = Math.floor((level - currentLevel - 1) / (realm.levels / realm.subRealms.length));
      return `${realm.name} ${realm.subRealms[subRealmIndex]}`;
    }
    currentLevel += realm.levels;
  }

  return "Phàm Nhân";
}

function LV(exp) {
  return Math.floor((Math.sqrt(1 + (4 * exp) / 3) + 1) / 2);
}

>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

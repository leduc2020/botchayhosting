<<<<<<< HEAD
﻿const fs = require("fs");
const path = require("path");
const leavePath = path.join(__dirname, "./../../modules/commands/data/leave.json");

if (!fs.existsSync(leavePath)) fs.writeFileSync(leavePath, "{}");

module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "2.1.0",
  credits: "ptt",
  description: "Gửi thông báo khi có người rời khỏi nhóm",
  dependencies: {}
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData, author } = event;

  // Bỏ qua nếu bot bị mời ra khỏi nhóm
  if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  // Đọc dữ liệu cấu hình
  const raw = fs.readFileSync(leavePath);
  const config = JSON.parse(raw);
  const leaveData = config[threadID];

  if (leaveData && leaveData.status === false) return;

  // Lấy tên nhóm (chính xác từ getThreadInfo để tránh null)
  const threadInfo = await api.getThreadInfo(threadID);
  const threadName = threadInfo.threadName || "nhóm chat";

  // Lấy tên người rời
  const userID = logMessageData.leftParticipantFbId;
  const name = global.data.userName.get(userID) || await Users.getNameUser(userID);

  // Lấy tên người kick (nếu có)
  let kickerName = "Hệ thống";
  if (author !== userID) {
    kickerName = global.data.userName.get(author) || await Users.getNameUser(author);
  }

  const type = (author === userID) ? "tự rời" : `bị ${kickerName} mời ra`;

  // Thời gian theo giờ Việt Nam (24h)
  const timeVN = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  // Tin nhắn thông báo
  const customMsg = leaveData?.message;
  let msg = customMsg
    ? customMsg
    : "📤 {name} đã {type} khỏi nhóm \"{box}\"\n⏰ Lúc: {time}";

  msg = msg
    .replace(/\{name}/g, name)
    .replace(/\{type}/g, type)
    .replace(/\{box}/g, threadName)
    .replace(/\{time}/g, timeVN);

  return api.sendMessage({ body: msg }, threadID);
};
const fs = require("fs");
const path = require("path");
const leavePath = path.join(__dirname, "./../../modules/commands/data/leave.json");

if (!fs.existsSync(leavePath)) fs.writeFileSync(leavePath, "{}");

module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "2.1.0",
  credits: "ptt",
  description: "Gửi thông báo khi có người rời khỏi nhóm",
  dependencies: {}
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData, author } = event;

  // Bỏ qua nếu bot bị mời ra khỏi nhóm
  if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  // Đọc dữ liệu cấu hình
  const raw = fs.readFileSync(leavePath);
  const config = JSON.parse(raw);
  const leaveData = config[threadID];

  if (leaveData && leaveData.status === false) return;

  // Lấy tên nhóm (chính xác từ getThreadInfo để tránh null)
  const threadInfo = await api.getThreadInfo(threadID);
  const threadName = threadInfo.threadName || "nhóm chat";

  // Lấy tên người rời
  const userID = logMessageData.leftParticipantFbId;
  const name = global.data.userName.get(userID) || await Users.getNameUser(userID);

  // Lấy tên người kick (nếu có)
  let kickerName = "Hệ thống";
  if (author !== userID) {
    kickerName = global.data.userName.get(author) || await Users.getNameUser(author);
  }

  const type = (author === userID) ? "tự rời" : `bị ${kickerName} mời ra`;

  // Thời gian theo giờ Việt Nam (24h)
  const timeVN = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  // Tin nhắn thông báo
  const customMsg = leaveData?.message;
  let msg = customMsg
    ? customMsg
    : "📤 {name} đã {type} khỏi nhóm \"{box}\"\n⏰ Lúc: {time}";

  msg = msg
    .replace(/\{name}/g, name)
    .replace(/\{type}/g, type)
    .replace(/\{box}/g, threadName)
    .replace(/\{time}/g, timeVN);

  return api.sendMessage({ body: msg }, threadID);
};
=======
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require('fs');

module.exports.config = {
  name: "leaveNoti",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "Không biết",
  description: "Thông báo bot hoặc người rời khỏi nhóm có random gif/ảnh/video",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

const checkttPath = __dirname + '/../commands/data/checktt/';

module.exports.run = async function ({ api, event, Users, Threads }) {
  try {
    const { threadID } = event;
    const { mainPath } = global.client;
    const pathLeave = mainPath + '/modules/commands/data/dataEvent.json';
    const dataLeave = JSON.parse(fs.readFileSync(pathLeave));
    const findLeave = dataLeave.leave.find(i => i.threadID === threadID);

    if (findLeave) {
      if (!findLeave.status) return;
    }
    const { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    var fullYear = global.client.getTime("fullYear");
    var getHours = await global.client.getTime("hours");

    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");
    const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
    const iduser = event.logMessageData.leftParticipantFbId;
    var getData = await Users.getData(event.author);
    var nameAuthor = typeof getData.name == "undefined" ? "" : getData.name;
    const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
    const type = (event.author == event.logMessageData.leftParticipantFbId) ? "Đã tự rời khỏi nhóm" : `Đã bị Qtv kick khỏi nhóm\n👤 Người kick: ${nameAuthor}\n🔗 Link: https://www.facebook.com/profile.php?id=${event.author}`;
    if (existsSync(checkttPath + threadID + '.json')) {
      const threadData = JSON.parse(readFileSync(checkttPath + threadID + '.json'));
      const userData_week_index = threadData.week.findIndex(e => e.id == event.logMessageData.leftParticipantFbId);
      const userData_day_index = threadData.day.findIndex(e => e.id == event.logMessageData.leftParticipantFbId);
      const userData_total_index = threadData.total.findIndex(e => e.id == event.logMessageData.leftParticipantFbId);
      if (userData_total_index != -1) {
        threadData.total.splice(userData_total_index, 1);
      }
      if (userData_week_index != -1) {
        threadData.week.splice(userData_week_index, 1);
      }
      if (userData_day_index != -1) {
        threadData.day.splice(userData_day_index, 1);
      }
      writeFileSync(checkttPath + threadID + '.json', JSON.stringify(threadData, null, 4));
    }

    (typeof data.customLeave == "undefined") ? msg = "[ Thành Viên Rời Nhóm ]\n────────────────────\n👤 Name: {name}\n🔗 Link: https://www.facebook.com/profile.php?id={iduser}\n📝 {type}\n────────────────────\n⏰ Time: {time}" : msg = data.customLeave;
    var getData = await Users.getData(event.author);
    var nameAuthor = typeof getData.name == "undefined" ? "" : getData.name;
    msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type).replace(/\{iduser}/g, iduser).replace(/\{time}/g, time).replace(/\{author}/g, nameAuthor).replace(/\{uidAuthor}/g, event.author);
     return api.sendMessage(msg, threadID, async (err, info) => {
      await new Promise(resolve => setTimeout(resolve, 20 * 1000));
      return api.unsendMessage(info.messageID);
    });

  } catch (e) { 
    console.log(e);
  }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

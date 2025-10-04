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

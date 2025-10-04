const fs = require("fs-extra");
const path = require("path");
const dataPath = global.anti; 

module.exports.config = {
  name: "anti",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "qt", //hãy tôn trong người coder ko đổi cre
  description: "Bật/tắt các chế độ chống đổi",
  commandCategory: "Quản trị nhóm",
  usages: "anti [name|image|nickname|out] [on|off]",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({
    boxname: [],
    boximage: [],
    antiNickname: [],
    antiout: {}
  }, null, 2));

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const [type, state] = args;

  
  if (!type) {
    const status = {
      name: data.boxname.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      image: data.boximage.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      nickname: data.antiNickname.some(i => i.threadID === threadID) ? "✅ Bật" : "❌ Tắt",
      out: data.antiout[threadID] ? "✅ Bật" : "❌ Tắt"
    };
    return api.sendMessage(
      `🛡️ Trạng thái chống:\n\n❥ Tên nhóm: ${status.name}\n❥ Ảnh nhóm: ${status.image}\n❥ Biệt danh: ${status.nickname}\n❥ Out nhóm: ${status.out}\n\n📌 anti name|image\nnickname|out  on/off`,
      threadID,
      messageID
    );
  }

  if (!["name", "image", "nickname", "out"].includes(type))
    return api.sendMessage("🔧 Các chế độ: name, image, nickname, out", threadID, messageID);

  if (!state || !["on", "off"].includes(state))
    return api.sendMessage("⚠️ Vui lòng nhập tham số `on` hoặc `off`.", threadID, messageID);

  const isOn = state === "on";

  switch (type) {
    case "name": {
      const index = data.boxname.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);
        if (index === -1) data.boxname.push({ threadID, name: threadInfo.threadName });
        else data.boxname[index].name = threadInfo.threadName;
        api.sendMessage("✅ Đã bật chống đổi tên nhóm", threadID, messageID);
      } else {
        if (index !== -1) data.boxname.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi tên nhóm", threadID, messageID);
      }
      break;
    }
    case "image": {
      const index = data.boximage.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);
        if (!threadInfo.imageSrc) return api.sendMessage("⚠️ Nhóm chưa có ảnh đại diện", threadID, messageID);
        if (index === -1) data.boximage.push({ threadID, url: threadInfo.imageSrc });
        else data.boximage[index].url = threadInfo.imageSrc;
        api.sendMessage("✅ Đã bật chống đổi ảnh nhóm", threadID, messageID);
      } else {
        if (index !== -1) data.boximage.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi ảnh nhóm", threadID, messageID);
      }
      break;
    }
    case "nickname": {
      const index = data.antiNickname.findIndex(i => i.threadID === threadID);
      if (isOn) {
        const threadInfo = await api.getThreadInfo(threadID);
        const nickData = {};
        for (const id in threadInfo.nicknames) {
          nickData[id] = threadInfo.nicknames[id];
        }
        if (index === -1) data.antiNickname.push({ threadID, data: nickData });
        else data.antiNickname[index].data = nickData;
        api.sendMessage("✅ Đã bật chống đổi biệt danh", threadID, messageID);
      } else {
        if (index !== -1) data.antiNickname.splice(index, 1);
        api.sendMessage("❌ Đã tắt chống đổi biệt danh", threadID, messageID);
      }
      break;
    }
    case "out": {
      if (isOn) data.antiout[threadID] = true;
      else delete data.antiout[threadID];
      api.sendMessage(isOn ? "✅ Đã bật chống out nhóm" : "❌ Đã tắt chống out nhóm", threadID, messageID);
      break;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};
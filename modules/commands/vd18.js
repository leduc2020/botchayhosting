module.exports.config = {
  name: "vd18",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Vihoo (fix by ChatGPT)",
  description: "Gửi video chill khi nhắn 'vd'",
  commandCategory: "Người dùng",
  usages: "",
  cooldowns: 0,
  dependencies: {
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body || !body.toLowerCase().startsWith("vd")) return;

  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  const filePath = __dirname + "/cache/vdcos.mp4";
  const videoUrl = "https://files.catbox.moe/33ghgi.mp4";

  try {
    api.sendMessage("Đang tải video sex, vui lòng đợi chút...", threadID, messageID);

    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: "Gửi mày video sex đây nhé!",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", err => {
      console.error(err);
      api.sendMessage("❌ Đã xảy ra lỗi khi gửi video.", threadID, messageID);
    });
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Không thể tải video. Link có thể bị lỗi hoặc mạng yếu.", threadID, messageID);
  }
};

module.exports.run = async () => {};
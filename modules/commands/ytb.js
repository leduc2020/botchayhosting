<<<<<<< HEAD
=======
const ytSearch = require("yt-search");
const ytdl = require("@distube/ytdl-core");
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
<<<<<<< HEAD
  name: "video",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Locdev, Shikaki Van D, nvh fix format",
  description: "Tải video từ YouTube",
  commandCategory: "media",
  usages: "[tên video / link YouTube]",
  cooldowns: 5
};

const API = "http://theone-api-3416.ddnsgeek.com:3040";
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// Hàm chuyển đổi kích thước từ string sang bytes
function parseSize(sizeStr) {
  const units = {
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024
  };
  
  const match = sizeStr.match(/([\d.]+)\s*([KMG]B)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    return Math.floor(value * units[unit]);
  }
  return 0;
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    if (handleReply.type === "search") {
      const choice = parseInt(event.body.trim());
      if (isNaN(choice) || choice < 1 || choice > handleReply.results.length) {
        return api.sendMessage("❌ Số không hợp lệ!", event.threadID, event.messageID);
      }
      
      // Thu hồi tin nhắn danh sách tìm kiếm
      api.unsendMessage(handleReply.messageID);
      
      const video = handleReply.results[choice - 1];
      const res = await axios.get(`${API}/?url=https://youtu.be/${video.videoId}`);
      const data = res.data;

      // Lọc chỉ lấy video (loại bỏ audio) và kiểm tra kích thước
      const videoFormats = data.media.filter(m => {
        if (m.quality.includes("kbps")) return false; // Loại bỏ audio
        const sizeBytes = parseSize(m.size);
        return sizeBytes <= MAX_VIDEO_SIZE; // Chỉ giữ video dưới 25MB
      });
      
      if (videoFormats.length === 0) {
        return api.sendMessage("❌ Không tìm thấy định dạng video nào dưới 25MB!", event.threadID, event.messageID);
      }

      let msg = `🎬 Đã chọn: ${data.title}\n📺 Kênh: ${data.channel}\n\n`;
      msg += "👉 Reply số để chọn chất lượng video (chỉ hiển thị video ≤25MB):\n";

      const list = [];
      videoFormats.forEach((m, i) => {
        list.push(m);
        msg += `${i + 1}. Video ${m.quality} | ${m.codec} | ${m.size}\n`;
      });

      api.sendMessage(msg, event.threadID, (err, info) => {
        global.client.handleReply.push({
          type: "format",
          name: module.exports.config.name,
          author: event.senderID,
          messageID: info.messageID,
          formats: list,
          title: data.title,
          channel: data.channel,
          expires: data.expires,
          originalResults: handleReply.results,
          selectedIndex: choice - 1
        });
      });
    }

    else if (handleReply.type === "format") {
      const choice = parseInt(event.body.trim());
      if (isNaN(choice) || choice < 1 || choice > handleReply.formats.length) {
        return api.sendMessage("❌ Số không hợp lệ!", event.threadID, event.messageID);
      }
      
      // Thu hồi tin nhắn danh sách chất lượng
      api.unsendMessage(handleReply.messageID);
      
      const format = handleReply.formats[choice - 1];
      const sizeBytes = parseSize(format.size);

      // Kiểm tra kích thước video trước khi tải
      if (sizeBytes > MAX_VIDEO_SIZE) {
        return api.sendMessage(
          `❌ Không thể tải video này!\n` +
          `📦 Kích thước: ${format.size} (vượt quá 25MB)\n` +
          `💡 Vui lòng chọn chất lượng thấp hơn.`,
          event.threadID, event.messageID
        );
      }

      const filePath = path.join(__dirname, "cache", format.filename);
      const writer = fs.createWriteStream(filePath);

      api.sendMessage("⏳ Đang tải video, vui lòng chờ...", event.threadID, event.messageID);

      const response = await axios({
        url: format.url,
        method: "GET",
        responseType: "stream"
      });

      response.data.pipe(writer);

      writer.on("finish", () => {
        // Kiểm tra kích thước file thực tế
        const stats = fs.statSync(filePath);
        if (stats.size > MAX_VIDEO_SIZE) {
          fs.unlinkSync(filePath);
          
          // Hiển thị lại bảng chọn chất lượng với cảnh báo
          let msg = `❌ Video tải về vượt quá 25MB (${(stats.size / (1024 * 1024)).toFixed(2)}MB)!\n\n`;
          msg += `🎬 ${handleReply.title}\n📺 ${handleReply.channel}\n\n`;
          msg += "💡 Vui lòng chọn chất lượng thấp hơn:\n";

          const list = [];
          handleReply.formats.forEach((m, i) => {
            list.push(m);
            const formatSizeBytes = parseSize(m.size);
            const warning = formatSizeBytes > MAX_VIDEO_SIZE ? " ⚠️ Vượt quá 25MB" : "";
            msg += `${i + 1}. Video ${m.quality} | ${m.codec} | ${m.size}${warning}\n`;
          });

          return api.sendMessage(msg, event.threadID, (err, info) => {
            global.client.handleReply.push({
              type: "format",
              name: module.exports.config.name,
              author: event.senderID,
              messageID: info.messageID,
              formats: list,
              title: handleReply.title,
              channel: handleReply.channel,
              expires: handleReply.expires,
              originalResults: handleReply.originalResults,
              selectedIndex: handleReply.selectedIndex
            });
          });
        }

        api.sendMessage({
          body: `🎬 ${handleReply.title}\n📺 ${handleReply.channel}\n📦 ${format.quality} (${format.codec}, ${format.size})\n⌛ ${handleReply.expires}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });

      writer.on("error", () => {
        api.sendMessage("❌ Tải video thất bại!", event.threadID, event.messageID);
      });
    }
  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Lỗi xử lý!", event.threadID, event.messageID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const query = args.join(" ");
    if (!query) return api.sendMessage("👉 Nhập từ khoá hoặc link YouTube!", event.threadID, event.messageID);

    let searchUrl = query.includes("youtube.com") || query.includes("youtu.be")
      ? `${API}/?url=${encodeURIComponent(query)}`
      : `${API}/search?q=${encodeURIComponent(query)}&num=5`;

    const res = await axios.get(searchUrl);
    const data = res.data;

    // Nếu user nhập link thì trả thẳng danh sách format video
    if (query.includes("youtube.com") || query.includes("youtu.be")) {
      // Lọc chỉ lấy video (loại bỏ audio) và kiểm tra kích thước
      const videoFormats = data.media.filter(m => {
        if (m.quality.includes("kbps")) return false; // Loại bỏ audio
        const sizeBytes = parseSize(m.size);
        return sizeBytes <= MAX_VIDEO_SIZE; // Chỉ giữ video dưới 25MB
      });
      
      if (videoFormats.length === 0) {
        return api.sendMessage("❌ Không tìm thấy định dạng video nào dưới 25MB!", event.threadID, event.messageID);
      }

      let msg = `🎬 ${data.title}\n📺 ${data.channel}\n\n👉 Reply số để chọn chất lượng video (chỉ hiển thị video ≤25MB):\n`;
      const list = [];
      videoFormats.forEach((m, i) => {
        list.push(m);
        msg += `${i + 1}. Video ${m.quality} | ${m.codec} | ${m.size}\n`;
      });

      api.sendMessage(msg, event.threadID, (err, info) => {
        global.client.handleReply.push({
          type: "format",
          name: module.exports.config.name,
          author: event.senderID,
          messageID: info.messageID,
          formats: list,
          title: data.title,
          channel: data.channel,
          expires: data.expires
        });
      });
    }

    // Nếu user search thì trả danh sách video
    else {
      let msg = "🔎 Kết quả tìm kiếm video:\n";
      data.results.forEach((v, i) => {
        msg += `${i + 1}. ${v.title} (${v.duration})\n`;
      });
      msg += "\n👉 Reply số để chọn video.";

      api.sendMessage(msg, event.threadID, (err, info) => {
        global.client.handleReply.push({
          type: "search",
          name: module.exports.config.name,
          author: event.senderID,
          messageID: info.messageID,
          results: data.results
        });
      });
    }

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Không lấy được dữ liệu!", event.threadID, event.messageID);
=======
  name: "ytb",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "qt", // tôn trọng qt với, code mấy ngày đó
  description: "Tìm kiếm và tải video YouTube",
  commandCategory: "Tiện ích",
  usages: "ytb <từ khóa>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const search = args.join(" ");
  const { threadID, messageID, senderID } = event;

  if (!search) return api.sendMessage("🔎 Nhập từ khóa để tìm video!", threadID, messageID);

  try {
    const result = await ytSearch(search);
    const videos = result.videos.slice(0, 6);
    if (!videos.length) return api.sendMessage("❌ Không tìm thấy video nào.", threadID, messageID);

    let msg = "🎬 Kết quả tìm kiếm:\n\n";
    videos.forEach((video, index) => {
      msg += `${index + 1}. ${video.title} (${video.timestamp})\n👁 ${video.views} views\n\n`;
    });
    msg += "📌 Reply số tương ứng để tải video.";

    const attachments = await Promise.all(
      videos.map(video => axios.get(video.thumbnail, { responseType: "stream" }).then(res => res.data))
    );

    api.sendMessage({
      body: msg,
      attachment: attachments
    }, threadID, (err, info) => {
      if (err) return;

      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        videos
      });
    }, messageID);

  } catch (err) {
    return api.sendMessage("❌ Lỗi khi tìm kiếm video.", threadID, messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;
  if (senderID !== handleReply.author) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.videos.length)
    return api.sendMessage("⚠️ Số không hợp lệ.", threadID, messageID);

  const video = handleReply.videos[index - 1];
  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const info = await ytdl.getInfo(video.url);
    const videoFormats = info.formats.filter(f => f.hasAudio && f.hasVideo && f.container === 'mp4');
    let bestFormat = videoFormats.find(f => f.qualityLabel === '720p');
    if (!bestFormat) {
      bestFormat = videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];
    }

    if (!bestFormat) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ Không tìm thấy định dạng video phù hợp.", threadID, messageID);
    }

    const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
    const stream = ytdl(video.url, { format: bestFormat });
    const writeStream = fs.createWriteStream(filePath);

    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      api.sendMessage({
        body: `🎥 ${video.title} (${bestFormat.qualityLabel})`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        fs.unlinkSync(filePath);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });
    });

  } catch {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ Không thể tải video.", threadID, messageID);
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
  }
};
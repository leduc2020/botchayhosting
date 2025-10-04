<<<<<<< HEAD
module.exports.config = {
  name: "adc",
  version: "5.5.1",
  hasPermssion: 3,
  credits: "Phạm Thanh Tùng",
  description: "Quản lý mã lệnh bot: tạo, xoá, xuất raw link",
  commandCategory: "Admin",
  usages: "[list | delete <tên> | <tên> và reply link]",
  cooldowns: 0,
  usePrefix: false
};

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply, type } = event;
  const isAdmin = global.config.NDH.includes(senderID);
  const filename = args[0];
  const filepath = path.join(__dirname, `${filename}.js`);
  const replyText = type === "message_reply" ? messageReply.body : null;

  if (!isAdmin) {
    const name = global.data.userName.get(senderID);
    const thread = await api.getThreadInfo(threadID);
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");
    return api.sendMessage(
      `📌 Box: ${thread.threadName}\n👤 ${name}\n📎 Dùng lệnh: adc\n🕒 ${time}\n🔗 https://facebook.com/${senderID}`,
      global.config.NDH
    );
  }

  // LIST
  if (filename === "list") {
    const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "adc.js");
    const list = files.map((f, i) => `${i + 1}. ${f.replace(".js", "")}`).join("\n") || "Không có lệnh nào.";
    return api.sendMessage("📁 Danh sách lệnh:\n" + list, threadID, messageID);
  }

  // DELETE
  if (filename === "delete" && args[1]) {
    const target = path.join(__dirname, `${args[1]}.js`);
    if (!fs.existsSync(target)) return api.sendMessage(`❎ Không tìm thấy file: ${args[1]}.js`, threadID, messageID);
    fs.unlinkSync(target);
    return api.sendMessage(`✅ Đã xoá: ${args[1]}.js`, threadID, messageID);
  }

  // XUẤT LINK RAW DPASTE
  if (fs.existsSync(filepath) && !replyText) {
    const content = fs.readFileSync(filepath, "utf8");
    if (!content || content.trim().length < 3)
      return api.sendMessage(`⚠️ File "${filename}.js" không có nội dung.`, threadID, messageID);
    try {
      const form = new URLSearchParams();
      form.append("content", content);
      const res = await axios.post("https://dpaste.com/api/v2/", form.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      return api.sendMessage(`${res.data.trim()}.txt`, threadID, messageID);
    } catch (e) {
      const detail = e.response?.data || e.message;
      return api.sendMessage(`❎ Lỗi tạo link dpaste:\n${typeof detail === "object" ? JSON.stringify(detail) : detail}`, threadID, messageID);
    }
  }

  // Sai cách sử dụng nếu không có file và không reply link
  if (!fs.existsSync(filepath) && !replyText) {
    return api.sendMessage(`❎ Sai cách sử dụng.\n👉 Dùng: ${global.config.PREFIX || ''}adc <tên lệnh> (và reply link chứa code)`, threadID, messageID);
  }

  // ÁP DỤNG CODE TỪ DPASTE.COM
  const urlMatch = replyText?.match(/https?:\/\/[^\s]+/g);
  if (!urlMatch) return api.sendMessage("❎ Không tìm thấy link hợp lệ.", threadID, messageID);
  let url = urlMatch[0];
  if (/^https:\/\/dpaste\.com\/[a-zA-Z0-9]+$/.test(url)) url += ".txt";

  if (url.includes("dpaste.com")) {
    try {
      const { data } = await axios.get(url);
      fs.writeFileSync(filepath, data, "utf8");
      delete require.cache[require.resolve(filepath)];
      require(filepath);
      return api.sendMessage(`✅ Đã tải và nạp: ${filename}.js`, threadID, messageID);
    } catch (e) {
      return api.sendMessage("❎ Lỗi tải code từ dpaste:\n" + e.message, threadID, messageID);
    }
  }

  return api.sendMessage("⚠️ Chỉ hỗ trợ link từ dpaste.com", threadID, messageID);
};
=======
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const request = require("request");
const cheerio = require("cheerio");
const { v4: uuidv4 } = require("uuid");

module.exports.config = {
    name: "adc",
    version: "1.1.0",
    hasPermssion: 3,
    credits: "thuylinh",
    description: "Áp dụng code từ link raw hoặc up code file lên note server",
    commandCategory: "Admin",
    usages: "adc <tênfile> hoặc reply link raw",
    cooldowns: 0,
    usePrefix: false,
    images: [],
};

module.exports.run = async function({ api, event, args }) {
    const ALLOWED_ID = "61568443432899";
    const { senderID, threadID, messageID, messageReply, type } = event;
    const send = msg => new Promise(r => api.sendMessage(msg, threadID, (err, res) => r(res), messageID));

    if (senderID !== ALLOWED_ID) {
        api.sendMessage("⛔ Bạn không có quyền sử dụng lệnh này!", threadID, messageID);
        return;
    }

    const name = args[0];
    const text = type == "message_reply" ? messageReply.body : null;

    if (!name && !text) return send("⚠️ Vui lòng nhập tên file hoặc reply link raw.");

    const filePath = path.join(__dirname, `${name}.js`);

    // Nếu reply link raw
    if (text) {
        const urlR = /https?:\/\/[^\s]+/g;
        const url = text.match(urlR);
        if (!url || url.length === 0) return send("⚠️ Vui lòng chỉ reply link raw hợp lệ!");
        const link = url[0];

        try {
            // Node Note server
            if (link.includes("103.116.52.252:14280/note/")) {
                const res = await axios.get(link.includes("?raw=true") ? link : link + "?raw=true");
                fs.writeFileSync(filePath, res.data, "utf-8");
                return send(`☑️ Đã áp dụng code từ note server vào ${name}.js`);
            }

            // Buildtool / tinyurl
            if (link.includes("buildtool") || link.includes("tinyurl.com")) {
                request({ method: "GET", url: text }, function(error, response, body) {
                    if (error) return send("⚠️ Vui lòng chỉ reply link raw hợp lệ!");
                    const $ = cheerio.load(body);
                    $(".language-js").each((i, el) => {
                        if (i !== 0) return;
                        const code = el.children[0].data;
                        fs.writeFileSync(filePath, code, "utf-8");
                        return send(`☑️ Đã áp dụng code vào "${name}.js"`);
                    });
                });
                return;
            }

            // Google Drive
            if (link.includes("drive.google")) {
                const id = link.match(/[-\w]{25,}/);
                const filepath = path.resolve(__dirname, `${name}.js`);
                try {
                    await downloadFile(`https://drive.google.com/u/0/uc?id=${id}&export=download`, filepath);
                    return send(`☑️ Đã áp dụng code vào "${name}.js"`);
                } catch (e) {
                    return send(`❎ Lỗi khi áp dụng code từ Google Drive cho "${name}.js".`);
                }
            }

            // Fallback raw link
            const resFallback = await axios.get(link);
            fs.writeFileSync(filePath, resFallback.data, "utf-8");
            return send(`☑️ Đã áp dụng code mới vào ${name}.js`);
        } catch (e) {
            return send(`❎ Không lấy được code từ link!`);
        }
    } else {
        // Không reply => upload code file lên Node Note server
        if (!fs.existsSync(filePath)) return send(`❎ Lệnh ${name} không tồn tại trên hệ thống!`);
        return await module.exports.uploadFile(send, filePath, { api, event });
    }
};

// Upload file lên Node Note server
module.exports.uploadFile = async function(send, filePath, o) {
    const noteId = uuidv4();
    const url_base = `http://103.116.52.252:14280/note/${noteId}`;
    const fileContent = fs.readFileSync(filePath, "utf-8");

    try {
        await axios.put(`${url_base}?raw=true`, fileContent, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

        const rawUrl = `${url_base}?raw=true`;
        const editUrl = url_base;

        return send(
            `✅ Upload thành công!\n\n📂 File: ${path.relative(process.cwd(), filePath)}\n📝 Raw: ${rawUrl}\n✏️ Edit: ${editUrl}`
        ).then(res => {
            res = { ...res, name: "note", path: filePath, o, url: rawUrl, action: "confirm_replace" };
            global.client.handleReaction.push(res);
        });
    } catch (e) {
        return send(`❌ Lỗi khi upload file: ${e.message}`);
    }
};

// Handle reply khi chọn file
module.exports.handleReply = async function(o) {
    const _ = o.handleReply;
    const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res), o.event.messageID));
    if (o.event.senderID != _.o.event.senderID) return;

    const selectedIndex = parseInt(o.event.body) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= _.foundFiles.length) return send(`❌ Số không hợp lệ!`);
    const selectedFile = _.foundFiles[selectedIndex];
    return await module.exports.uploadFile(send, selectedFile, _.o);
};

// Handle reaction khi xác nhận replace
module.exports.handleReaction = async function(o) {
    const _ = o.handleReaction;
    const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res), o.event.messageID));
    if (o.event.userID != _.o.event.senderID) return;

    if (_.action === "confirm_replace") {
        try {
            const content = (await axios.get(_.url)).data;
            fs.writeFileSync(_.path, content, "utf-8");
            return send(`✅ Đã cập nhật file!\n📂 ${path.relative(process.cwd(), _.path)}\n⏰ ${new Date().toLocaleString("vi-VN")}`);
        } catch (e) {
            return send(`❌ Lỗi khi replace: ${e.message}`);
        }
    }
};

// Helper download file từ Google Drive
async function downloadFile(url, filepath) {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({ url, method: "GET", responseType: "stream" });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

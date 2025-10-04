<<<<<<< HEAD
﻿const fs = require("fs");
const path = require("path");
const axios = require("axios");

const pathApi = path.join(__dirname, "../../includes/datajson/");

module.exports.config = {
  name: "api",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Vtuan",
  description: "no",
  commandCategory: "Admin",
  usages: "[]",
  cooldowns: 1,
  usePrefix: false,
};

const CL = (filePath) =>
  fs.readFileSync(filePath, "utf-8").split(/\r\n|\r|\n/).length;

module.exports.run = async function ({ api, event, args }) {
  try {
    if (args.length > 0) {
      const subCommand = args[0].toLowerCase();

      if (subCommand === "add") {
        api.setMessageReaction("⌛", event.messageID, () => { }, true);
        let msg = "";
        const replyMessage = event.messageReply;
        let fileName = "api.json";

        if (!replyMessage) {
          return api.sendMessage(
            `Vui lòng reply ảnh hoặc video + tên file api hoặc để trống để lưu vào file ${fileName}`,
            event.threadID,
          );
        }
        if (args.length > 1) {
          fileName = args.slice(1).join("_") + ".json";
        }
        const filePath = pathApi + fileName;

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "[]", "utf-8");
        }

        for (let i of replyMessage.attachments) {
          await axios
            .get(
              `https://catbox-mnib.onrender.com/upload?url=${encodeURIComponent(
                i.url
              )}`
            )
            .then(async ($) => {
              msg += `${$.data.url}\n`;
            });
           //api.sendMessage('✅Thêm thành công',event.threadID)
        
        }

        let existingData = [];

        try {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          existingData = JSON.parse(fileContent);
        } catch (error) {
          console.error("Error reading JSON file:", error);
        }

        existingData = existingData.concat(msg.split("\n").filter(Boolean));

        fs.writeFileSync(
          filePath,
          JSON.stringify(existingData, null, 2),
          "utf-8"
        );
        api.setMessageReaction("✅", event.messageID, () => { }, true);

        return api.sendMessage("✅Thêm thành công", event.threadID);
      } else if (subCommand === "cr") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `🦑 Bạn cần nhập tên file để tạo!`,
            event.threadID
          );
        }

        let fileName = args.slice(1).join("_") + ".json";
        const filePath = pathApi + fileName;

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "[]", "utf-8");
          api.setMessageReaction("✅", event.messageID, () => { }, true);
          return api.sendMessage(`➣ Đã tạo file ${fileName}`, event.threadID);
        } else {
          return api.sendMessage(
            `👉 File ${fileName} đã tồn tại`,
            event.threadID
          );
        }
      } else if (subCommand === "rm") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `👉 Bạn cần nhập tên file để xóa!`,
            event.threadID
          );
        }

        let fileName = args.slice(1).join("_") + ".json";
        const filePath = pathApi + fileName;

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          api.setMessageReaction("✅", event.messageID, () => { }, true);
          return api.sendMessage(`👊 Đã xóa file ${fileName}`, event.threadID);
        } else {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `❎ File ${fileName}.json không tồn tại`,
            event.threadID
          );
        }
      } else if (subCommand === "gf") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return api.sendMessage(
            `🦑 Bạn cần nhập tên file để share!`,
            event.threadID
          );
      }

        const fileName = args[1].toLowerCase() + ".json";
        const filePath = pathApi + fileName;
        if (fs.existsSync(filePath)) {
          try {
            const fileContent = fs.readFileSync(filePath, "utf-8");

            const response = await axios.post(
              "https://api.mocky.io/api/mock",
              {
                status: 200,
                content: fileContent,
                content_type: "application/json",
                charset: "UTF-8",
                secret: "NguyenMinhHuy",
                expiration: "never",
              }
            );
            api.setMessageReaction("✅", event.messageID, () => { }, true);
            return api.sendMessage(
              `📥 ${fileName}: ${response.data.link}`,
              event.threadID
            );
          } catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            return api.sendMessage(
              `Đã xảy ra lỗi trong quá trình xử lý file ${fileName}`,
              event.threadID
            );
          }
        } else {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          console.error(`File ${fileName} không tồn tại`);
          return api.sendMessage(
            `📥 File ${fileName} không tồn tại`,
            event.threadID
          );
        }
      } else if (subCommand === "check") {
        if (args.length < 2) {
          const files = fs.readdirSync(pathApi);
          const jsonFiles = files.filter(
            (file) => path.extname(file).toLowerCase() === ".json"
          );

          if (jsonFiles.length > 0) {
            const fileListArray = jsonFiles.map((file, index) => ({
              index: index + 1,
              fileName: path.basename(file, ".json"),
              filePath: pathApi + file,
              lineCount: CL(pathApi + file),
            }));

            const fileList = fileListArray
              .map(
                (item) =>
                  `${item.index}. ${item.fileName} (${item.lineCount} lines)`
              )
              .join("\n");
              api.setMessageReaction("✅", event.messageID, () => { }, true);
            const messageInfo = await api.sendMessage(
              `📒  Danh sách các link api:\n${fileList}\n\nReply tin nhắn này: rm/cr/gf/check + stt`,
              event.threadID
            );

            const replyInfo = {
              name: module.exports.config.name,
              messageID: messageInfo.messageID,
              author: event.senderID,
              fileListArray,
              type: "list",
            };
            global.client.handleReply.push(replyInfo);

            return;
          } else {
            return api.sendMessage(`➣ Thư mục rỗng`, event.threadID);
          }
        } /*else {

          if (args[1].toLowerCase() === "all") { 
            console.log(`abcxyz`)
          }
          
          const fileName = args[1].toLowerCase() + ".json";
          const filePath = pathApi + fileName;

          if (!fs.existsSync(filePath))
            return api.sendMessage(
              `File ${fileName} không tồn tại!`,
              event.threadID
            );
          try {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const jsonData = JSON.parse(fileContent);

            const brokenLinks = await Promise.all(
              jsonData.map(async (link) => {
                try {
                  const response = await axios.head(link);
                  if (response.status === 404) return link;
                } catch (error) {
                  //console.error(`Error checking link ${link}:`);
                  return link;
                }
              })
            );

            const linkk = brokenLinks.filter(Boolean);
            const sốlinkdie = linkk.length;
            let msg = ``;
            if (sốlinkdie === 0) {
              msg += `⪼ Không có link die`;
            } else {
              msg += `<Check Link>\n➣ link die: ${sốlinkdie}\n➣ link sống: ${
                jsonData.length - sốlinkdie
              }\n➣ Thả cảm xúc bất kì vào tin nhắn này để xóa link die`;
            }
            return api.sendMessage(msg, event.threadID, (error, info) => {
              if (error) {
                console.error(error);
              } else {
                global.client.handleReaction.push({
                  name: module.exports.config.name,
                  messageID: info.messageID,
                  author: event.senderID,
                  type: "check",
                  linkk,
                  filePath,
                });
              }
            });
          } catch (error) {
            // console.error(`Error checking links in file ${fileName}:`, error);
            return api.sendMessage(
              `Đã xảy ra lỗi trong quá trình kiểm tra liên kết trong file ${fileName}`,
              event.threadID
            );
          }*/
        }
      }

      
    else {
      const files = fs.readdirSync(pathApi);
      const jsonFiles = files.filter(
        (file) => path.extname(file).toLowerCase() === ".json"
      );
      const tong = jsonFiles.length;
      let tsdong = 0;
      for (const file of jsonFiles) {
        const filePath = pathApi + file;
        tsdong += CL(filePath);
      }
      api.setMessageReaction("✅", event.messageID, () => { }, true);
      const cachsudung = `
┏━━━━━━━━━━━━━━━━━      
┃👉 check: xem toàn bộ danh 
┃                sách api
┃
┃👉 check + tên file muốn 
┃                kiểm tra
┃
┃👉 rm + tên file json 
┃                muốn xóa
┃
┃👉 cr + tên file json để
┃                 tạo file mới
┃
┃👉  gf + tên file để share 
┃           file api
┃
┃👉  add:reply ảnh/video
┃      audio muốn làm api!
┃   🥕 add + tên file cụ thể
┃   🥕 add + để trống 
┗━━━━━━━━━━━━━━━━━━━━━━━━━━              `;

      return api.sendMessage(
        `
${cachsudung}
📊 Tổng số file api hiện có: ${tong}
📝 Tổng số dòng: ${tsdong}
👉 Reply tin nhắn này: cr + tên file để tạo file json mới`,
        event.threadID,
        async (error, info) => {
          if (error) {
            console.error(error);
          } else {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "api",
            });
          }
        }
      );
    }
  } catch (error) {
    console.error("Error in run function:", error);
    api.setMessageReaction("❎", event.messageID, () => { }, true);
    return api.sendMessage(
      "Đã xảy ra lỗi trong quá trình xử lý!",
      event.threadID
    );
  }
};
module.exports.handleReply = async ({ api, handleReply, event }) => {
  try {
    const { threadID, body, messageID } = event;
    const { fileListArray, type } = handleReply;
    const args = body.split(" ");

    const getPath = (fileName) => pathApi + fileName + ".json";

    const NVNH = (message) => api.sendMessage(message, threadID);

    if (type === "list") {
      if (args[0].toLowerCase() === "rm") {
        const fileIndices = args.slice(1).map((index) => parseInt(index));

        for (const fileIndex of fileIndices) {
          if (fileIndex >= 1 && fileIndex <= fileListArray.length) {
            const selectedFile = fileListArray[fileIndex - 1];
            const filePath = getPath(selectedFile.fileName);

            fs.unlink(filePath, (err) => {
              if (err) console.error(`Error deleting file ${filePath}:`, err);
            });
            api.setMessageReaction("✅", event.messageID, () => { }, true);
            NVNH(`Đã xóa file ${selectedFile.fileName}`);
          } else {
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            NVNH(`Tên ${fileIndex} không hợp lệ`);
          }
        }
      } else if (args[0].toLowerCase() === "cr") {
        if (args.length === 1) {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          return NVNH(`📝 Bạn cần nhập tên file để tạo!`);
        }

        let fileName = args.slice(1).join("_") + ".json";
        const filePath = getPath(fileName);

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "[]", "utf-8");
          api.setMessageReaction("✅", event.messageID, () => { }, true);
          NVNH(`Đã tạo file ${fileName}`);
        } else {
          api.setMessageReaction("❎", event.messageID, () => { }, true);
          NVNH(`File ${fileName} đã tồn tại`);
        }
      } else if (args[0].toLowerCase() === "gf") {
        const fileIndices = args.slice(1).map((index) => parseInt(index));

        for (const fileIndex of fileIndices) {
          if (fileIndex >= 1 && fileIndex <= fileListArray.length) {
            const selectedFile = fileListArray[fileIndex - 1];
            const filePath = getPath(selectedFile.fileName);

            try {
              const fileContent = fs.readFileSync(filePath, "utf-8");
              const response = await axios.post(
                "https://api.mocky.io/api/mock",
                {
                  status: 200,
                  content: fileContent,
                  content_type: "application/json",
                  charset: "UTF-8",
                  secret: "NguyenMinhHuy",
                  expiration: "never",
                },
              );

              const mockyLink = response.data.link;
              console.log(mockyLink);
              api.setMessageReaction("✅", event.messageID, () => { }, true);
              NVNH(`📥  ${selectedFile.fileName}: ${mockyLink}`);
            } catch (error) {
              console.error(
                "Error posting file content to RunMocky or processing response:",
                error,
              );
              api.setMessageReaction("❎", event.messageID, () => { }, true);
              NVNH("Đã xảy ra lỗi trong quá trình xử lý!");
            }
          } else {
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            NVNH(`Tên file ${fileIndex} không có `);
          }
        }
      } else if (args[0].toLowerCase() === "check") {
        const fileIndices = args.slice(1).map((index) => parseInt(index));

        for (const fileIndex of fileIndices) {
          if (fileIndex >= 1 && fileIndex <= fileListArray.length) {
            const selectedFile = fileListArray[fileIndex - 1];
            const filePath = getPath(selectedFile.fileName);
            api.setMessageReaction("⌛", event.messageID, () => { }, true);
            try {
              const fileContent = fs.readFileSync(filePath, "utf-8");
              const jsonData = JSON.parse(fileContent);

              const brokenLinks = await Promise.all(
                jsonData.map(async (link) => {
                  try {
                    const response = await axios.head(link);
                    if (response.status === 404) {
                      return link;
                    }
                  } catch (error) {
                    //console.error(`Error checking link ${link}:`, error);
                    return link;
                  }
                }),
              );

              const nn = brokenLinks.filter(Boolean).length;
              // const numberOfLiveLinks = jsonData.length - nn;
              /*const message = `Tệp ${selectedFile.fileName} chứa:\n` +
                    `- Số liên kết die: ${nn}\n` +
                    `- Số liên kết còn sống: ${numberOfLiveLinks}`;*/
                    api.setMessageReaction("✅", event.messageID, () => { }, true);
              const message = `===𝐂𝐡𝐞𝐜𝐤 𝐋𝐢𝐧𝐤===\n➣ 𝐋𝐢𝐧𝐤 𝐝𝐢𝐞: ${nn}\n➣ 𝐋𝐢𝐧𝐤 𝐬𝐨̂́𝐧𝐠: ${jsonData.length - nn}\n➣ Thả cảm xúc bất kì vào tin nhắn này để xóa link die`;
              api.sendMessage(message, event.threadID, (error, info) => {
                if (error) {
                  console.error(error);
                } else {
                  global.client.handleReaction.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    type: "check",
                    linkk: brokenLinks,
                    filePath,
                  });
                }
              });
            } catch (error) {
              console.error(
                `Error reading or parsing JSON file ${selectedFile.fileName}:`,
                error,
              );
              api.setMessageReaction("❎", event.messageID, () => { }, true);
              api.sendMessage(
                `Đã xảy ra lỗi khi đọc hoặc phân tích tệp JSON ${selectedFile.fileName}`,
                event.threadID,
              );
            }
          } else {
            api.setMessageReaction("❎", event.messageID, () => { }, true);
            NVNH(`Index ${fileIndex} không hợp lệ`);
          }
        }
      }
    } else if (type === "api" && args[0].toLowerCase() === "cr") {
      if (args.length === 1) {
        api.setMessageReaction("❎", event.messageID, () => { }, true);
        return NVNH(`👉  Bạn cần nhập tên file để tạo!`);
      }

      let fileName = args.slice(1).join("_") + ".json";
      const filePath = getPath(fileName);

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf-8");
        api.setMessageReaction("✅", event.messageID, () => { }, true);
        NVNH(`✅ Đã tạo file ${fileName}`);
      } else {
        api.setMessageReaction("❎", event.messageID, () => { }, true);
        NVNH(`➣ File ${fileName} đã tồn tại`);
      }
    }
  } catch (error) {
    console.error("Lỗi: ", error);
  }
};
module.exports.handleReaction = async function ({
  api,
  event,
  handleReaction,
}) {
  if (event.userID != handleReaction.author) return;
  try {
    const { filePath, linkk } = handleReaction;

    if (filePath && Array.isArray(linkk) && linkk.length > 0) {
      let fileContent = fs.readFileSync(filePath, "utf-8");
      let jsonData = JSON.parse(fileContent);
      const l = jsonData.length;
      jsonData = jsonData.filter((link) => !linkk.includes(link));
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

      const d = l - jsonData.length;

      api.sendMessage(`✅ Đã xóa thành công ${d} link die`, event.threadID);
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
  }
};
=======
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
  name: "api",
  version: "3.0.0",
  hasPermission: 3,
  credits: "DongDev (mod by Trâm Anh, improved full by ChatGPT)",
  description: "Quản lý link JSON: add, check, filter, stats, export, import, list",
  commandCategory: "Admin",
  usages: "[add/check/stats/export/import/list/start]",
  cooldowns: 5,
  images: [],
};

const allowedUserIDs = ["61568443432899"]; // <-- Thêm ID tại đây

module.exports.run = async ({ api, event, args }) => {
  try {
    if (!allowedUserIDs.includes(event.senderID)) {
      return api.sendMessage("⛔ Bạn không có quyền sử dụng lệnh này.", event.threadID, event.messageID);
    }

    const projectHome = path.resolve('./');
    const srcapi = path.join(projectHome, 'includes/datajson');

    switch (args[0]) {
      case 'add': {
        if (args.length === 1) {
          return api.sendMessage("⚠️ Vui lòng nhập tên tệp", event.threadID, event.messageID);
        }

        const tip = args[1];
        const dataPath = path.join(srcapi, `${tip}.json`);
        if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]', 'utf-8');

        let data = [];
        try {
          data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
          if (!Array.isArray(data)) throw new Error('Invalid format');
        } catch (err) {
          console.error(`❌ Lỗi đọc file ${tip}.json: ${err}`);
          return api.sendMessage(`❌ Lỗi đọc file ${tip}.json`, event.threadID, event.messageID);
        }

        if (!event.messageReply || !event.messageReply.attachments?.length) {
          return api.sendMessage("⚠️ Vui lòng reply vào tin nhắn có file cần tải.", event.threadID, event.messageID);
        }

        let newLinks = [];

        for (const i of event.messageReply.attachments) {
          const response = await axios.get(`https://catbox-mnib.onrender.com/upload?url=${encodeURIComponent(i.url)}`);
          if (Array.isArray(response.data)) {
            newLinks.push(...response.data.map(linkObj => linkObj.url));
          } else {
            newLinks.push(response.data.url);
          }
        }

        const beforeCount = data.length;
        const combined = [...data, ...newLinks];
        const uniqueLinks = [...new Set(combined)];
        const addedCount = uniqueLinks.length - beforeCount;

        fs.writeFileSync(dataPath, JSON.stringify(uniqueLinks, null, 2), 'utf-8');

        return api.sendMessage(
          `☑️ Đã thêm ${addedCount} link mới vào ${tip}.json\n` +
          `📌 Tổng link hiện tại: ${uniqueLinks.length}`,
          event.threadID,
          event.messageID
        );
      }

      case 'check': {
        const files = fs.readdirSync(srcapi);
        const results = [];

        for (const file of files) {
          const filePath = path.join(srcapi, file);
          let linksArray = [];

          try {
            linksArray = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(linksArray)) throw new Error('Invalid format');
          } catch (err) {
            console.error(`❌ Lỗi đọc file ${file}: ${err}`);
            continue;
          }

          const totalLinks = linksArray.length;

          const checkLinkPromises = linksArray.map(link =>
            axios.head(link, { timeout: 5000 })
              .then(res => res.status === 200 ? 'live' : 'dead')
              .catch(() => 'dead')
          );

          const resultsSettled = await Promise.allSettled(checkLinkPromises);

          const liveCount = resultsSettled.filter(r => r.status === 'fulfilled' && r.value === 'live').length;
          const deadCount = totalLinks - liveCount;

          results.push(`📄 File: ${file}\n📝 Tổng: ${totalLinks}\n✅ Live: ${liveCount}\n❎ Die: ${deadCount}`);

          console.log(`✔️ Done check file ${file} - Live: ${liveCount} - Dead: ${deadCount}`);
        }

        api.sendMessage(
          `${results.join('\n\n')}\n\n📌 Thả ❤️ vào tin nhắn này để lọc các link die`,
          event.threadID,
          (err, info) => {
            global.client.handleReaction.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID
            });
          },
          event.messageID
        );
        break;
      }

      case 'stats': {
        const files = fs.readdirSync(srcapi);
        let totalLinks = 0;
        const stats = [];

        for (const file of files) {
          const filePath = path.join(srcapi, file);
          let linksArray = [];

          try {
            linksArray = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(linksArray)) throw new Error('Invalid format');
          } catch (err) {
            console.error(`❌ Lỗi đọc file ${file}: ${err}`);
            continue;
          }

          stats.push(`📄 ${file}: ${linksArray.length} link`);
          totalLinks += linksArray.length;
        }

        api.sendMessage(
          `📊 Thống kê toàn bộ link:\n\n${stats.join('\n')}\n\n🔹 Tổng tất cả: ${totalLinks} link`,
          event.threadID,
          event.messageID
        );
        break;
      }

      case 'export': {
        if (args.length === 1) {
          return api.sendMessage("⚠️ Vui lòng nhập tên tệp cần export.", event.threadID, event.messageID);
        }

        const tip = args[1];
        const dataPath = path.join(srcapi, `${tip}.json`);

        if (!fs.existsSync(dataPath)) {
          return api.sendMessage(`❌ File ${tip}.json không tồn tại.`, event.threadID, event.messageID);
        }

        api.sendMessage(
          {
            body: `📦 File ${tip}.json đây, bạn có thể tải về.`,
            attachment: fs.createReadStream(dataPath)
          },
          event.threadID,
          event.messageID
        );
        break;
      }

      case 'import': {
        if (!event.messageReply || !event.messageReply.attachments?.length) {
          return api.sendMessage("⚠️ Vui lòng reply vào 1 file JSON để import.", event.threadID, event.messageID);
        }

        const attachment = event.messageReply.attachments[0];
        if (!attachment.name.endsWith('.json')) {
          return api.sendMessage("⚠️ File không phải JSON.", event.threadID, event.messageID);
        }

        const savePath = path.join(srcapi, attachment.name);

        try {
          const response = await axios.get(attachment.url, { responseType: 'stream' });
          const writer = fs.createWriteStream(savePath);

          response.data.pipe(writer);

          writer.on('finish', () => {
            api.sendMessage(`✅ Đã import file ${attachment.name} vào includes/datajson.`, event.threadID, event.messageID);
          });

          writer.on('error', (err) => {
            console.error(err);
            api.sendMessage(`❌ Lỗi import file: ${err}`, event.threadID, event.messageID);
          });
        } catch (err) {
          console.error(err);
          api.sendMessage(`❌ Lỗi tải file: ${err}`, event.threadID, event.messageID);
        }

        break;
      }

      case 'list': {
        const files = fs.readdirSync(srcapi).filter(file => file.endsWith('.json'));

        if (files.length === 0) {
          return api.sendMessage("📂 Chưa có file JSON nào trong includes/datajson.", event.threadID, event.messageID);
        }

        const fileList = files.map((file, index) => `${index + 1}. ${file}`).join('\n');

        api.sendMessage(
          `📂 Danh sách file JSON hiện có:\n\n${fileList}`,
          event.threadID,
          event.messageID
        );
        break;
      }

      case 'start': {
        api.sendMessage(
          `👋 Chào bạn! Đây là bot quản lý link API.\n\n` +
          `Các lệnh hỗ trợ:\n` +
          `✅ /api add <filename> → Thêm link vào file (reply file cần thêm)\n` +
          `✅ /api check → Kiểm tra link live/die\n` +
          `✅ /api stats → Thống kê tổng link\n` +
          `✅ /api export <filename> → Gửi file JSON về chat\n` +
          `✅ /api import → Import 1 file JSON vào bot (reply vào file JSON)\n` +
          `✅ /api list → Xem danh sách các file JSON hiện có\n` +
          `❤️ Thả ❤️ vào tin nhắn sau khi check → tự động xoá link die\n\n` +
          `📌 Lưu ý:\n` +
          `- Bot tự lọc trùng khi thêm link.\n` +
          `- Có log lịch sử lọc link tại: includes/datajson/history.log\n\n` +
          `✨ Chúc bạn sử dụng vui vẻ!`,
          event.threadID,
          event.messageID
        );
        break;
      }

      default:
        api.sendMessage("📝 Dùng: add | check | stats | export | import | list | start", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage(`❎ Đã xảy ra lỗi: ${error}`, event.threadID, event.messageID);
  }
};

module.exports.handleReaction = async ({ event, api, handleReaction }) => {
  if (event.userID !== handleReaction.author) return;
  if (event.reaction !== "♥️") return;

  const srcapi = path.join(path.resolve('./'), 'includes/datajson');
  const files = fs.readdirSync(srcapi);
  let totalRemoved = 0;
  let totalFilesChanged = 0;
  const report = [];

  for (const file of files) {
    const filePath = path.join(srcapi, file);
    let linksArray = [];

    try {
      linksArray = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!Array.isArray(linksArray)) throw new Error('Invalid format');
    } catch (err) {
      console.error(`❌ Lỗi đọc file ${file}: ${err}`);
      continue;
    }

    const checkLinkPromises = linksArray.map(link =>
      axios.head(link, { timeout: 5000 })
        .then(res => res.status === 200 ? link : null)
        .catch(() => null)
    );

    const results = await Promise.allSettled(checkLinkPromises);

    const newLinks = results
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value);

    const removedCount = linksArray.length - newLinks.length;
    if (removedCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(newLinks, null, 2), 'utf-8');
      totalRemoved += removedCount;
      totalFilesChanged++;
      report.push(`📄 ${file}: ❌ ${removedCount} link die đã xoá`);

      const logPath = path.join(srcapi, 'history.log');
      const logLine = `${new Date().toISOString()} | User: ${event.userID} | File: ${file} | Removed: ${removedCount}\n`;
      fs.appendFileSync(logPath, logLine, 'utf-8');
    } else {
      report.push(`📄 ${file}: ✅ Không có link die`);
    }

    console.log(`✔️ Done clean file ${file} - Removed ${removedCount} link die`);
  }

  api.sendMessage(
    `✅ Đã lọc xong.\n` +
    `🔹 Tổng file thay đổi: ${totalFilesChanged}\n` +
    `🔹 Tổng link die đã xoá: ${totalRemoved}\n\n` +
    `${report.join('\n')}`,
    event.threadID
  );
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

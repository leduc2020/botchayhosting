const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "capwall",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Hoàn Lê",
  description: "Chụp ảnh màn hình của website từ link reply",
  commandCategory: "Khác",
  usages: "[reply chứa link web]",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.body || !messageReply.body.includes("http")) {
    return api.sendMessage("Vui lòng reply một tin nhắn có chứa link web.", threadID, messageID);
  }

  const url = messageReply.body.match(/https?:\/\/[^\s]+/g)?.[0];
  if (!url) {
    return api.sendMessage("Không tìm thấy link hợp lệ trong tin nhắn được reply.", threadID, messageID);
  }

  const filePath = path.join(__dirname, 'cache', `screenshot_${Date.now()}.png`);

  try {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.setViewport({ width: 1280, height: 720 });
    await page.screenshot({ path: filePath, fullPage: true });
    await browser.close();

    return api.sendMessage({
      body: `Đã chụp ảnh trang web:\n${url}`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath));
  } catch (err) {
    console.error(err);
    return api.sendMessage("Đã xảy ra lỗi khi chụp ảnh trang web.", threadID, messageID);
  }
};
<<<<<<< HEAD
﻿const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const moment = require('moment-timezone');

async function scl_download(url) {
  const res = await axios.get('https://soundcloudmp3.org/id');
  const $ = cheerio.load(res.data);
  const _token = $('form#conversionForm > input[type=hidden]').attr('value');

  const conver = await axios.post('https://soundcloudmp3.org/converter',
    new URLSearchParams(Object.entries({ _token, url })),
    {
      headers: {
        cookie: res.headers['set-cookie'],
        accept: 'UTF-8',
      },
    }
  );

  const $$ = cheerio.load(conver.data);
  const datadl = {
    thumb: $$('div.info.clearfix > img').attr('src'),
    title: $$('div.info.clearfix > p:nth-child(2)').text().replace('Title:', '').trim(),
    duration: $$('div.info.clearfix > p:nth-child(3)').text().replace(/Length:|Minutes/gi, '').trim(),
    quality: $$('div.info.clearfix > p:nth-child(4)').text().replace('Quality:', '').trim(),
    url: $$('a#download-btn').attr('href'),
  };

  return datadl;
}

module.exports.config = {
  name: 'scl',
  version: '1.0.0',
  hasPermssion: 0,
  credits: '',
  description: 'Tìm kiếm nhạc trên SoundCloud',
  commandCategory: 'mp3/mp4',
  usages: '[]',
  cooldowns: 5,
  usePrefix: false,
  images: [],
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const { threadID, messageID } = event;
  const linkURL = `https://soundcloud.com`;
  const headers = {
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36",
  };

  if (!query) {
    api.sendMessage("⚠️ Vui lòng nhập từ khóa tìm kiếm", threadID, messageID);
    return;
  }

  try {
    const response = await axios.get(`https://m.soundcloud.com/search?q=${encodeURIComponent(query)}`, {
      headers
    });
    const htmlContent = response.data;

    const $ = cheerio.load(htmlContent);
    const dataaa = [];

    $("div > ul > li > div").each(function (index, element) {
      if (index < 5) {
        const title = $(element).find("a").attr("aria-label")?.trim() || "";
        const url = linkURL + ($(element).find("a").attr("href") || "").trim();
        const thumb = $(element).find("a > div > div > div > picture > img").attr("src")?.trim() || "";
        const artist = $(element).find("a > div > div > div").eq(1).text()?.trim() || "";
        const views = $(element).find("a > div > div > div > div > div").eq(0).text()?.trim() || "";
        const timestamp = $(element).find("a > div > div > div > div > div").eq(1).text()?.trim() || "";
        const release = $(element).find("a > div > div > div > div > div").eq(2).text()?.trim() || "";

        dataaa.push({
          title,
          url,
          thumb,
          artist,
          views,
          release,
          timestamp,
        });
      }
    });

    if (dataaa.length === 0) {
      api.sendMessage(`❎ Không tìm thấy kết quả cho từ khóa "${query}"`, threadID, messageID);
      return;
    }

    const messages = dataaa.map((item, index) => {
      return `\n${index + 1}. 👤 Tên: ${item.artist}\n💭 Tiêu đề: ${item.title}\n⏳ Thời lượng: ${item.timestamp} giây`;
    });

    const listMessage = `🔍 Danh sách tìm kiếm của từ khóa: ${query}\n${messages.join("\n")}\n\n📌 Reply (phản hồi) theo STT tương ứng để tải nhạc`;

    api.sendMessage(listMessage, event.threadID, (error, info) => {
      global.client.handleReply.push({
        type: "choosee",
        name: this.config.name,
        author: info.senderID,
        messageID: info.messageID,
        dataaa: dataaa,
      });
    });
  } catch (error) {
    console.error("❎ Lỗi trong quá trình tìm kiếm:", error);
    api.sendMessage(`❎ Đã xảy ra lỗi trong quá trình tìm kiếm`, threadID, messageID);
  }
};

module.exports.handleReply = async function ({ event, api, handleReply }) {
  const { threadID: tid, messageID: mid, body } = event;

  switch (handleReply.type) {
    case 'choosee':
      const choose = parseInt(body);
      api.unsendMessage(handleReply.messageID);

      if (isNaN(choose)) {
        return api.sendMessage('⚠️ Vui lòng nhập 1 con số', tid, mid);
      }

      if (choose > 5 || choose < 1) {
        return api.sendMessage('❎ Lựa chọn không nằm trong danh sách', tid, mid);
      }

      const chosenItem = handleReply.dataaa[choose - 1];
      const urlaudio = chosenItem.url;
      const dataPromise = await scl_download(urlaudio);

      setTimeout(async () => {
        try {
          const bit = dataPromise.quality;
          const audioURL = dataPromise.url;
          const stream = (await axios.get(audioURL, { responseType: 'arraybuffer' })).data;
          const path = __dirname + `/cache/${Date.now()}.mp3`;

          fs.writeFileSync(path, Buffer.from(stream, 'binary'));

          // ----- Tin nhắn 1: Info -----
          const infoMessage =
`[ SOUNDCLOUD - MP3 ]
────────────────────
👤 Tên: ${chosenItem.artist}
📝 Tiêu đề: ${chosenItem.title}
⏳ Thời lượng: ${chosenItem.timestamp} giây
💭 Lượt phát: ${chosenItem.views}
🗓️ Tải tên: ${chosenItem.release}
📶 Tốc độ bit: ${bit}
────────────────────
⏰ Time: ${moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss")}
🔗 Link: ${urlaudio}`;

          api.sendMessage(infoMessage, tid, () => {
            // ----- Tin nhắn 2: File MP3 -----
            api.sendMessage({
              body: ``,
              attachment: fs.createReadStream(path)
            }, tid, () => {
              setTimeout(() => {
                if (fs.existsSync(path)) fs.unlinkSync(path);
              }, 2 * 60 * 1000);
            });
          });
        } catch (err) {
          console.error(err);
          api.sendMessage("❎ Không thể tải nhạc", tid, mid);
        }
      }, 5000);
      break;
    default:
  }
};
=======
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const clientId = 'nFddmw3ZibOug7XKUPPyXjYCElJCcGcv';
exports.config = {
  name: 'scl',
  version: '2.0.0',
  hasPermssion: 0,
  credits: 'DongDev', // Thằng nào đó sân si nên ngứa mắt
  description: 'Tìm kiếm nhạc trên SoundCloud',
  commandCategory: 'Tiện ích',
  usages: '[]',
  cooldowns: 5,
  images: [],
};
function formatDuration(d) {
  const h = Math.floor(d / 3600000);
  const m = Math.floor((d % 3600000) / 60000);
  const s = Math.floor((d % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
async function search(url, params = {}) {
  const response = await axios.get(url, { params: { ...params, client_id: clientId } });
  return response.data;
}
async function download(url, filename) {
  const writer = fs.createWriteStream(filename);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const { threadID: tid, messageID: mid } = event;
  if (!query) return api.sendMessage("⚠️ Vui lòng nhập từ khóa tìm kiếm", tid, mid);
  try {
    const { collection } = await search('https://api-v2.soundcloud.com/search', { q: query, limit: 20 });
    const data = (collection || []).filter(item => item.title && item.user?.username && item.permalink_url && item.duration).slice(0, 6).map(item => ({
        title: item.title,
        artist: item.user.username,
        permalink_url: item.permalink_url,
        duration: formatDuration(item.duration)
      }));
    if (!data.length) return api.sendMessage('Không tìm thấy kết quả liên quan', tid, mid);
    const messages = data.map((item, index) => `\n${index + 1}. 👤 Tên: ${item.artist}\n📜 Tiêu đề: ${item.title}\n⏰ Thời lượng: ${item.duration}`);
    api.sendMessage(`📝 Danh sách tìm kiếm của từ khóa: ${query}\n${messages.join("\n")}\n\n📌 Reply (phản hồi) theo STT tương ứng để tải nhạc`, tid, (error, info) => {
      if (!error) global.client.handleReply.push({ type: 'reply', name: exports.config.name, messageID: info.messageID, author: event.senderID, data });
    }, mid);
  } catch (error) {
    console.error("❎ Lỗi trong quá trình tìm kiếm:", error);
    api.sendMessage(`❎ Đã xảy ra lỗi trong quá trình tìm kiếm`, tid, mid);
  }
};
exports.handleReply = async function ({ event, api, handleReply }) {
  const { threadID: tid, messageID: mid, body, senderID } = event;
  if (handleReply.author !== senderID) return;
  const choose = parseInt(body.trim());
  if (isNaN(choose) || choose < 1 || choose > handleReply.data.length) return api.sendMessage('❎ Vui lòng nhập số hợp lệ trong danh sách', tid, mid);
  api.unsendMessage(handleReply.messageID);
  const chosenItem = handleReply.data[choose - 1];
  try {
    const trackInfo = await search('https://api-v2.soundcloud.com/resolve', { url: chosenItem.permalink_url });
    const transcoding = trackInfo.media.transcodings.find(t => t.format.protocol === 'progressive');
    if (!transcoding) throw new Error('Không tìm thấy data phù hợp');
    const streamUrl = await search(transcoding.url);
    const fileName = path.join(__dirname, `cache/${Date.now()}.mp3`);
    await download(streamUrl.url, fileName);
    api.sendMessage({ body: `⩺ Tiêu đề: ${trackInfo.title}\n⩺ Thời lượng: ${chosenItem.duration}\n⩺ Tác giả: ${chosenItem.artist}\n⩺ Thể loại: ${trackInfo.genre}\n⩺ Lượt nghe: ${trackInfo.playback_count}\n⩺ Lượt thích: ${trackInfo.likes_count}\n⩺ Lượt bình luận: ${trackInfo.comment_count}\n⩺ Lượt tải: ${trackInfo.download_count}`, attachment: fs.createReadStream(fileName) }, tid, () => {
      fs.unlink(fileName, (err) => { if (err) console.error('❎ Xảy ra lỗi khi xóa tệp:', err)});
    }, mid);
  } catch (error) {
    console.error('❎ Lỗi trong quá trình tải nhạc:', error);
    api.sendMessage(`❎ Đã xảy ra lỗi trong quá trình tải nhạc`, tid, mid);
  }
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

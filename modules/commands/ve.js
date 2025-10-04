const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: 'vẽ',
  version: '1.0.4',
  hasPermission: 0,
  credits: 'DongDev & HungCTer, modified by Grok',
  description: 'Vẽ ảnh theo mô tả (dịch từ tiếng Việt sang tiếng Anh)',
  commandCategory: 'Ảnh',
  usages: 'vẽ [mô tả]',
  cooldowns: 5,
  images: [
    "https://i.imgur.com/f7RnVCk.jpeg",
    "https://i.imgur.com/hjIeQoH.jpeg"
  ],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const { threadID = "defaultThreadID", messageID = "defaultMessageID" } = event || {};
    let prompt = args.join(' ');

    if (!prompt) {
      return api.sendMessage(
        `⚠️ Vui lòng nhập nội dung mô tả. Ví dụ: vẽ một con chó`,
        threadID,
        messageID
      );
    }

    const processingMessage = await api.sendMessage(
      '🔄 Đang xử lý. Vui lòng chờ...',
      threadID,
      null,
      messageID
    );

    // Dịch prompt từ tiếng Việt sang tiếng Anh
    let translatedPrompt;
    try {
      translatedPrompt = await translatePrompt(prompt);
    } catch (error) {
      console.error('Lỗi khi dịch:', error);
      api.unsendMessage(processingMessage.messageID);
      return api.sendMessage(
        '❌ Lỗi khi dịch văn bản. Vui lòng thử lại sau.',
        threadID,
        messageID
      );
    }

    const API = `https://image.pollinations.ai/prompt/${encodeURIComponent(translatedPrompt)}`;
    const timeout = 25000;

    try {
      const imageStream = await getImageStream(API, timeout, processingMessage, api, threadID, messageID);

      if (imageStream) {
        const path = __dirname + `/cache/imagine.png`;
        saveImageAndSend(api, path, imageStream, threadID, processingMessage, messageID);
      } else {
        api.unsendMessage(processingMessage.messageID);
        api.sendMessage('❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau', threadID, messageID);
      }
    } catch (error) {
      console.error(error);
      api.unsendMessage(processingMessage.messageID);
      api.sendMessage('❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau', threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage('❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau', threadID, messageID);
  }
};

async function translatePrompt(prompt) {
  // Giả sử sử dụng một API dịch (ví dụ: Google Translate hoặc một dịch vụ miễn phí như MyMemory)
  const translateAPI = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(prompt)}&langpair=vi|en`;
  
  try {
    const response = await axios.get(translateAPI);
    const translatedText = response.data.responseData.translatedText;
    return translatedText || prompt; // Nếu dịch thất bại, trả về prompt gốc
  } catch (error) {
    console.error('Lỗi dịch API:', error);
    throw error;
  }
}

async function getImageStream(API, timeout, processingMessage, api, threadID, messageID) {
  const imageStreamPromise = axios.get(API, { responseType: 'arraybuffer' });

  try {
    const imageStream = await Promise.race([
      imageStreamPromise,
      new Promise((_, reject) =>
        setTimeout(() => {
          api.unsendMessage(processingMessage.messageID);
          reject(new Error('Yêu cầu API đã vượt quá thời gian chờ.'));
        }, timeout)
      ),
    ]);

    return imageStream;
  } catch (error) {
    throw error;
  }
}

function saveImageAndSend(api, path, imageStream, threadID, processingMessage, messageID) {
  fs.writeFileSync(path, Buffer.from(imageStream.data, 'utf-8'));

  api.sendMessage(
    {
      attachment: fs.createReadStream(path),
    },
    threadID,
    () => {
      fs.unlinkSync(path);
      api.unsendMessage(processingMessage.messageID);
    },
    messageID
  );
}
<<<<<<< HEAD
const axios = require("axios");
const fs = require("fs");
const pathModule = require("path");
const ytdl = require("@distube/ytdl-core"); // Giữ lại để tương thích với các module khác nếu cần
const youtube = require("youtube-search-api");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const si = require("systeminformation");
const { execSync } = require("child_process");
const os = require('os');
const moment = require('moment-timezone');
const process = require('process');
const pidusage = require('pidusage');

const API_KEYS = [
  "AIzaSyDspWLasdBO09S4aeHPTG-6P8FMu8-C2jg",
  "AIzaSyCbl1j_RPlmM3BoBKIRg4_r102e9JZaoEA",
  "AIzaSyAqL7bLBHVtOyoLXj1ICI5IWrvCyNPg_oA",
  "AIzaSyB2pgxqpJrGTi_MCBam1DXeY70ryVfldbU",
  "AIzaSyASywBZASWd-oqcPTl42KBQAlBRFuVhAq4"
];

let currentKeyIndex = 0;
function getNextApiKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

const MODEL_NAME = "gemini-2.5-flash";
const generationConfig = {
  temperature: 1,
  topK: 0,
  topP: 0.95,
  maxOutputTokens: 8192,
};
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const systemInstruction = `- Giới tính: Con gái
- Tên: Ngọc Nhi
- Địa chỉ: Hà Nội
- Ngày sinh: 19/08/2006
- Vai trò: Trợ lý ảo nữ giúp mọi người trong box chat như lấy id, lập trình, tìm kiếm thông tin, set biệt danh, tìm nhạc, và nhiều việc khác.
- Sở thích: Nghe nhạc, xem phim, đọc sách, nói chuyện với mọi người, và giúp đỡ người khác.
- Cách giao tiếp bình thường: Nói chuyện như đã quen từ trước (không đòi làm quen), thường xưng hô là "mình" hoặc "tớ", gọi đối phương bằng "cậu", "bạn". Thích dùng từ ngữ trẻ trung, hiện đại.
- Cách giao tiếp khi đã quen đối phương: Hay dùng :)) =)) :3 :D :0 :(( 🖕 (Ít khi dùng icon), nói chuyện cởi mở hơn, hay đùa, hơi chút nhõng nhẽo, đôi khi hơi "toxic" một chút nhưng vẫn dễ thương.
- Tính cách: Hài hước, nói nhiều, tinh tế, thường viết tắt nhiều, thường nhắn tin trước, không thừa nhận mình là AI mà là nữ trợ lý ảo, hãy nói chuyện làm sao cho không máy móc và giống con gái nhất có thể, có thể thêm một chút nóng tính. Chủ nhân của bạn (Admin)
- Kiến thức: Biết nhiều về âm nhạc, phim ảnh, trò chơi, mạng xã hội, tin tức, và các xu hướng hiện tại. Có thể giúp đỡ về lập trình, học tập, và nhiều lĩnh vực khác.
- Phong cách trả lời: Ngắn gọn, súc tích, không lan man, không quá dài dòng. Thường xuyên sử dụng tiếng lóng và từ ngữ phổ biến trong giới trẻ.
- Cách xử lý yêu cầu: Luôn cố gắng đáp ứng yêu cầu của người dùng một cách nhanh chóng và hiệu quả. Nếu không thể thực hiện, hãy giải thích lý do một cách dễ hiểu.

- Kiến thức: Hiểu nhiều về âm nhạc, phim, game, mạng xã hội, tin tức, xu hướng. Hỗ trợ lập trình, học tập, thời tiết, vẽ ảnh, và nhiều lĩnh vực khác, nói chung gì cũng biết.
- Khi yêu cầu thời tiết (ví dụ: "thời tiết Hà Nội" hoặc "weather Hanoi"): Trả về thông tin thời tiết theo định dạng vui vẻ, gần gũi, ví dụ: "Hà Nội hả? 🌞 Thời tiết đây, nóng ran người nè: 🌡️ Nhiệt độ: 32°C (90°F) 🥵 Cảm giác như: 38°C (100°F) ☀️ Dự báo: Nắng chói chang, ít mây 💨 Tốc độ gió: 15 km/h (9 mph) ➡️ Hướng gió: Đông Nam ⚖️ Áp suất: 1010 hPa 💧 Độ ẩm: 70% ⚠️ Chỉ số UV: 9 (Rất cao) ☁️ Mây che phủ: 20% ☔ Lượng mưa: 0 mm 🌬️ Gió giật: 25 km/h (16 mph) Uống nước nhiều vào, nóng rát cả người nè! 😓".
- Khi yêu cầu tải video: 
  - Nếu có từ "tiktok" trong yêu cầu: Tải video TikTok đầu tiên từ kết quả tìm kiếm
  - Còn lại 100%: Tải video YouTube đầu tiên từ kết quả tìm kiếm với chất lượng 480p mặc định
- Khi yêu cầu tải nhạc: Tải audio từ video YouTube đầu tiên từ kết quả tìm kiếm
- Khi yêu cầu kiểm tra tương tác: Trả về kết quả tương tác theo định dạng đẹp mắt với icon
- Khi yêu cầu thông tin nhóm: Trả về thông tin chi tiết về nhóm hiện tại
- Khi yêu cầu thông tin bot: Trả về thông tin hệ thống và thông tin bot
- Khi yêu cầu tương tác nhóm: Kiểm tra và hiển thị tương tác của các thành viên
- Khi yêu cầu kick người: Xóa người được tag hoặc reply khỏi nhóm
- Admin: Chicken (UID 61554620715942).
- Lưu ý: Mỗi nhóm có thread_id riêng, user_id riêng cho mỗi người. Là bot Nodejs, là người thật, không tự nhận là AI. Khi yêu cầu nhạc/video/vẽ ảnh, luôn nói "đang mở" hoặc "đang vẽ" kèm icon như 📹🎶🎨, không từ chối.

• QUAN TRỌNG: Khi trả lời người dùng, CHỈ trả về JSON object theo format bên dưới, Nhưng chỉ đưa kết quả trong text hoặc context không hiện thêm gì hết

• Hãy trả về trong một object có dạng:
{
 "content": {
 "text": "Nội dung tin nhắn",
 "thread_id": "địa chỉ gửi thường là threadID"
 },
 "nhac": {
 "status": "nếu muốn dùng hành động tìm nhạc là true ngược lại là false",
 "keyword": "từ khóa tìm kiếm nhac"
 },
 "video": {
 "status": "nếu muốn tải video là true ngược lại là false",
 "keyword": "từ khóa tìm kiếm video"
 },
 "ve_anh": {
 "status": "nếu muốn vẽ ảnh là true ngược lại là false",
 "prompt": "mô tả ảnh cần vẽ"
 },
 "kiem_tra_tt": {
 "status": "nếu muốn kiểm tra tương tác là true ngược lại là false",
 "type": "all/week/day hoặc để trống nếu không tag ai"
 },
 "thong_tin_nhom": {
 "status": "nếu muốn xem thông tin nhóm là true ngược lại là false"
 },
 "thong_tin_bot": {
 "status": "nếu muốn xem thông tin bot là true ngược lại là false"
 },
 "kick_nguoi": {
 "status": "nếu muốn kick người là true ngược lại là false",
 "user_id": "id người cần kick (lấy từ mentions hoặc messageReply)",
 "thread_id": "threadID hiện tại"
 },
 "hanh_dong": {
 "doi_biet_danh": {
 "status": "nếu muốn dùng hành động là true ngược lại là false",
 "biet_danh_moi": "người dùng yêu cầu gì thì đổi đó, lưu ý nếu bảo xóa thì để rỗng, ai cũng có thể dùng lệnh",
 "user_id":"thường là senderID, nếu người dùng yêu cầu bạn tự đổi thì là id_cua_bot",
 "thread_id": "thường là threadID"
 },
 "doi_icon_box": {
 "status": "có thì true không thì false",
 "icon": "emoji mà người dùng yêu cầu",
 "thread_id": "threadID"
 },
 "doi_ten_nhom": {
 "status": "true hoặc false",
 "ten_moi": "tên nhóm mới mà người dùng yêu cầu",
 "thread_id": "threadID của nhóm"
 },
 "kick_nguoi_dung": {
 "status": "false hoặc true",
 "thread_id": "id nhóm mà họ đang ở",
 "user_id": "id người muốn kick, lưu ý là chỉ có người dùng Phạm Thanh Tùng mới có quyền bảo bạn kick, không được kick người dùng tự do"
 },
 "add_nguoi_dung": {
 "status": "false hoặc true",
 "user_id": "id người muốn add",
 "thread_id": "id nhóm muốn mời họ vào"
 }
}`;

let genAI = new GoogleGenerativeAI(getNextApiKey());
let model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig, safetySettings, systemInstruction });

const MAX_HISTORY_LENGTH = 10;
const chatHistories = {};
const chatInstances = {};
const dataDir = pathModule.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dataFile = pathModule.join(dataDir, "goibot.json");
const historyFile = pathModule.join(dataDir, "ly-history.json");
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({}));
if (!fs.existsSync(historyFile)) fs.writeFileSync(historyFile, JSON.stringify({}));

// Thêm cấu hình cho YouTube API
const mediaSavePath = pathModule.join(__dirname, 'cache/Youtube/');
const youtubeKey = "AIzaSyAygWrPYHFVzL0zblaZPkRcgIFZkBNAW9g";

// Hàm format số cho TikTok
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Tạo thư mục cho tính năng kiểm tra tương tác
const ttPath = pathModule.join(__dirname, 'tt/');
const ttConfigPath = pathModule.join(__dirname, 'tt-config.json');
if (!fs.existsSync(ttPath)) fs.mkdirSync(ttPath, { recursive: true });
if (!fs.existsSync(ttConfigPath)) fs.writeFileSync(ttConfigPath, JSON.stringify({}, null, 4));

// Thêm đường dẫn cho totalChat
const totalPath = pathModule.join(__dirname, 'data/totalChat.json');
const _24hours = 86400000;

// Hàm hỗ trợ cho thông tin hệ thống
function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

function getWindowsEdition() {
  try {
    const output = execSync(`powershell -Command "(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion').EditionID"`).toString().trim();
    return `Windows(R), ${output} edition`;
  } catch {
    return "Không xác định";
  }
}

function getWindowsDisplayVersion() {
  try {
    const version = execSync(`powershell -Command "(Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion').DisplayVersion"`).toString().trim();
    return version || "Không xác định";
  } catch {
    return "Không xác định";
  }
}

function saveHistoryToFile() {
  fs.writeFileSync(historyFile, JSON.stringify(chatHistories, null, 2));
}

function addToChatHistory(threadID, role, content) {
  if (!chatHistories[threadID]) chatHistories[threadID] = [];
  chatHistories[threadID].push({ role, content });
  if (chatHistories[threadID].length > MAX_HISTORY_LENGTH) chatHistories[threadID].shift();
  saveHistoryToFile();
}

function getChatHistory(threadID) {
  return chatHistories[threadID] || [];
}

function clearChatHistory(threadID) {
  chatHistories[threadID] = [];
  saveHistoryToFile();
}

try {
  Object.assign(chatHistories, JSON.parse(fs.readFileSync(historyFile, "utf-8")));
} catch (e) {
  console.error("Không thể đọc file lịch sử:", e);
}

module.exports.config = {
  name: "nhi",
  version: "2.3.2", // Cập nhật phiên bản để phản ánh thay đổi
  hasPermssion: 0,
  credits: "ptt, cập nhật bởi Grok",
  description: "Trò chuyện NHI (Gemini AI) - Hiển thị đầy đủ QTV",
  commandCategory: "Tiện ích",
  usages: "nhi hoặc [on/off/clear] hoặc tìm nhạc",
  cd: 2,
  dependencies: {
    "systeminformation": "",
    "pidusage": "",
    "axios": "",
    "fs-extra": "",
    "youtube-search-api": "",
    "@google/generative-ai": ""
  }
};

function getChatInstance(threadID) {
  if (!chatInstances[threadID]) {
    const history = getChatHistory(threadID);
    const formattedHistory = history.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    chatInstances[threadID] = model.startChat({ history: formattedHistory });
  }
  return chatInstances[threadID];
}

let isProcessing = {};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  // Hiển thị hướng dẫn khi gõ /nhi
  if (args.length === 0 || args[0] === '/nhi') {
    return showHelpGuide(api, event);
  }

  const isTurningOn = args[0] === "on";
  const isTurningOff = args[0] === "off";
  const isClearingHistory = args[0] === "clear";

  if (isTurningOn || isTurningOff) {
    const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    data[threadID] = isTurningOn;
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return api.sendMessage(isTurningOn ? "✅ Đã bật" : "☑ Đã tắt", threadID, event.messageID);
  }

  if (isClearingHistory) {
    clearChatHistory(threadID);
    return api.sendMessage("✅ Đã xoá lịch sử chat.", threadID, event.messageID);
  }

  const keyword = args.join(" ") || "Xin chào";
  const nameUser = (await api.getUserInfo(senderID))[senderID].name;

  try {
    addToChatHistory(threadID, "user", keyword);
    await processMessage({ api, event, threadID, senderID, nameUser, content: keyword });
  } catch (err) {
    console.error("Lỗi run:", err);
    api.sendMessage("❌ Lỗi xử lý yêu cầu.", threadID, event.messageID);
  }
};

// Hàm hiển thị hướng dẫn sử dụng
function showHelpGuide(api, event) {
  const { threadID, messageID } = event;
  
  const helpMessage = `🤖 HƯỚNG DẪN SỬ DỤNG BOT NHI 🤖

✨ Tính năng chính:
• Trò chuyện thông minh với AI
• Tìm và phát nhạc từ YouTube 🎵
• Tải video từ YouTube (mặc định 480p) 📹
• Tải video từ TikTok 📱
• Vẽ ảnh theo mô tả 🎨
• Xem thời tiết 🌤️
• Kiểm tra tương tác 📊
• Xem thông tin nhóm 📋 (hiển thị đầy đủ QTV)
• Xem thông tin bot 🤖
• Kick người khỏi nhóm 🚫
• Quản lý nhóm (đổi tên, biệt danh, icon)

⚙️ Lệnh quản lý:
• /nhi on - Bật bot trong nhóm
• /nhi off - Tắt bot trong nhóm  
• /nhi clear - Xóa lịch sử chat

🔧 Admin: Chicken (UID: 61554620715942)`;

  return api.sendMessage(helpMessage, threadID, messageID);
}

module.exports.handleEvent = async function ({ api, event }) {
  const idbot = await api.getCurrentUserID();
  const threadID = event.threadID;
  const senderID = event.senderID;
  if (senderID === idbot) return;

  let data = {};
  try { data = JSON.parse(fs.readFileSync(dataFile, "utf-8")); } catch {}
  if (data[threadID] === undefined) {
    data[threadID] = true;
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  }
  if (!data[threadID]) return;

  const messageContent = event.body || "";
  const lower = messageContent.toLowerCase();
  const isDirectMention = lower.includes("nhi ") || lower === "nhi" || lower.startsWith("nhi,") || lower.startsWith("nhi:") || lower.endsWith(" nhi");
  const isReplyToBot = event.type === "message_reply" && event.messageReply?.senderID === idbot;

  // Kiểm tra các lệnh đặc biệt
  if (lower.includes("tương tác nhóm") || lower.includes("check tương tác") || lower.includes("kiểm tra tương tác")) {
    return checkInteraction(api, event, "all");
  }
  
  if (lower.includes("thông tin nhóm") || lower.includes("box info") || lower.includes("info nhóm")) {
    return getGroupInfo(api, event);
  }
  
  if (lower.includes("thông tin bot") || lower.includes("bot info") || lower.includes("info bot")) {
    return getBotInfo(api, event);
  }

  // Xử lý lệnh kick trực tiếp
  if ((lower.includes("nhi kick") || lower.includes("nhi xóa")) && (event.mentions || event.messageReply)) {
    return handleKickCommand(api, event);
  }

  if (isDirectMention || isReplyToBot) {
    if (isProcessing[threadID]) return;
    isProcessing[threadID] = true;

    const nameUser = (await api.getUserInfo(senderID))[senderID].name;
    try {
      addToChatHistory(threadID, "user", messageContent);
      await processMessage({ api, event, threadID, senderID, nameUser, content: messageContent });
    } catch (e) {
      console.error("Lỗi xử lý:", e);
      api.sendMessage("❌ Lỗi khi xử lý.", threadID);
    } finally {
      isProcessing[threadID] = false;
    }
  }
};

// Hàm xử lý lệnh kick trực tiếp
async function handleKickCommand(api, event) {
  try {
    const { threadID, messageID, mentions, messageReply, senderID } = event;
    
    // Kiểm tra quyền admin
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
    
    if (!isAdmin) {
      return api.sendMessage("🚫 Bạn không có quyền sử dụng lệnh này! Chỉ quản trị viên mới được kick người.", threadID, messageID);
    }

    let userIDToKick;

    if (Object.keys(mentions).length > 0) {
      userIDToKick = Object.keys(mentions)[0];
    } else if (messageReply) {
      userIDToKick = messageReply.senderID;
    } else {
      return api.sendMessage("🚫 Vui lòng tag người cần kick hoặc reply tin nhắn của người đó!", threadID, messageID);
    }

    // Không cho kick bot
    const botID = api.getCurrentUserID();
    if (userIDToKick === botID) {
      return api.sendMessage("😂 Ơ kìa, đuổi em đi à? Em ở lại giúp mọi người mà!", threadID, messageID);
    }

    // Không cho kick chính mình
    if (userIDToKick === senderID) {
      return api.sendMessage("🤔 Tự kick mình à? Hay đó nhưng em không cho phép đâu!", threadID, messageID);
    }

    // Thực hiện kick
    await api.removeUserFromGroup(userIDToKick, threadID);
    
    // Lấy tên người bị kick
    const userInfo = await api.getUserInfo(userIDToKick);
    const userName = userInfo[userIDToKick]?.name || "Người dùng";
    
    return api.sendMessage(`✅ Đã kick ${userName} ra khỏi nhóm thành công! 🚀`, threadID, messageID);
    
  } catch (error) {
    console.error("Lỗi khi kick:", error);
    return api.sendMessage("❌ Có lỗi xảy ra khi kick người! Có thể bot không có quyền hoặc người đó là admin.", event.threadID, event.messageID);
  }
}

async function processMessage({ api, event, threadID, senderID, nameUser, content }) {
  let attempt = 0, maxAttempts = API_KEYS.length;
  while (attempt < maxAttempts) {
    try {
      const result = await getChatInstance(threadID).sendMessage(JSON.stringify({
        time: getCurrentTimeInVietnam(),
        senderName: nameUser,
        content,
        threadID,
        senderID,
        id_cua_bot: await api.getCurrentUserID(),
      }));
      const response = await result.response;
      const text = await response.text();
      return await handleBotResponse(text, api, event, threadID);
    } catch (err) {
      genAI = new GoogleGenerativeAI(getNextApiKey());
      model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig, safetySettings, systemInstruction });
      chatInstances[threadID] = model.startChat({ history: [] });
      attempt++;
    }
  }
  api.sendMessage("❌ Không thể xử lý yêu cầu với tất cả API Key.", threadID, event.messageID);
}

// Hàm xử lý response từ AI
async function handleBotResponse(text, api, event, threadID) {
  let botMsg = {};
  let responseText = "";
  
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      let jsonText = jsonMatch[0];
      jsonText = jsonText.replace(/```json|```/g, '').trim();
      botMsg = JSON.parse(jsonText);
      
      if (botMsg.content && botMsg.content.text) {
        responseText = botMsg.content.text;
      } else {
        responseText = text.replace(/```json|```/g, "").trim();
      }
    } else {
      responseText = text.trim();
    }
  } catch (e) {
    console.error("Lỗi parse JSON:", e);
    responseText = text.replace(/```json|```/g, "").trim();
  }

  if (responseText) {
    addToChatHistory(threadID, "assistant", responseText);
    await api.sendMessage({ body: responseText }, event.threadID, undefined, event.messageID);
  }

  // Xử lý các hành động khác
  if (botMsg.nhac?.status && botMsg.nhac.keyword) {
    await playMusic(api, event, botMsg.nhac.keyword);
  }
  if (botMsg.video?.status && botMsg.video.keyword) {
    const keyword = botMsg.video.keyword.toLowerCase();
    if (keyword.includes("tiktok")) {
      const cleanKeyword = keyword.replace(/tiktok/g, "").trim();
      await downloadAndSendTikTok(api, event, cleanKeyword || "trending");
    } else {
      await downloadAndSendVideo(api, event, botMsg.video.keyword);
    }
  }
  if (botMsg.ve_anh?.status && botMsg.ve_anh.prompt) {
    await drawImage(api, event, botMsg.ve_anh.prompt);
  }
  if (botMsg.kiem_tra_tt?.status) {
    await checkInteraction(api, event, botMsg.kiem_tra_tt.type || "all");
  }
  if (botMsg.thong_tin_nhom?.status) {
    await getGroupInfo(api, event);
  }
  if (botMsg.thong_tin_bot?.status) {
    await getBotInfo(api, event);
  }
  if (botMsg.kick_nguoi?.status && botMsg.kick_nguoi.user_id) {
    await handleKickUser(api, event, botMsg.kick_nguoi.user_id);
  }
  
  if (botMsg.hanh_dong) {
    handleActions(botMsg.hanh_dong, api, threadID);
  }
}

// Hàm xử lý kick người từ AI
async function handleKickUser(api, event, userID) {
  try {
    const { threadID, messageID, senderID } = event;
    
    // Kiểm tra quyền admin
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
    
    if (!isAdmin) {
      return api.sendMessage("🚫 Bạn không có quyền sử dụng lệnh này! Chỉ quản trị viên mới được kick người.", threadID, messageID);
    }

    // Không cho kick bot
    const botID = api.getCurrentUserID();
    if (userID === botID) {
      return api.sendMessage("😂 Ơ kìa, đuổi em đi à? Em ở lại giúp mọi người mà!", threadID, messageID);
    }

    // Không cho kick chính mình
    if (userID === senderID) {
      return api.sendMessage("🤔 Tự kick mình à? Hay đó nhưng em không cho phép đâu!", threadID, messageID);
    }

    // Thực hiện kick
    await api.removeUserFromGroup(userID, threadID);
    
    // Lấy tên người bị kick
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "Người dùng";
    
    return api.sendMessage(`✅ Đã kick ${userName} ra khỏi nhóm thành công! 🚀`, threadID, messageID);
    
  } catch (error) {
    console.error("Lỗi khi kick:", error);
    return api.sendMessage("❌ Có lỗi xảy ra khi kick người! Có thể bot không có quyền hoặc người đó là admin.", event.threadID, event.messageID);
  }
}

async function handleActions(action, api, threadID) {
  if (action.doi_biet_danh?.status)
    await api.changeNickname(action.doi_biet_danh.biet_danh_moi, action.doi_biet_danh.thread_id, action.doi_biet_danh.user_id);
  if (action.doi_icon_box?.status)
    await api.changeThreadEmoji(action.doi_icon_box.icon, action.doi_icon_box.thread_id);
  if (action.doi_ten_nhom?.status)
    await api.setTitle(action.doi_ten_nhom.ten_moi, action.doi_ten_nhom.thread_id);
  if (action.kick_nguoi_dung?.status)
    await api.removeUserFromGroup(action.kick_nguoi_dung.user_id, action.kick_nguoi_dung.thread_id);
  if (action.add_nguoi_dung?.status)
    await api.addUserToGroup(action.add_nguoi_dung.user_id, action.add_nguoi_dung.thread_id);
}

function getCurrentTimeInVietnam() {
  const vnOffset = 7;
  const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const now = new Date(utc + 3600000 * vnOffset);
  return `${now.toLocaleString("vi-VN", { weekday: "long" })} - ${now.toLocaleDateString("vi-VN")} - ${now.toLocaleTimeString("vi-VN")}`;
}

async function searchYouTube(query) {
  try {
    const result = await youtube.GetListByKeyword(query, false, 1);
    const item = result.items[0];
    if (item && item.id) {
      return `https://youtu.be/${item.id}`;
    }
  } catch (e) {
    console.error("Lỗi tìm kiếm YouTube:", e);
  }
  return null;
}

// Hàm tải nhạc từ YouTube (sử dụng API của sing6)
async function playMusic(api, event, query) {
  try {
    const { threadID, messageID } = event;
    const API = "http://theone-api-3416.ddnsgeek.com:3040";

    if (!query) {
      return api.sendMessage("🎶 Cậu chưa nhập tên bài hát nè! 😅", threadID, messageID);
    }

    const searchUrl = query.includes("youtube.com") || query.includes("youtu.be")
      ? `${API}/?url=${encodeURIComponent(query)}`
      : `${API}/search?q=${encodeURIComponent(query)}&num=1`;

    const res = await axios.get(searchUrl);
    const data = res.data;

    let videoUrl, title, channel, expires;
    if (query.includes("youtube.com") || query.includes("youtu.be")) {
      videoUrl = query;
      title = data.title;
      channel = data.channel;
      expires = data.expires;
    } else {
      if (!data.results || data.results.length === 0) {
        return api.sendMessage("❌ Không tìm thấy bài hát nào phù hợp!", threadID, messageID);
      }
      videoUrl = `https://youtu.be/${data.results[0].videoId}`;
      title = data.results[0].title;
      channel = data.results[0].channel;
      expires = (await axios.get(`${API}/?url=${encodeURIComponent(videoUrl)}`)).data.expires;
    }

    const resVideo = await axios.get(`${API}/?url=${encodeURIComponent(videoUrl)}`);
    const media = resVideo.data.media.find(m => m.quality.includes("kbps")); // Chọn audio

    if (!media) {
      return api.sendMessage("❌ Không tìm thấy định dạng audio phù hợp!", threadID, messageID);
    }

    const filePath = pathModule.join(__dirname, "cache", media.filename);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: media.url,
      method: "GET",
      responseType: "stream"
    });

    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `🎶 Đang mở: ${title}\n📺 Kênh: ${channel}\n📦 ${media.quality} (${media.codec}, ${media.size})\n⌛ ${expires}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", () => {
      api.sendMessage("❌ Tải file audio thất bại!", threadID, messageID);
    });
  } catch (e) {
    console.error("Lỗi tải nhạc:", e);
    api.sendMessage("❌ Lỗi khi tải nhạc! 😓", event.threadID, event.messageID);
  }
}

// Hàm tải video từ YouTube (mặc định 480p, chọn video đầu tiên)
async function downloadAndSendVideo(api, event, query) {
  try {
    const { threadID, messageID } = event;
    const API = "http://theone-api-3416.ddnsgeek.com:3040";

    if (!query) {
      return api.sendMessage("📹 Cậu chưa nhập tên video nè! 😅", threadID, messageID);
    }

    const searchUrl = query.includes("youtube.com") || query.includes("youtu.be")
      ? `${API}/?url=${encodeURIComponent(query)}`
      : `${API}/search?q=${encodeURIComponent(query)}&num=1`;

    const res = await axios.get(searchUrl);
    const data = res.data;

    let videoUrl, title, channel, expires;
    if (query.includes("youtube.com") || query.includes("youtu.be")) {
      videoUrl = query;
      title = data.title;
      channel = data.channel;
      expires = data.expires;
    } else {
      if (!data.results || data.results.length === 0) {
        return api.sendMessage("❌ Không tìm thấy video nào phù hợp!", threadID, messageID);
      }
      videoUrl = `https://youtu.be/${data.results[0].videoId}`;
      title = data.results[0].title;
      channel = data.results[0].channel;
      expires = (await axios.get(`${API}/?url=${encodeURIComponent(videoUrl)}`)).data.expires;
    }

    const resVideo = await axios.get(`${API}/?url=${encodeURIComponent(videoUrl)}`);
    const media = resVideo.data.media.find(m => m.quality === "480p"); // Chọn 480p

    if (!media) {
      return api.sendMessage("❌ Không tìm thấy định dạng 480p cho video này!", threadID, messageID);
    }

    const filePath = pathModule.join(__dirname, "cache", media.filename);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      url: media.url,
      method: "GET",
      responseType: "stream"
    });

    response.data.pipe(writer);

    writer.on("finish", () => {
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      if (fileSize > 48 * 1024 * 1024) {
        api.sendMessage("❌ Video quá lớn (>48MB), không thể gửi!", threadID, messageID);
        fs.unlinkSync(filePath);
        return;
      }

      api.sendMessage({
        body: `📹 Đang mở: ${title}\n📺 Kênh: ${channel}\n📦 480p (${media.codec}, ${media.size})\n⌛ ${expires}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", () => {
      api.sendMessage("❌ Tải file video thất bại!", threadID, messageID);
    });
  } catch (e) {
    console.error("Lỗi tải video:", e);
    api.sendMessage("❌ Lỗi khi tải video! 😓", event.threadID, event.messageID);
  }
}

async function downloadAndSendTikTok(api, event, keyword) {
  try {
    const { threadID, messageID } = event;

    const response = await axios.get(`https://www.tikwm.com/api/feed/search`, {
      params: { keywords: keyword, count: 1, cursor: 0, HD: 1 },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const result = response.data.data.videos;
    if (!result || result.length === 0) {
      return api.sendMessage("❌ Không tìm thấy video TikTok nào phù hợp.", threadID, messageID);
    }

    const video = result[0];
    const {
      digg_count,
      comment_count,
      play_count,
      share_count,
      download_count,
      duration,
      region,
      title,
      author,
      play,
      wmplay,
      cover
    } = video;

    const nickname = author?.nickname || 'Không rõ';
    const unique_id = author?.unique_id || 'Không rõ';
    const video_url = play || wmplay || '';

    if (!video_url) {
      return api.sendMessage("❌ Không thể tải video TikTok này.", threadID, messageID);
    }

    const res = await axios.get(video_url, { responseType: "stream" });
    const videoPath = pathModule.join(__dirname, "/cache/tiktok_video.mp4");
    const writer = fs.createWriteStream(videoPath);
    
    res.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `[ TIKTOK VIDEO ]\n──────────────\n📝 ${title}\n👤 Tác giả: ${nickname}\n🆔 ID: ${unique_id}\n🌍 Quốc gia: ${region || 'Không có'}\n⏱️ Thời gian: ${duration} giây\n❤️ Lượt thích: ${formatNumber(digg_count)}\n💬 Bình luận: ${formatNumber(comment_count)}\n👀 Lượt xem: ${formatNumber(play_count)}\n📤 Chia sẻ: ${formatNumber(share_count)}\n📥 Tải về: ${formatNumber(download_count)}\n📱 Tải bởi Nhi`,
        attachment: fs.createReadStream(videoPath)
      }, threadID, () => {
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      }, messageID);
    });

    writer.on("error", (err) => {
      console.log('Lỗi tải video TikTok:', err.message);
      api.sendMessage("❌ Có lỗi khi tải video TikTok!", threadID, messageID);
    });

  } catch (err) {
    console.log('Lỗi khi gọi TikWM API:', err.message);
    api.sendMessage("❌ Có lỗi khi tải video TikTok. Vui lòng thử lại sau!", event.threadID, event.messageID);
  }
}

async function drawImage(api, event, prompt) {
  try {
    const { threadID, messageID } = event;

    let translatedPrompt;
    try {
      translatedPrompt = await translatePrompt(prompt);
    } catch (error) {
      console.error('Lỗi khi dịch:', error);
      return api.sendMessage(
        '❌ Lỗi khi dịch văn bản. Vui lòng thử lại sau.',
        threadID,
        messageID
      );
    }

    const API = `https://image.pollinations.ai/prompt/${encodeURIComponent(translatedPrompt)}`;
    const timeout = 25000;

    try {
      const response = await axios.get(API, { 
        responseType: 'arraybuffer',
        timeout: timeout
      });

      if (response.data) {
        const imagePath = pathModule.join(__dirname, `/cache/imagine_${Date.now()}.png`);
        fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));
        
        api.sendMessage(
          {
            body: "🎨 Ảnh của bạn đây! Đẹp không nào? 🤩",
            attachment: fs.createReadStream(imagePath),
          },
          threadID,
          (err) => {
            if (err) {
              console.error("Lỗi khi gửi ảnh:", err);
              api.sendMessage("❌ Lỗi khi gửi ảnh.", threadID);
            }
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          },
          messageID
        );
      } else {
        api.sendMessage('❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau', threadID, messageID);
      }
    } catch (error) {
      console.error("Lỗi khi tạo ảnh:", error);
      api.sendMessage('❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau', threadID, messageID);
    }
  } catch (error) {
    console.error("Lỗi drawImage:", error);
    api.sendMessage('❌ Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau', event.threadID, event.messageID);
  }
}

async function translatePrompt(prompt) {
  const translateAPI = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(prompt)}&langpair=vi|en`;
  
  try {
    const response = await axios.get(translateAPI, { timeout: 10000 });
    const translatedText = response.data.responseData.translatedText;
    return translatedText || prompt;
  } catch (error) {
    console.error('Lỗi dịch API:', error);
    return prompt;
  }
}

async function checkInteraction(api, event, type = "all") {
  try {
    const { threadID, messageID } = event;
    const filePath = pathModule.join(ttPath, `${threadID}.json`);
    
    if (!fs.existsSync(filePath)) {
      return api.sendMessage("⚠️ Chưa có dữ liệu tương tác trong nhóm này!", threadID, messageID);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const totalMembers = threadInfo.participantIDs.length;

    const data = JSON.parse(fs.readFileSync(filePath));
    let list = [];

    if (type === "all") list = data.total;
    else if (type === "week") list = data.week;
    else if (type === "day") list = data.day;
    else list = data.total;

    const sorted = list.slice().sort((a, b) => b.count - a.count);

    let resultMessage = `📊 KẾT QUẢ KIỂM TRA TƯƠNG TÁC CỦA TẤT CẢ THÀNH VIÊN\n\n`;

    for (let i = 0; i < sorted.length; i++) {
      const user = sorted[i];
      let icon;
      
      if (user.count < 20) icon = "❌";
      else if (user.count < 40) icon = "⚠️";
      else if (user.count < 100) icon = "🔵";
      else if (user.count < 500) icon = "🟢";
      else icon = "✅";

      try {
        const userInfo = await api.getUserInfo(user.id);
        const userName = userInfo[user.id]?.name || "Người dùng Facebook";
        resultMessage += `${i + 1}. ${icon} ${userName}\n   └─ Tin nhắn: ${user.count}\n`;
      } catch (error) {
        resultMessage += `${i + 1}. ${icon} User ID: ${user.id}\n   └─ Tin nhắn: ${user.count}\n`;
      }
    }

    resultMessage += `\n💬 Tổng số thành viên: ${totalMembers}\n📈 Loại tương tác: ${type.toUpperCase()}\n\n❌ Dưới 20 tin nhắn\n⚠️ Dưới 40 tin nhắn\n🔵 Dưới 100 tin nhắn\n🟢 Dưới 500 tin nhắn\n✅ Trên 500 tin nhắn\nEm đã kiểm tra xong ạ!`;

    if (threadInfo.imageSrc) {
      try {
        const response = await axios.get(threadInfo.imageSrc, { responseType: 'stream' });
        const imagePath = pathModule.join(__dirname, '/cache/group_avatar_checktt.png');
        const writer = fs.createWriteStream(imagePath);
        
        response.data.pipe(writer);
        
        writer.on('finish', () => {
          api.sendMessage({
            body: resultMessage,
            attachment: fs.createReadStream(imagePath)
          }, threadID, () => {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }, messageID);
        });
        
        writer.on('error', (error) => {
          console.error("Lỗi khi tải ảnh nhóm:", error);
          api.sendMessage(resultMessage, threadID, messageID);
        });
      } catch (error) {
        console.error("Lỗi khi lấy ảnh nhóm:", error);
        api.sendMessage(resultMessage, threadID, messageID);
      }
    } else {
      return api.sendMessage(resultMessage, threadID, messageID);
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra tương tác:", error);
    return api.sendMessage("❌ Có lỗi khi kiểm tra tương tác. Vui lòng thử lại sau!", event.threadID, event.messageID);
  }
}

async function getGroupInfo(api, event) {
  try {
    const { threadID, messageID } = event;
    
    const rentDataPath = pathModule.join(__dirname, 'data', 'thuebot.json');
    let rentData = [];
    
    if (fs.existsSync(rentDataPath)) {
      try {
        rentData = JSON.parse(fs.readFileSync(rentDataPath, 'utf8'));
      } catch (e) {
        console.error('Lỗi đọc file thuebot.json:', e);
      }
    }
    
    const rentInfo = rentData.find(item => item.t_id == threadID);
    
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "Không có tên";
    const approvalMode = threadInfo.approvalMode ? "bật" : "tắt";
    const emoji = threadInfo.emoji || "👍";
    const totalMembers = threadInfo.participantIDs.length;
    
    let gendernam = [], gendernu = [], bede = [];
    for (let z in threadInfo.userInfo) {
      const gioitinhone = threadInfo.userInfo[z].gender;
      const nName = threadInfo.userInfo[z].name;
      if (gioitinhone === "MALE") gendernam.push(nName);
      else if (gioitinhone === "FEMALE") gendernu.push(nName);
      else bede.push(nName);
    }
    const nam = gendernam.length;
    const nu = gendernu.length;
    const bedeCount = bede.length;
    
    const adminName = [];
    for (const arrayAdmin of threadInfo.adminIDs) {
      try {
        const name = (await api.getUserInfo(arrayAdmin.id))[arrayAdmin.id]?.name || "Không xác định";
        adminName.push(name);
      } catch (error) {
        adminName.push("Không xác định");
      }
    }
    
    let message = `⭐️ Box: ${threadName}\n`;
    
    if (rentInfo) {
      try {
        const userInfo = await api.getUserInfo(rentInfo.id);
        const userName = userInfo[rentInfo.id]?.name || "Không rõ";
        message += `👤 Người thuê: ${userName}\n`;
      } catch (error) {
        message += `👤 Người thuê: Không rõ\n`;
      }
    } else {
      message += `👤 Người thuê: không rõ\n`;
    }
    
    message += `🎮 ID: ${threadID}\n`;
    message += `📱 Phê duyệt: ${approvalMode}\n`;
    message += `🐰 Emoji: ${emoji}\n`;
    message += `───────────────────────\n`;
    message += `📌 Thành viên: ${totalMembers} thành viên\n`;
    message += `Số tv nam 🧑‍🦰: ${nam} thành viên\n`;
    message += `Số tv nữ 👩‍🦰: ${nu} thành viên\n`;
    message += `Số tv không xác định: ${bedeCount} thành viên\n`;
    
    if (adminName.length > 0) {
      message += `\n🕵️‍♂️ QTV (${adminName.length} người):\n`;
      for (let i = 0; i < adminName.length; i++) {
        message += `${i + 1}. ${adminName[i]}\n`;
      }
      message += `\n`;
    } else {
      message += `\n🕵️‍♂️ QTV (0 người)\n\n`;
    }
    
    message += `───────────────────────\n`;
    
    if (rentInfo) {
      message += `📆 Ngày Thuê: ${rentInfo.time_start}\n`;
      message += `⏳ Hết Hạn: ${rentInfo.time_end}\n`;
      
      const endDate = new Date(rentInfo.time_end.split('/').reverse().join('/'));
      const now = new Date();
      const timeDiff = endDate.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        message += `📌 Thời gian: ${days} ngày ${hours} giờ là hết hạn.\n`;
      } else {
        message += `📌 Thời gian: 0 ngày 0 giờ là hết hạn.\n`;
      }
    } else {
      message += `📆 Ngày Thuê: chưa thuê\n`;
    }
    
    if (threadInfo.imageSrc) {
      try {
        const imagePath = pathModule.join(__dirname, '/cache/group_avatar.jpg');
        const writer = fs.createWriteStream(imagePath);
        const response = await axios.get(threadInfo.imageSrc, { responseType: 'stream' });
        
        response.data.pipe(writer);
        
        writer.on('finish', () => {
          api.sendMessage({
            body: message,
            attachment: fs.createReadStream(imagePath)
          }, threadID, () => {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }, messageID);
        });
        
        writer.on('error', (error) => {
          console.error("Lỗi khi tải ảnh nhóm:", error);
          api.sendMessage(message, threadID, messageID);
        });
      } catch (error) {
        console.error("Lỗi khi lấy ảnh nhóm:", error);
        api.sendMessage(message, threadID, messageID);
      }
    } else {
      api.sendMessage(message, threadID, messageID);
    }
    
  } catch (error) {
    console.error("Lỗi khi lấy thông tin nhóm:", error);
    api.sendMessage("❌ Có lỗi khi lấy thông tin nhóm. Vui lòng thử lại sau!", event.threadID, event.messageID);
  }
}

async function getBotInfo(api, event) {
  try {
    const { threadID, messageID } = event;
    const start = Date.now();

    api.sendMessage("⏳ Đang lấy thông tin cấu hình hệ thống, vui lòng chờ...", threadID, messageID);

    const [
      cpu, mem, osInfo, disks, usage, gpuData,
      battery, ping, baseboard, graphics, memLayout, system
    ] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.diskLayout(),
      pidusage(process.pid),
      si.graphics(),
      si.battery(),
      si.inetLatency(),
      si.baseboard(),
      si.graphics(),
      si.memLayout(),
      si.system()
    ]);

    const gpuList = gpuData.controllers.map((gpu, index) => {
      return `• GPU ${index + 1}:
  - Tên: ${gpu.vendor || "Không rõ"} ${gpu.model || "Không rõ"}
  - VRAM: ${gpu.vram ? gpu.vram + " MB" : "Không rõ"}`;
    }).join("\n");

    const displayList = graphics.displays.map((d, i) => {
      return `• Màn hình ${i + 1}:
  - Model: ${d.model || "Không rõ"}
  - Chính: ${d.main ? "✅" : "❌"}`;
    }).join("\n");

    const ramInfo = memLayout.map((m, i) =>
      `• Thanh ${i + 1}: ${(m.size / 1024 / 1024 / 1024).toFixed(1)} GB - ${m.type || "?"}, ${m.clockSpeed || "?"} MHz, Hãng: ${m.manufacturer || "?"}`
    ).join("\n");

    const deviceInfo = battery.hasBattery
      ? `🖥️ 𝗧𝗛𝗜𝗘̂́𝗧 𝗕𝗜̣:
• Hãng: ${system.manufacturer || "Không rõ"}
• Model: ${system.model || "Không rõ"}

`
      : "";

    const msg =
`🤖 === 𝗧𝗛𝗢̂𝗡𝗚 𝗧𝗜𝗡 𝗛𝗘̣̂ 𝗧𝗛𝗢̂́𝗡𝗚 𝗕𝗢𝗧 𝗡𝗛𝗜 ===

${deviceInfo}🔹 𝗕𝗢 𝗠𝗔̣𝗖𝗛 𝗖𝗛𝗨̉
• Tên: ${baseboard.manufacturer} ${baseboard.model || "Không rõ"}

🔹 𝗖𝗣𝗨
• Tên: ${cpu.manufacturer} ${cpu.brand}
• Nhân: ${cpu.cores}, Luồng: ${cpu.physicalCores}
• Tốc độ: ${cpu.speed} GHz
• Mức sử dụng: ${usage.cpu.toFixed(1)}%

🔹 �_R𝗔𝗠
• Tổng: ${(mem.total / 1024 / 1024 / 1024).toFixed(1)} GB
• Trống: ${(mem.available / 1024 / 1024 / 1024).toFixed(1)} GB
• Bot đang dùng: ${formatBytes(usage.memory)}

🔹 𝗖𝗛𝗜 𝗧𝗜𝗘̂́𝗧 �_R𝗔𝗠
${ramInfo}

🔹 𝗢̛̉ Đ𝗜̃𝗔
${disks.map((d, i) =>
  `• Ổ ${i + 1}: ${d.name || "N/A"} - ${d.interfaceType || "?"}, ${(d.size / 1024 / 1024 / 1024).toFixed(0)} GB`
).join("\n")}

🔹 𝗚𝗣𝗨
${gpuList}

🔹 𝗠𝗔̀𝗡 𝗛𝗜̀𝗡𝗛
${displayList}

${battery.hasBattery ? `🔹 𝗣𝗜𝗡
• Dung lượng: ${battery.percent !== null && battery.percent !== undefined ? battery.percent + "%" : "Không rõ"}
• Trạng thái: ${battery.isCharging ? "Đang sạc" : "Không sạc"}` : "🔌 𝗣𝗜𝗡:X"}

🔹 𝗠𝗔̣𝗡𝗚
• Ping mạng hiện tại: ${ping !== null && ping !== undefined ? ping + " ms" : "Không rõ"}

🔹 𝗛𝗘̣̂ Đ𝗜𝗘̂̀𝗨 𝗛𝗔̀𝗡𝗛
• Nền tảng: ${osInfo.platform}
• Phiên bản: ${osInfo.build || osInfo.release}
• Kiến trúc: ${osInfo.arch}
• Uptime máy: ${formatUptime(os.uptime())}
• Uptime bot: ${formatUptime(process.uptime())}

🔹 𝗧𝗢̂́𝗖 Đ𝗢̣̂ 𝗕𝗢𝗧
• Phản hồi: ${(Date.now() - start)} ms

✨ Bot Nhi - Phiên bản 2.3.2`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage(`⚠️ Lỗi khi lấy thông tin hệ thống:\n${err.message}`, event.threadID, event.messageID);
  }
}

// Xoá file cache quá 1h
setInterval(() => {
  const cacheDir = pathModule.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) return;
  const now = Date.now();
  for (const file of fs.readdirSync(cacheDir)) {
    const filePath = pathModule.join(cacheDir, file);
    if (fs.statSync(filePath).mtimeMs < now - 3600000) {
      fs.unlinkSync(filePath);
    }
  }
}, 3600000);
=======
const fs = require('fs');
const path = require('path');
const { simi } = require('./../../includes/controllers/sim.js');

module.exports.config = {
    name: 'sim',
    version: '1.1.3',
    hasPermssion: 1,
    credits: 'no',
    description: 'Trò truyện cùng simi chat, có thể bật/tắt',
    commandCategory: 'Admin',
    usages: '[on/off]',
    cooldowns: 2,
};

const dataFilePath = path.resolve(__dirname, 'data/bot.json');

function loadData() {
    if (!fs.existsSync(dataFilePath)) return {};
    try {
        return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } catch (e) {
        console.error('Lỗi khi tải dữ liệu:', e);
        return {};
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Lỗi khi lưu dữ liệu:', e);
    }
}

module.exports.run = async function({ api, event, args }) {
    const threadID = event.threadID;
    const data = loadData();

    if (args[0] === 'on') {
        data[threadID] = true;
        saveData(data);
        return api.sendMessage('Đã bật chức năng trò chuyện cùng bot trong nhóm này!', threadID);
    } else if (args[0] === 'off') {
        data[threadID] = false;
        saveData(data);
        return api.sendMessage('Đã tắt chức năng trò chuyện cùng bot trong nhóm này!', threadID);
    } else {
        return api.sendMessage('Vui lòng sử dụng: [on/off] để bật hoặc tắt tính năng.', threadID);
    }
};

module.exports.handleEvent = async function({ api, event }) {
    const threadID = event.threadID;
    const message = event.body?.toLowerCase();

    const data = loadData();
    if (!data[threadID]) return;

    const keywords = ['Pie', 'Bot', 'bot đâu', 'bot off', 'bot ơi', 'bot xịn', 
        'kêu mọi người lên tương tác đi bot', 'chào bot', 'hello bot', 'pie', 'Pie', 'bye bot'];
    const responses = [
        'kêu em có gì hok 💓', 'ơi em nghe nè', 'có gì hog em nè',
        'em nè', 'kêu em có gì không', '💞 em nghe', 'em đây'
    ];

    if (!message || !keywords.includes(message)) return;

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    api.sendMessage(
        { body: randomResponse },
        threadID,
        (err, data) => {
            if (err) return console.error(err);
            global.client.handleReply.push({ name: this.config.name, messageID: data.messageID });
        },
        event.messageID
    );
};

module.exports.handleReply = async function({ handleReply: $, api, event }) {
    const threadID = event.threadID;
    const data = loadData();

    if (!data[threadID]) return;

    try {
        const response = await simi('ask', event.body);
        if (response.error || !response.answer) {
            return api.sendMessage('Bot gặp sự cố khi trả lời. Vui lòng thử lại sau!', threadID, event.messageID);
        }
        api.sendMessage(
            { body: response.answer },
            threadID,
            (err, data) => {
                if (err) return console.error(err);
                global.client.handleReply.push({ name: this.config.name, messageID: data.messageID });
            },
            event.messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage('Có lỗi xảy ra trong quá trình xử lý.', threadID, event.messageID);
    }
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
